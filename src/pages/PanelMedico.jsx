// src/pages/PanelMedico.jsx — Panel del médico con secciones básicas
import React, { useState } from "react";
import Patients from "./Patients.jsx";

// URL del backend de Galenos (Render)
// En producción: VITE_API_URL debe ser https://galenos-backend.onrender.com
const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const TABS = [
  { id: "resumen", label: "Resumen" },
  { id: "analiticas", label: "Analíticas (demo)" },
  { id: "agenda", label: "Agenda" },
  { id: "ajustes", label: "Ajustes" },
];

export default function PanelMedico() {
  const email = localStorage.getItem("galenos_email") || "médico en prueba";
  const [tab, setTab] = useState("resumen");

  console.log("🔥 API usada en PanelMedico:", API);

  async function handleActivateGalenosPro() {
    try {
      console.log("👉 handleActivateGalenosPro llamado");
      console.log("👉 Llamando a:", `${API}/billing/create-checkout-session`);

      // Versión GET (para evitar problemas 405)
      const res = await fetch(`${API}/billing/create-checkout-session`, {
        method: "GET",
      });

      console.log("👉 Respuesta Stripe status:", res.status);
      const rawText = await res.text();
      console.log("👉 Respuesta Stripe texto bruto:", rawText);

      if (!res.ok) {
        alert("Stripe devolvió error " + res.status + ". Mira la consola (F12 → Console).");
        return;
      }

      let data;
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        console.error("❌ No se pudo parsear JSON de Stripe:", e);
        alert("Respuesta de Stripe no es JSON. Mira la consola.");
        return;
      }

      if (data.checkout_url) {
        console.log("👉 Redirigiendo a checkout_url:", data.checkout_url);
        window.location.href = data.checkout_url;
      } else {
        console.warn("⚠ Respuesta sin checkout_url:", data);
        alert("Respuesta inesperada del servidor de pagos. Mira la consola.");
      }
    } catch (e) {
      console.error("❌ Error en fetch billing:", e);
      alert("Error al conectar con el servidor de pagos (fetch).");
    }
  }

  return (
    <main
      className="sr-container py-6 md:py-8"
      style={{ minHeight: "calc(100vh - 140px)" }}
    >
      <section className="sr-card mb-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="sr-h1 m-0">Panel del Médico</h1>
            <p className="sr-small text-slate-600 mt-1">
              Sesión: <b>{email}</b>
            </p>
            <p className="sr-p mt-2">
              Esta es la versión inicial del panel de Galenos.pro. Desde aquí
              irás viendo aparecer las nuevas funciones: analíticas con IA,
              historial de pacientes, agenda y más.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <button
              type="button"
              className="sr-btn-primary text-xs sm:text-sm"
              onClick={handleActivateGalenosPro}
            >
              Activar Galenos PRO · 10 €/mes
              <span className="sr-small block text-[10px] text-sky-100">
                3 días de prueba gratuita
              </span>
            </button>
            <span className="sr-small text-slate-500">
              Estado: <b>Demo funcional</b>
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-xl text-sm border ${
                tab === t.id
                  ? "border-sky-500 bg-sky-50 text-sky-700"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {tab === "resumen" && (
        <section className="sr-card">
          <h2 className="sr-h1 mb-3 text-xl">Resumen</h2>
          <p className="sr-p mb-3">
            Aquí verás, en futuras versiones, un resumen rápido de tus
            pacientes, analíticas recientes y alertas suaves. De momento,
            puedes probar el flujo de analíticas en la pestaña{" "}
            <b>“Analíticas (demo)”</b>.
          </p>
          <ul className="sr-list space-y-1">
            <li>Últimas analíticas subidas por paciente.</li>
            <li>Cambios relevantes detectados por la IA.</li>
            <li>Recordatorios de revisiones pendientes.</li>
            <li>Accesos rápidos a casos clínicos y agenda.</li>
          </ul>
        </section>
      )}

      {tab === "analiticas" && <Patients />}

      {tab === "agenda" && (
        <section className="sr-card">
          <h2 className="sr-h1 mb-3 text-xl">Agenda (próximamente)</h2>
          <p className="sr-p">
            En esta sección podrás ver tus revisiones, alertas de seguimiento y
            citas programadas con tus pacientes. Se integrará, si lo deseas, con
            tu calendario habitual.
          </p>
        </section>
      )}

      {tab === "ajustes" && (
        <section className="sr-card">
          <h2 className="sr-h1 mb-3 text-xl">Ajustes (próximamente)</h2>
          <p className="sr-p">
            Aquí podrás configurar tus preferencias, idioma, notificaciones,
            país de facturación y otros detalles de tu cuenta de médico.
          </p>
        </section>
      )}
    </main>
  );
}
