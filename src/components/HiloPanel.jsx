import React, { useEffect, useState } from "react";
import RespuestaInput from "./RespuestaInput";

export default function HiloPanel({ selectedCaseId, apiBase, token }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  function formatMadridDate(createdAt) {
    if (!createdAt) return "";

    // Si viene sin "Z", lo tratamos como UTC añadiéndosela.
    const iso =
      typeof createdAt === "string" && createdAt.endsWith("Z")
        ? createdAt
        : `${createdAt}Z`;

    try {
      return new Date(iso).toLocaleString("es-ES", {
        timeZone: "Europe/Madrid",
      });
    } catch {
      return String(createdAt);
    }
  }

  async function loadMessages() {
    if (!selectedCaseId || !token) return;

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
        setError("No se pudieron cargar los mensajes.");
        return;
      }

      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        setError("Respuesta inesperada al cargar mensajes.");
        return;
      }

      setMessages(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      console.error("❌ Error cargando mensajes:", err);
      setError("Error de conexión al cargar mensajes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCaseId]);

  async function handleSendMessage(text) {
    const content = (text ?? "").toString().trim();
    if (!content) return;
    if (!selectedCaseId || !token) {
      setError("No hay sesión activa o no hay caso seleccionado.");
      return;
    }

    const payload = { content }; // ✅ modo A: alias lo saca backend
    console.log("👉 [DeGuardia] POST /messages payload:", payload);

    try {
      setSending(true);
      setError("");

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
        setError("No se pudo enviar el mensaje.");
        return;
      }

      let newMsg;
      try {
        newMsg = JSON.parse(raw);
      } catch {
        await loadMessages();
        return;
      }

      setMessages((prev) => [...prev, newMsg]);
    } catch (err) {
      console.error("❌ Error enviando mensaje:", err);
      setError("Error de conexión al enviar el mensaje.");
    } finally {
      setSending(false);
    }
  }

  if (!selectedCaseId) {
    return (
      <p className="text-sm text-gray-500">
        Selecciona una consulta de la cartelera para ver el hilo y responder.
      </p>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-3 p-3">
        {loading && <p className="text-sm text-gray-500">Cargando mensajes…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {messages.map((m) => (
          <div key={m.id} className="border rounded p-2 bg-white shadow-sm">
            <p className="text-xs text-gray-500 mb-1">
              {m.author_alias || "anónimo"}
              {m.created_at ? " · " : ""}
              {m.created_at ? formatMadridDate(m.created_at) : ""}
            </p>
            <p className="text-sm whitespace-pre-line">
              {typeof m.clean_content === "string"
                ? m.clean_content
                : JSON.stringify(m.clean_content)}
            </p>
          </div>
        ))}
      </div>

      <RespuestaInput onSend={handleSendMessage} sending={sending} />
    </div>
  );
}
