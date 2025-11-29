// src/pages/PanelMedico.jsx — Panel del médico con tabs y botón Galenos PRO
import React, { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import Patients from "./Patients.jsx";

// URL del backend de Galenos (Render)
// En producción: VITE_API_URL debe ser https://galenos-backend.onrender.com
// Fallback: backend en Render (para evitar 127.0.0.1 en producción)
const API = import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

const TABS = [
  { id: "resumen", label: "Resumen" },
  { id: "analiticas", label: "Analíticas (demo)" },
  { id: "agenda", label: "Agenda" },
  { id: "ajustes", label: "Ajustes" },
];

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function PanelMedico() {
  const [tab, setTab] = useState("resumen");
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const query = useQuery();
  const checkoutStatus = query.get("checkout");

  async function handleActivateGalenosPro() {
    try {
      setLoadingCheckout(true);
      console.log("🔥 API usada en PanelMedico:", API);
      console.log("👉 handleActivateGalenosPro llamado");
      console.log("👉 Llamando a:", `${API}/billing/create-checkout-session`);

      const res = await fetch(`${API}/billing/create-checkout-session`, {
        method: "GET",
      });

      console.log("👉 Respuesta Stripe status:", res.status);
      const rawText = await res.text();
      console.log("👉 Respuesta Stripe texto bruto:", rawText);

      if (!res.ok) {
        alert(
          "Stripe devolvió error " +
            res.status +
            ". Mira la consola (F12 → Console)."
        );
        return;
      }

      const data = JSON.parse(rawText);
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        alert("Respuesta de Stripe sin checkout_url. Mira la consola.");
      }
    } catch (err) {
      console.error("❌ Error al activar Galenos PRO:", err);
      alert("Error al conectar con el servidor de pagos (fetch).");
    } finally {
      setLoadingCheckout(false);
    }
  }

  return (
    <main className="sr-container py-6 space-y-6">
      <header className="sr-card flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="sr-h1 mb-1 text-2xl">Panel del médico</h1>
          <p className="sr-p text-slate-600">
            Gestiona tus pacientes, revisa analíticas y activa Galenos PRO para
            desbloquear todas las funciones.
          </p>
        </div>
        <div className="flex flex-col gap-2 items-stretch sm:flex-row sm:items-center sm:gap-3">
          <button
            type="button"
            onClick={handleActivateGalenosPro}
            disabled={loadingCheckout}
            className="inline-flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loadingCheckout
              ? "Conectando con Stripe…"
              : "Activar Galenos PRO · 10 €/mes"}
          </button>
          <span className="text-[11px] text-slate-500 text-center sm:text-left">
            3 días de prueba · Sin permanencia · Cancelable en cualquier momento
          </span>
        </div>
      </header>

      {checkoutStatus === "success" && (
        <div className="sr-card border-emerald-300 bg-emerald-50 text-sm text-emerald-900">
          <p className="font-medium mb-1">
            ✅ Tu suscripción <strong>Galenos PRO</strong> se ha iniciado
            correctamente.
          </p>
          <p>
            En unos instantes se confirmará el pago en el sistema. Si has usado
            un email demo, recuerda que es solo para pruebas.
          </p>
        </div>
      )}

      {checkoutStatus === "cancel" && (
        <div className="sr-card border-amber-300 bg-amber-50 text-sm text-amber-900">
          <p className="font-medium mb-1">
            ⚠️ El proceso de pago de <strong>Galenos PRO</strong> se canceló.
          </p>
          <p>
            Si ha sido un error, puedes volver a intentarlo haciendo clic en
            "Activar Galenos PRO".
          </p>
        </div>
      )}

      {/* Tabs */}
      <section className="sr-card">
        <div className="flex flex-wrap gap-2 mb-4">
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

        {tab === "resumen" && (
          <div className="space-y-4">
            <p className="sr-p">
              Aquí verás un resumen rápido de tu actividad: últimos pacientes,
              analíticas recientes y recordatorios importantes.
            </p>
            <p className="sr-p text-slate-500 text-sm">
              Próximamente añadiremos más widgets con IA para ayudarte en la
              práctica diaria.
            </p>
          </div>
        )}

        {tab === "analiticas" && (
          <div className="space-y-4">
            <h2 className="sr-h1 text-xl mb-2">Analíticas (demo)</h2>
            <p className="sr-p mb-4">
              Esta sección muestra un listado de pacientes de ejemplo para
              probar el flujo de trabajo de Galenos.pro.
            </p>
            <Patients />
          </div>
        )}

        {tab === "agenda" && (
          <div className="space-y-2">
            <h2 className="sr-h1 text-xl mb-2">Agenda (demo)</h2>
            <p className="sr-p">
              Aquí podrás integrar tu agenda de consultas, recordatorios y
              tareas diarias. Esta sección es solo un placeholder de momento.
            </p>
          </div>
        )}

        {tab === "ajustes" && (
          <div className="space-y-2">
            <h2 className="sr-h1 text-xl mb-2">Ajustes (próximamente)</h2>
            <p className="sr-p">
              Aquí podrás configurar tus preferencias, idioma, notificaciones,
              país de facturación y otros detalles de tu cuenta de médico.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
