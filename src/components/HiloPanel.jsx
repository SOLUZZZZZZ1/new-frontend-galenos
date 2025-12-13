// src/components/HiloPanel.jsx
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

  useEffect(() => {
    if (!selectedCaseId) return;

    const loadMessages = async () => {
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

        const data = await res.json();
        setMessages(data.items || []);
      } catch (err) {
        console.error(err);
        setError("Error cargando mensajes");
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [selectedCaseId, apiBase, token]);

  async function handleSendMessage(text) {
    if (!text || !text.trim()) return;

    try {
      const payload = {
        content: text,                          // 👈 STRING
        author_alias: currentAlias || "loquito" // 👈 ALIAS CORRECTO
      };

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

      if (!res.ok) {
        throw new Error("Error enviando mensaje");
      }

      const newMsg = await res.json();
      setMessages((prev) => [...prev, newMsg]);
    } catch (err) {
      console.error(err);
      setError("No se pudo enviar el mensaje");
    }
  }

  if (!selectedCaseId) {
    return (
      <p className="text-sm text-gray-500">
        Selecciona una consulta para ver el hilo.
      </p>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-3 p-3">
        {loading && <p className="text-sm">Cargando mensajes…</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}

        {messages.map((m) => (
          <div
            key={m.id}
            className="border rounded p-2 bg-white shadow-sm"
          >
            <p className="text-xs text-gray-500 mb-1">
              {m.author_alias || "anónimo"}
            </p>
            <p className="text-sm whitespace-pre-line">
              {m.clean_content}
            </p>
          </div>
        ))}
      </div>

      <RespuestaInput onSend={handleSendMessage} />
    </div>
  );
}
