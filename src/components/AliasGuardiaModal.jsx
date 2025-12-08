
import React, { useState } from "react";

/**
 * Modal para elegir el alias de guardia la primera vez.
 * Se apoya en /doctor/profile/me (PATCH) usando guard_alias,
 * pero si el backend todavía no lo tiene, se puede adaptar fácilmente.
 */
export default function AliasGuardiaModal({ isOpen, apiBase, token, onAliasSaved }) {
  const [alias, setAlias] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  async function handleSave(e) {
    e.preventDefault();
    setError("");

    const clean = alias.trim();
    if (!clean) {
      setError("El alias de guardia no puede estar vacío.");
      return;
    }
    if (clean.length < 3 || clean.length > 40) {
      setError("El alias debe tener entre 3 y 40 caracteres.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`${apiBase}/doctor/profile/guard-alias`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ guard_alias: clean }),
      });

      const raw = await res.text();
      console.log("👉 [DeGuardia] POST /doctor/profile/guard-alias (raw):", raw);

      if (!res.ok) {
        let msg = "No se pudo guardar el alias de guardia.";
        try {
          const errData = JSON.parse(raw);
          if (errData.detail) msg = errData.detail;
        } catch {}
        setError(msg);
        return;
      }

      onAliasSaved(clean);
    } catch (err) {
      console.error("❌ [DeGuardia] Error guardando alias:", err);
      setError("Error de conexión al guardar el alias.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">
          Elige tu alias de guardia
        </h2>
        <p className="text-sm text-slate-600">
          Este alias verán otros médicos cuando participes en la cartelera de guardia.
          No uses tu nombre completo ni datos que te identifiquen directamente.
        </p>

        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="sr-label text-xs">Alias de guardia</label>
            <input
              className="sr-input w-full text-sm"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="Ej. pepito22, cardio_md, guardia_noche"
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="sr-btn-primary w-full text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Guardando alias…" : "Guardar alias y entrar en De guardia"}
          </button>
        </form>

        <p className="text-[11px] text-slate-500">
          Una vez uses este alias en De guardia quedará fijado para tus próximas guardias.
        </p>
      </div>
    </div>
  );
}
