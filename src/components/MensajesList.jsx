
import React from "react";
import MensajeBubble from "./MensajeBubble.jsx";

/**
 * Lista de mensajes del hilo.
 */
export default function MensajesList({ messages, currentAlias }) {
  if (!messages || messages.length === 0) {
    return (
      <p className="text-xs text-slate-500 py-4">
        Todavía no hay respuestas en esta consulta. Sé el primero en aportar tu enfoque clínico.
      </p>
    );
  }

  return (
    <div className="space-y-2 pr-1">
      {messages.map((m) => (
        <MensajeBubble
          key={m.id}
          message={m}
          isMine={m.author_alias === currentAlias}
        />
      ))}
    </div>
  );
}
