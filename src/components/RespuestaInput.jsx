// src/components/RespuestaInput.jsx
import React, { useState } from "react";

export default function RespuestaInput({ onSend }) {
  const [text, setText] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (!text.trim()) return;

    onSend(text);   // 👈 SOLO STRING
    setText("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t p-3 flex gap-2 bg-gray-50"
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 border rounded p-2 text-sm"
        rows={2}
        placeholder="Escribe tu respuesta…"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded text-sm"
      >
        Enviar
      </button>
    </form>
  );
}
