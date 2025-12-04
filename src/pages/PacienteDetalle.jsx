// PacienteDetalle.jsx — versión corregida con marcadores en la lista de analíticas
// (archivo completo, listo para reemplazar tu PacienteDetalle.jsx actual)

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const API =
  import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

export default function PacienteDetalle() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState("");

  const token = localStorage.getItem("galenos_token");

  const [analytics, setAnalytics] = useState([]);
  const [imaging, setImaging] = useState([]);
  const [notes, setNotes] = useState([]);
  const [timeline, setTimeline] = useState([]);

  const [open, setOpen] = useState({
    datos: true,
    analiticas: false,
    imagenes: false,
    notas: false,
    timeline: false,
  });

  const [focusedEvent, setFocusedEvent] = useState(null);

  function toggle(block) {
    setOpen((prev) => ({ ...prev, [block]: !prev[block] }));
  }

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      setError("");

      if (!id || !token) {
        setLoading(false);
        setError("Falta identificador de paciente o token.");
        return;
      }

      try {
        const p = await fetch(`${API}/patients/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!p.ok) {
          setError("No se pudieron cargar los datos del paciente.");
          setLoading(false);
          return;
        }

        const patientData = await p.json();
        setPatient(patientData);
      } catch {
        setError("No se pudieron cargar los datos del paciente.");
        setLoading(false);
        return;
      }

      try {
        const a = await fetch(`${API}/analytics/by-patient/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (a.ok) setAnalytics(await a.json());
      } catch {}

      try {
        const i = await fetch(`${API}/imaging/by-patient/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (i.ok) setImaging(await i.json());
      } catch {}

      try {
        const n = await fetch(`${API}/notes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (n.ok) setNotes(await n.json());
      } catch {}

      try {
        const t = await fetch(`${API}/timeline/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (t.ok) setTimeline(await t.json());
      } catch {}

      setLoading(false);
    }

    loadAll();
  }, [id, token]);

  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString();
  };

  return (
    <div className="sr-container py-6 space-y-6">

      {/* ===================== */}
      {/* CABECERA PACIENTE */}
      {/* ===================== */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          Paciente: {patient?.alias || `ID ${patient?.id}`}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          ID interno: <span className="font-mono">{patient?.id}</span>
        </p>
      </section>

      {/* ===================== */}
      {/* ANALÍTICAS */}
      {/* ===================== */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200">
        <button
          onClick={() => toggle("analiticas")}
          className="w-full flex items-center justify-between px-4 py-3 border-b border-slate-200 hover:bg-slate-50"
        >
          <span className="font-semibold text-slate-800">Analíticas</span>
          <span className="text-sm text-slate-500">
            {open.analiticas ? "Ocultar" : "Mostrar"}
          </span>
        </button>

        {open.analiticas && (
          <div className="px-4 py-4 space-y-4">
            {analytics.length === 0 ? (
              <p className="text-sm text-slate-500">No hay analíticas.</p>
            ) : (
              analytics.map((a) => (
                <div
                  key={a.id}
                  className="border border-slate-200 rounded-lg px-3 py-2 space-y-2"
                >
                  <p className="font-medium text-slate-800">
                    Fecha: {formatDate(a.created_at)}
                  </p>

                  {a.summary && (
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {a.summary}
                    </p>
                  )}

                  {/* ===================== */}
                  {/* TABLA DE MARCADORES */}
                  {/* ===================== */}
                  {Array.isArray(a.markers) && a.markers.length > 0 && (
                    <div className="mt-2 overflow-x-auto">
                      <table className="min-w-full text-xs border border-slate-200 rounded-md overflow-hidden">
                        <thead className="bg-slate-100">
                          <tr>
                            <th className="px-2 py-1 text-left">Marcador</th>
                            <th className="px-2 py-1 text-left">Valor</th>
                            <th className="px-2 py-1 text-left">Rango</th>
                            <th className="px-2 py-1 text-left">Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {a.markers.map((m, idx) => (
                            <tr key={idx} className="border-t border-slate-200">
                              <td className="px-2 py-1">{m.name}</td>
                              <td className="px-2 py-1">{m.value ?? ""}</td>
                              <td className="px-2 py-1">{m.range ?? ""}</td>
                              <td className="px-2 py-1">
                                {m.status === "elevado" && (
                                  <span className="text-red-600 font-medium">
                                    Alto
                                  </span>
                                )}
                                {m.status === "bajo" && (
                                  <span className="text-amber-600 font-medium">
                                    Bajo
                                  </span>
                                )}
                                {m.status === "normal" && (
                                  <span className="text-emerald-700 font-medium">
                                    Normal
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
}
