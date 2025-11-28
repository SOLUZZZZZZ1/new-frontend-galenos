// src/pages/Patients.jsx — Subida de analítica demo + resultados
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
      const res = await fetch(`${API}/uploads`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        throw new Error("Respuesta no válida del servidor");
      }
      const data = await res.json();
      setResult(data.extraction || null);
    } catch (e) {
      console.error(e);
      alert("Error subiendo o procesando la analítica (demo).");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="sr-card">
      <h2 className="sr-h1 mb-3 text-xl">Analíticas · Demo</h2>
      <p className="sr-p mb-4">
        Sube una analítica en PDF o imagen. En esta versión demo, el backend
        devolverá unos valores simulados para probar el flujo de trabajo de
        Galenos.pro.
      </p>

      <div className="grid md:grid-cols-2 gap-5 items-start">
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
            {loading ? "Procesando..." : "Subir y procesar analítica"}
          </button>
        </div>

        <div className="border border-dashed border-slate-200 rounded-2xl p-4 min-h-[140px]">
          {!result ? (
            <p className="sr-p text-slate-500">
              Cuando subas una analítica, aquí aparecerá una tabla con los
              marcadores detectados (demo).
            </p>
          ) : (
            <div>
              <h3 className="font-semibold mb-2 text-slate-900">
                Resultados extraídos (demo)
              </h3>
              <p className="sr-small mb-2 text-slate-500">
                Paciente: <b>{result.patient_alias}</b>
              </p>
              <ul className="sr-list">
                {result.markers?.map((m, idx) => (
                  <li key={idx}>
                    {m.name}:{" "}
                    <strong>
                      {m.value} {m.unit}
                    </strong>{" "}
                    (ref {m.ref_min}–{m.ref_max})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
