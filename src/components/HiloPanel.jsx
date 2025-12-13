import React, { useEffect, useState } from "react";
import RespuestaInput from "./RespuestaInput";

export default function HiloPanel({
  selectedCaseId,
  apiBase,
  token,
  currentAlias,
}) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadMessages() {
    if (!selectedCaseId) return;
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `${apiBase}/guard/cases/${selectedCaseId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const raw = await res.text();
      console.log("👉 [DeGuardia] GET /messages raw:", raw);

      if (!res.ok) {
        setError("Error cargando mensajes");
        return;
      }

      const data = JSON.parse(raw);
      setMessages(data.items || []);
    } catch (err) {
      console.error(err);
      setError("Error cargando mensajes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCaseId]);

  async function handleSendMessage(text) {
    setError("");

    const content = (text || "").trim();
    if (!content) return;

    const payload = {
      author_alias: currentAlias || "loquito",
      content,
    };

    console.log("👉 [DeGuardia] POST payload:", payload);

    try {
      const res = await fetch(
        `${apiBase}/guard/cases/${selectedCaseId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const raw = await res.text();
      console.log("👉 [DeGuardia] POST /messages raw:", raw);

      if (!res.ok) {
        setError("No se pudo enviar el mensaje");
        return;
      }

      const newMsg = JSON.parse(raw);
      setMessages((prev) => [...prev, newMsg]);
    } catch (err) {
      console.error(err);
      setError("No se pudo enviar el mensaje");
    }
  }

  if (!selectedCaseId) {
    return (
      <p className="text-sm text-gray-500">
        Selecciona una consulta de la cartelera para ver el caso clínico y el hilo.
      </p>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-3 p-3">
        {loading && <p className="text-sm">Cargando mensajes…</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}

        {messages.map((m) => (
          <div key={m.id} className="border rounded p-2 bg-white shadow-sm">
            <p className="text-xs text-gray-500 mb-1">
              {m.author_alias || "anónimo"} ·{" "}
              {m.created_at ? new Date(m.created_at).toLocaleString("es-ES") : ""}
            </p>
            <p className="text-sm whitespace-pre-line">{m.clean_content}</p>
          </div>
        ))}
      </div>

      <RespuestaInput onSend={handleSendMessage} />
    </div>
  );
}
