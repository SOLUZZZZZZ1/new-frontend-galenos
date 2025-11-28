// src/pages/Patients.jsx — Subida de analítica + IA (summary + differential)
import React, { useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function Patients() {
  const [patient, setPatient] = useState("Paciente A");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onUpload() {
    if (!file) {
      alert("Selecciona un PDF o imagen de analítica");
      return;
    }

    const fd = new FormData();
    fd.append("file", file);
    fd.append("patient_alias", patient);

    try {
      setLoading(true);
      setResult(null);

      const res = await fetch(`${API}/uploads`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        throw new Error(`Error HTTP ${res.status}`);
      }

      const data = await res.json();
      setResult(data.extraction || null);
    } catch (e) {
      console.error(e);
      alert("Error subiendo o procesando la analítica. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="sr-card">
      <h2 className="sr-h1 mb-3 text-xl">Analíticas · IA (MVP)</h2>
      <p className="sr-p mb-4">
        Sube una analítica en PDF o imagen. Esta versión MVP utiliza marcadores
        de ejemplo y pide a la IA que genere un resumen clínico orientativo y
        un diagnóstico diferencial a valorar. La decisión final es siempre del
        médico responsable.
      </p>

      <div className="grid md:grid-cols-2 gap-5 items-start">
        {/* Columna izquierda: formulario */}
        <div className="space-y-3">
          <div>
            <label className="sr-label">Alias del paciente</label>
            <input
              className="sr-input mt-1"
              value={patient}
              onChange={(e) => setPatient(e.target.value)}
            />
          </div>

          <div>
            <label className="sr-label">Analítica (PDF o imagen)</label>
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mt-1 block w-full text-sm"
            />
          </div>

          <button
            type="button"
            onClick={onUpload}
            className="sr-btn-primary"
            disabled={loading}
          >
            {loading ? "Procesando con IA..." : "Subir y analizar con IA"}
          </button>

          <p className="sr-small text-slate-500">
            Galenos.pro no diagnostica ni prescribe. Es una herramienta de
            apoyo al médico.
          </p>
        </div>

        {/* Columna derecha: resultados */}
        <div className="border border-dashed border-slate-200 rounded-2xl p-4 min-h-[160px] space-y-3">
          {!result ? (
            <p className="sr-p text-slate-500">
              Cuando subas una analítica, aquí aparecerán los marcadores
              detectados junto con un resumen orientativo generado por IA.
            </p>
          ) : (
            <>
              <div>
                <h3 className="font-semibold mb-1 text-slate-900">
                  Resultados extraídos
                </h3>
                <p className="sr-small mb-2 text-slate-500">
                  Paciente: <b>{result.patient_alias}</b>
                </p>
                {result.markers && result.markers.length > 0 ? (
                  <ul className="sr-list">
                    {result.markers.map((m, idx) => (
                      <li key={idx}>
                        {m.name}:{" "}
                        <strong>
                          {m.value} {m.unit}
                        </strong>{" "}
                        {m.ref_min != null && m.ref_max != null && (
                          <span className="sr-small">
                            {" "}
                            (ref {m.ref_min}–{m.ref_max})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="sr-p text-slate-500">
                    No se han recibido marcadores en la respuesta.
                  </p>
                )}
              </div>

              {/* Resumen IA */}
              {result.summary && (
                <div className="mt-3">
                  <h4 className="font-semibold mb-1 text-slate-900 text-sm">
                    Resumen clínico orientativo (IA)
                  </h4>
                  <p className="sr-p text-slate-700">{result.summary}</p>
                </div>
              )}

              {/* Diagnóstico diferencial sugerido */}
              {result.differential && result.differential.length > 0 && (
                <div className="mt-3">
                  <h4 className="font-semibold mb-1 text-slate-900 text-sm">
                    Posibles causas / diagnóstico diferencial a valorar
                  </h4>
                  <ul className="sr-list">
                    {result.differential.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                  <p className="sr-small text-slate-500 mt-1">
                    La decisión final y la interpretación de la analítica
                    corresponden siempre al médico responsable.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
