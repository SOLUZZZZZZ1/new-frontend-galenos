// src/pages/DashboardMedico.jsx — Dashboard centrado en pacientes · Galenos.pro
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API =
  import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

export default function DashboardMedico() {
  const navigate = useNavigate();
  const token = localStorage.getItem("galenos_token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [patients, setPatients] = useState([]);

  // pacienteId -> { analytics: [...], imaging: [...] }
  const [patientDetails, setPatientDetails] = useState({});

  // Invitar a un colega (UI)
  const [inviteStatus, setInviteStatus] = useState("");

  // Texto invitación (simple, profesional y directo)
  const inviteText = useMemo(() => {
    return (
      "Hola! Estoy usando Galenos para analizar analíticas e imágenes médicas y para comentar casos clínicos de forma segura con otros médicos.\n\n" +
      "Puedes darte de alta gratis aquí:\n" +
      "https://galenos.pro"
    );
  }, []);

  async function copyInvite() {
    setInviteStatus("");
    try {
      await navigator.clipboard.writeText(inviteText);
      setInviteStatus("✅ Copiado. Ya puedes pegarlo en WhatsApp/Email.");
      setTimeout(() => setInviteStatus(""), 5000);
    } catch (e) {
      window.prompt("Copia este texto y compártelo:", inviteText);
      setInviteStatus("ℹ️ Si no se copió automáticamente, puedes copiarlo manualmente.");
      setTimeout(() => setInviteStatus(""), 5000);
    }
  }

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError("");

      if (!token) {
        setError("No hay sesión activa. Inicia sesión para ver el panel.");
        setLoading(false);
        return;
      }

      try {
        // 1) Cargar pacientes del médico
        const res = await fetch(`${API}/patients`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const raw = await res.text();
        console.log("👉 [Dashboard] /patients (raw):", raw);

        if (!res.ok) {
          setError("No se pudieron cargar los pacientes del médico.");
          setLoading(false);
          return;
        }

        let data;
        try {
          data = JSON.parse(raw);
        } catch (err) {
          console.error("❌ [Dashboard] Error parseando /patients:", err);
          setError("Respuesta inesperada del servidor de pacientes.");
          setLoading(false);
          return;
        }

        const patientsList = Array.isArray(data) ? data : [];
        setPatients(patientsList);

        // 2) Para cada paciente, traer analíticas e imágenes (solo primeros 10 para no saturar)
        const limitedPatients = patientsList.slice(0, 10);
        const details = {};

        await Promise.all(
          limitedPatients.map(async (p) => {
            const pid = p.id;
            details[pid] = { analytics: [], imaging: [] };

            // Analíticas
            try {
              const ra = await fetch(`${API}/analytics/by-patient/${pid}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (ra.ok) {
                const rawA = await ra.text();
                console.log(
                  `👉 [Dashboard] /analytics/by-patient/${pid} (raw):`,
                  rawA
                );
                try {
                  details[pid].analytics = JSON.parse(rawA);
                } catch (err) {
                  console.error(
                    `❌ [Dashboard] Error parseando analytics paciente ${pid}:`,
                    err
                  );
                }
              }
            } catch (err) {
              console.error(
                `❌ [Dashboard] Error cargando analytics paciente ${pid}:`,
                err
              );
            }

            // Imágenes
            try {
              const ri = await fetch(`${API}/imaging/by-patient/${pid}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (ri.ok) {
                const rawI = await ri.text();
                console.log(
                  `👉 [Dashboard] /imaging/by-patient/${pid} (raw):`,
                  rawI
                );
                try {
                  details[pid].imaging = JSON.parse(rawI);
                } catch (err) {
                  console.error(
                    `❌ [Dashboard] Error parseando imaging paciente ${pid}:`,
                    err
                  );
                }
              }
            } catch (err) {
              console.error(
                `❌ [Dashboard] Error cargando imaging paciente ${pid}:`,
                err
              );
            }
          })
        );

        setPatientDetails(details);
        setLoading(false);
      } catch (err) {
        console.error("❌ [Dashboard] Error general:", err);
        setError("No se pudo conectar con el servidor del panel.");
        setLoading(false);
      }
    }

    loadDashboard();
  }, [token]);

  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("es-ES");
  };

  function getPatientSummary(p) {
    const details = patientDetails[p.id] || { analytics: [], imaging: [] };
    const analytics = details.analytics || [];
    const imaging = details.imaging || [];

    const lastAnalytic = analytics.length > 0 ? analytics[0] : null;
    let alteredMarkers = 0;
    if (lastAnalytic && Array.isArray(lastAnalytic.markers)) {
      alteredMarkers = lastAnalytic.markers.filter(
        (m) => m.status === "elevado" || m.status === "bajo"
      ).length;
    }

    const lastImaging = imaging.length > 0 ? imaging[0] : null;

    const lastAnalyticDate =
      lastAnalytic?.exam_date || lastAnalytic?.created_at;
    const lastImagingDate =
      lastImaging?.exam_date || lastImaging?.created_at;

    let lastActivity = null;
    if (lastAnalyticDate && lastImagingDate) {
      lastActivity =
        new Date(lastAnalyticDate) > new Date(lastImagingDate)
          ? lastAnalyticDate
          : lastImagingDate;
    } else if (lastAnalyticDate) {
      lastActivity = lastAnalyticDate;
    } else if (lastImagingDate) {
      lastActivity = lastImagingDate;
    } else {
      lastActivity = p.created_at;
    }

    return {
      lastAnalytic,
      alteredMarkers,
      lastImaging,
      lastActivity,
    };
  }

  if (loading) {
    return (
      <div className="sr-container py-8">
        <p className="text-slate-600">Cargando panel global del médico…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sr-container py-8">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (!patients || patients.length === 0) {
    return (
      <div className="sr-container py-8 space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">
          Panel del médico · Galenos.pro
        </h1>
        <p className="text-sm text-slate-600">
          Todavía no has creado ningún paciente. Empieza creando tu primer
          paciente para trabajar con Galenos.
        </p>

        {/* Invitar a un colega (también aquí, por si aún no hay pacientes) */}
        <section className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
          <p className="text-sm font-semibold text-slate-900">
            🤝 Invitar a un colega
          </p>
          <p className="text-xs text-slate-600">
            Si Galenos te está siendo útil, invitar a otro médico ayuda a mejorar el proyecto y a crear una red de apoyo clínico segura.
          </p>
          <div className="flex flex-wrap gap-2 items-center">
            <button
              type="button"
              onClick={copyInvite}
              className="sr-btn-secondary text-xs"
            >
              Copiar mensaje de invitación
            </button>
            <button
              type="button"
              onClick={() => window.open("https://galenos.pro", "_blank")}
              className="sr-btn-secondary text-xs"
            >
              Abrir Galenos.pro
            </button>
          </div>
          {inviteStatus && (
            <p className="text-xs text-slate-500">{inviteStatus}</p>
          )}
        </section>

        <button
          type="button"
          onClick={() => navigate("/pacientes")}
          className="sr-btn-primary text-sm"
        >
          Ir a gestionar pacientes
        </button>
      </div>
    );
  }

  return (
    <div className="sr-container py-6 space-y-6">
      {/* CABECERA */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
            Panel del médico
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Resumen de tus pacientes, analíticas e imágenes recientes. Punto de
            partida para tu consulta.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate("/pacientes")}
            className="sr-btn-secondary text-xs sm:text-sm"
          >
            Ver todos los pacientes
          </button>
          <button
            type="button"
            onClick={() => navigate("/panel-medico")}
            className="sr-btn-secondary text-xs sm:text-sm"
          >
            Subir analítica / imagen
          </button>
        </div>
      </section>

      {/* INVITAR A UN COLEGA (Opción 1: Dashboard) */}
      <section className="bg-slate-50 rounded-xl border border-slate-200 p-4 sm:p-5 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-900">
              🤝 Invitar a un colega
            </p>
            <p className="text-xs text-slate-600">
              Si Galenos te está siendo útil, invitar a otro médico ayuda a mejorar el proyecto y a crear una red de apoyo clínico segura.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <button
              type="button"
              onClick={copyInvite}
              className="sr-btn-primary text-xs"
            >
              Copiar invitación
            </button>
            <button
              type="button"
              onClick={() => window.open("https://galenos.pro", "_blank")}
              className="sr-btn-secondary text-xs"
            >
              Abrir galenos.pro
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-700 whitespace-pre-line">
          {inviteText}
        </div>

        {inviteStatus && (
          <p className="text-xs text-slate-500">{inviteStatus}</p>
        )}

        <p className="text-[11px] text-slate-500">
          (Idea futura: pequeño distintivo de “benefactor” para quien apoye el proyecto. Sin rankings ni presión.)
        </p>
      </section>

      {/* RESUMEN RÁPIDO */}
      <section className="grid gap-3 sm:grid-cols-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Pacientes
          </p>
          <p className="text-2xl font-semibold text-slate-900">
            {patients.length}
          </p>
          <p className="text-xs text-slate-500">
            Pacientes dados de alta en Galenos.
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Analíticas recientes
          </p>
          <p className="text-2xl font-semibold text-slate-900">
            {
              Object.values(patientDetails).filter(
                (d) => d.analytics && d.analytics.length > 0
              ).length
            }
          </p>
          <p className="text-xs text-slate-500">
            Pacientes con al menos una analítica registrada.
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Estudios de imagen
          </p>
          <p className="text-2xl font-semibold text-slate-900">
            {
              Object.values(patientDetails).filter(
                (d) => d.imaging && d.imaging.length > 0
              ).length
            }
          </p>
          <p className="text-xs text-slate-500">
            Pacientes con al menos un estudio de imagen.
          </p>
        </div>
      </section>

      {/* LISTA DE PACIENTES (CON ALERTAS) */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          Pacientes recientes y estado clínico
        </h2>
        <p className="text-xs text-slate-600 mb-4">
          Vista rápida de tus pacientes: última actividad, analíticas recientes
          y estudios de imagen.
        </p>

        <div className="space-y-3">
          {patients.map((p) => {
            const summary = getPatientSummary(p);
            const lastA = summary.lastAnalytic;
            const lastI = summary.lastImaging;
            const hasAlerts = summary.alteredMarkers > 0;

            const displayId = p.patient_number || p.id;

            return (
              <div
                key={p.id}
                className="border border-slate-200 rounded-lg px-3 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {p.alias}{" "}
                    <span className="text-xs font-normal text-slate-500">
                      · ID {displayId}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500">
                    Última actividad: {formatDate(summary.lastActivity)}
                  </p>

                  {lastA ? (
                    <p className="text-xs text-slate-700">
                      <span className="font-semibold">Última analítica:</span>{" "}
                      {formatDate(lastA.exam_date || lastA.created_at)}{" "}
                      {summary.alteredMarkers > 0 ? (
                        <span className="text-red-600 font-medium">
                          · {summary.alteredMarkers} marcadores alterados
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-medium">
                          · Sin marcadores alterados relevantes
                        </span>
                      )}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500">
                      No hay analíticas registradas aún.
                    </p>
                  )}

                  {lastI ? (
                    <p className="text-xs text-slate-700">
                      <span className="font-semibold">Última imagen:</span>{" "}
                      {lastI.type || "Estudio de imagen"} ·{" "}
                      {formatDate(lastI.exam_date || lastI.created_at)}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500">
                      No hay estudios de imagen registrados aún.
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-start sm:items-end gap-2">
                  {hasAlerts && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-800">
                      ⚠ Marcadores alterados en la última analítica
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => navigate(`/PacienteDetalle/${p.id}`)}
                    className="sr-btn-secondary text-xs"
                  >
                    Ver ficha del paciente
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
