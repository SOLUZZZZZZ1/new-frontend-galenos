
import React, { useState } from "react";

/**
 * Caja de respuesta inferior: envía mensaje al hilo de guardia.
 */
export default function RespuestaInput({ onSend }) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!value.trim()) {
      setError("Escribe una aportación clínica antes de enviar.");
      return;
    }

    try {
      setSending(true);
      await onSend(value.trim());
      setValue("");
    } catch (err) {
      setError(err.message || "No se pudo enviar tu mensaje.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        className="sr-input w-full min-h-[70px] text-xs"
        placeholder="Escribe tu aportación clínica (sin nombres, teléfonos, direcciones ni datos identificativos del paciente)…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {error && <p className="text-[11px] text-red-600">{error}</p>}
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] text-slate-500">
          La IA revisará tu mensaje antes de publicarlo para proteger la privacidad del paciente.
        </p>
        <button
          type="submit"
          disabled={sending}
          className="sr-btn-secondary text-xs disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {sending ? "Enviando…" : "Enviar respuesta"}
        </button>
      </div>
    </form>
  );
}
