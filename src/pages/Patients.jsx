// src/pages/Patients.jsx — Analíticas · IA (MVP) para Galenos.pro
import React, { useState } from "react";

// URL del backend de Galenos (Render)
// En producción: VITE_API_URL debe ser https://galenos-backend.onrender.com
const API = import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

export default function Patients() {
  const [alias, setAlias] = useState("Paciente A");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!file) {
      setError("Por favor, sube una analítica en PDF o imagen.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("alias", alias);
      formData.append("file", file);

      console.log("🔥 Enviando analítica a:", `${API}/analytics/analyze`);

      const res = await fetch(`${API}/analytics/analyze`, {
        method: "POST",
        body: formData,
      });

      const raw = await res.text();
      console.log("👉 Respuesta IA (raw):", raw);

      if (!res.ok) {
        setError(`Error del servidor (${res.status}). Mira la consola.`);
        return;
      }

      const data = JSON.parse(raw);
      setResult(data);
    } catch (err) {
      console.error("❌ Error al llamar a IA de analíticas:", err);
      setError("No se ha podido conectar con el backend de IA.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="space-y-4">
      <div className="border-b border-slate-200 pb-3 mb-3">
        <h2 className="sr-h1 text-xl mb-1">Analíticas · IA (MVP)</h2>
        <p className="sr-p text-sm text-slate-600">
          Sube una analítica en PDF o imagen. Esta versión MVP utiliza marcadores de ejemplo y
          genera un resumen clínico orientativo y un diagnóstico diferencial a valorar.
          La decisión final es siempre del médico responsable.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sr-card">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
          <div className="flex-1">
            <label className="sr-label" htmlFor="alias">
              Alias del paciente
            </label>
            <input
              id="alias"
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              className="sr-input w-full"
              placeholder="Ej. Paciente A"
            />
          </div>

          <div className="flex-1">
            <label className="sr-label" htmlFor="file">
              Analítica (PDF o imagen)
            </label>
            <input
              id="file"
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => setFile(e.target.files[0] || null)}
              className="sr-input w-full bg-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={uploading}
            className="sr-btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {uploading ? "Procesando con IA..." : "Enviar a IA"}
          </button>
          {file && (
            <span className="sr-small text-slate-600 truncate max-w-xs">
              {file.name}
            </span>
          )}
        </div>

        {error && (
          <p className="sr-small text-red-600">
            {error}
          </p>
        )}
      </form>

      <div className="sr-card space-y-3">
        <p className="sr-small text-slate-500">
          Galenos.pro no diagnostica ni prescribe. Es una herramienta de apoyo al médico.
        </p>

        {!result && !uploading && (
          <p className="sr-p text-sm text-slate-500">
            Cuando subas una analítica, aquí aparecerán los marcadores detectados junto con un
            resumen orientativo generado por IA. Esta versión MVP usa datos de ejemplo.
          </p>
        )}

        {uploading && (
          <p className="sr-p text-sm text-slate-600">
            Procesando con IA...
          </p>
        )}

        {result && (
          <div className="space-y-3">
            <div>
              <h3 className="sr-h1 text-lg mb-1">Resultado para {result.patient_alias}</h3>
              <p className="sr-small text-slate-500">
                Fichero: <span className="font-mono text-xs">{result.file_name}</span>
              </p>
            </div>

            <div>
              <h4 className="sr-h1 text-base mb-1">Marcadores (demo)</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left border-b border-slate-200">Parámetro</th>
                      <th className="px-3 py-2 text-left border-b border-slate-200">Valor</th>
                      <th className="px-3 py-2 text-left border-b border-slate-200">Rango</th>
                      <th className="px-3 py-2 text-left border-b border-slate-200">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.markers?.map((m, idx) => (
                      <tr key={idx} className="odd:bg-white even:bg-slate-50">
                        <td className="px-3 py-2 border-b border-slate-100">{m.name}</td>
                        <td className="px-3 py-2 border-b border-slate-100">{m.value}</td>
                        <td className="px-3 py-2 border-b border-slate-100">{m.range}</td>
                        <td className="px-3 py-2 border-b border-slate-100">
                          <span
                            className={
                              m.status === "normal"
                                ? "text-emerald-600"
                                : "text-amber-700 font-medium"
                            }
                          >
                            {m.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 className="sr-h1 text-base mb-1">Resumen orientativo</h4>
              <p className="sr-p text-sm whitespace-pre-line">
                {result.summary}
              </p>
            </div>

            <div>
              <h4 className="sr-h1 text-base mb-1">Diagnóstico diferencial (orientativo)</h4>
              <p className="sr-p text-sm whitespace-pre-line">
                {result.differential}
              </p>
            </div>

            <p className="sr-small text-slate-500 mt-2">
              {result.disclaimer}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
