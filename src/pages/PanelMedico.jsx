// src/pages/PanelMedico.jsx — Panel del médico con tabs, Stripe y estado post-checkout
import React, { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import Patients from "./Patients.jsx";

// URL del backend de Galenos (Render)
const API = import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

const TABS = [
  { id: "resumen", label: "Resumen" },
  { id: "analiticas", label: "Analíticas · IA" },
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
  const checkoutStatus = query.get("checkout"); // "success" | "cancel" | null

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
            ". Mira la consola (F12 → Console) para más detalles."
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
      {/* Cabecera principal */}
      <header className="sr-card flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h1 className="sr-h1 text-2xl">Panel del médico</h1>
          <p className="sr-p text-slate-600 text-sm">
            Gestiona tus pacientes, revisa analíticas y activa Galenos PRO para
            desbloquear todas las funciones. Esta versión es un MVP orientativo
            para validar el flujo de trabajo.
          </p>
        </div>

        <div className="flex flex-col gap-2 items-stretch sm:items-end">
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
          <p className="sr-small text-slate-500 text-right max-w-xs">
            3 días de prueba · Sin permanencia · Cancelable en cualquier momento.
            El cargo mensual se realiza solo tras el periodo de prueba.
          </p>
        </div>
      </header>

      {/* Estado tras volver de Stripe */}
      {checkoutStatus === "success" && (
        <div className="sr-card border-emerald-300 bg-emerald-50 text-sm text-emerald-900 space-y-1">
          <p className="font-medium">
            ✅ Tu suscripción <strong>Galenos PRO</strong> se ha iniciado correctamente.
          </p>
          <p>
            En unos instantes se confirmará el pago en el sistema. Si estás en
            entorno de pruebas de Stripe, recuerda que no es un cargo real.
          </p>
        </div>
      )}

      {checkoutStatus === "cancel" && (
        <div className="sr-card border-amber-300 bg-amber-50 text-sm text-amber-900 space-y-1">
          <p className="font-medium">
            ⚠️ El proceso de pago de <strong>Galenos PRO</strong> se canceló.
          </p>
          <p>
            Si ha sido un error, puedes volver a intentarlo cuando quieras
            haciendo clic en “Activar Galenos PRO”.
          </p>
        </div>
      )}

      {/* Aviso legal general */}
      <div className="sr-card bg-slate-50 border-slate-200 text-xs text-slate-600">
        <p>
          Galenos.pro no diagnostica ni prescribe. Es una herramienta de apoyo
          al médico. La decisión clínica final corresponde siempre al facultativo
          responsable, integrando historia clínica, exploración física y el resto
          de pruebas complementarias.
        </p>
      </div>

      {/* Tabs + contenido */}
      <section className="sr-card space-y-4">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-xl text-sm border transition-colors ${
                tab === t.id
                  ? "border-sky-500 bg-sky-50 text-sky-700"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Contenido de cada tab */}
        {tab === "resumen" && (
          <div className="space-y-4">
            <div>
              <h2 className="sr-h1 text-xl mb-1">Resumen de actividad</h2>
              <p className="sr-p text-sm text-slate-600">
                Aquí verás, en futuras versiones, un resumen rápido de tu
                actividad: últimos pacientes vistos, analíticas recientes,
                recordatorios importantes y avisos de seguridad.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="sr-small text-slate-500 mb-1">Estado de cuenta</p>
                <p className="text-sm font-medium">Demo / MVP</p>
                <p className="sr-small text-slate-500 mt-1">
                  Cuando conectemos el webhook a la BD, aquí verás si tienes
                  Galenos PRO activo y la fecha de renovación.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="sr-small text-slate-500 mb-1">Analíticas cargadas</p>
                <p className="text-sm font-medium">Demo</p>
                <p className="sr-small text-slate-500 mt-1">
                  Esta tarjeta mostrará el número de analíticas analizadas con IA
                  en el periodo seleccionado.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="sr-small text-slate-500 mb-1">
                  Próximas iteraciones
                </p>
                <p className="text-sm font-medium">Agenda, alertas y más</p>
                <p className="sr-small text-slate-500 mt-1">
                  El objetivo es que el panel se convierta en un “dashboard
                  clínico” de apoyo diario para el médico.
                </p>
              </div>
            </div>
          </div>
        )}

        {tab === "analiticas" && (
          <div className="space-y-4">
            <Patients />
          </div>
        )}

        {tab === "agenda" && (
          <div className="space-y-2">
            <h2 className="sr-h1 text-xl mb-1">Agenda (demo)</h2>
            <p className="sr-p text-sm text-slate-600">
              Aquí podrás integrar tu agenda de consultas, recordatorios y
              tareas diarias. En esta versión MVP es solo un placeholder
              visual sin lógica interna.
            </p>
          </div>
        )}

        {tab === "ajustes" && (
          <div className="space-y-2">
            <h2 className="sr-h1 text-xl mb-1">Ajustes (próximamente)</h2>
            <p className="sr-p text-sm text-slate-600">
              En esta sección podrás configurar tus preferencias, idioma,
              notificaciones, país de facturación y otros detalles de tu cuenta
              de médico.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
