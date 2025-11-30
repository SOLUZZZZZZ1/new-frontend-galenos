// src/pages/InicioGalenos.jsx — Landing Galenos.pro con IA Médica y botón PRO (Stripe)
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// URL del backend de Galenos (Render)
const API = import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

export default function InicioGalenos() {
  const nav = useNavigate();

  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState("");

  async function handleStripeCheckout() {
    setStripeError("");
    try {
      setStripeLoading(true);
      console.log("💳 [Landing] Creando sesión de Stripe en:", `${API}/billing/create-checkout-session`);
      const res = await fetch(`${API}/billing/create-checkout-session`);
      const raw = await res.text();
      console.log("👉 [Landing] Respuesta Stripe (raw):", raw);

      if (!res.ok) {
        setStripeError("No se ha podido iniciar el pago en Stripe desde la landing.");
        return;
      }

      let data;
      try {
        data = JSON.parse(raw);
      } catch (err) {
        console.error("❌ [Landing] No se pudo parsear JSON de Stripe:", err);
        setStripeError("Respuesta inesperada del servidor de pagos.");
        return;
      }

      if (!data.checkout_url) {
        setStripeError("El servidor no ha devuelto una URL de pago.");
        return;
      }

      window.location.href = data.checkout_url;
    } catch (err) {
      console.error("❌ [Landing] Error al conectar con Stripe:", err);
      setStripeError("No se ha podido conectar con el servidor de pagos.");
    } finally {
      setStripeLoading(false);
    }
  }

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="sr-container grid md:grid-cols-2 gap-8 items-center">
        <section>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Galenos.pro · Panel PRO de apoyo para médicos
          </h1>

          <p className="sr-p text-sky-700 font-semibold mb-2">
            IA Médica con Visión · El copiloto clínico que ve, compara y resume tus analíticas en segundos.
          </p>

          <ul className="sr-list space-y-1 mb-4 text-slate-700">
            <li>Analiza PDF e imágenes para extraer marcadores clave.</li>
            <li>Detecta tendencias y cambios sutiles entre analíticas previas.</li>
            <li>Genera un resumen clínico orientativo en lenguaje profesional.</li>
          </ul>

          <p className="sr-small text-slate-500 mb-6">
            Galenos.pro no diagnostica ni prescribe. Es una herramienta de apoyo para médicos.
          </p>

          <p className="sr-p mb-3">
            Galenos.pro es tu copiloto clínico: analiza analíticas, organiza
            casos y resúmenes, y te ayuda a seguir la evolución de tus
            pacientes. La decisión final es siempre tuya.
          </p>
          <p className="sr-p mb-6 text-slate-600">
            Subes una analítica, la IA la convierte en tabla, compara con
            analíticas anteriores y genera un informe orientativo con tendencias
            y posibles causas a valorar. Nunca prescribe, nunca sustituye tu
            criterio.
          </p>

          {/* Botones principales */}
          <div className="flex flex-wrap gap-3 mb-2">
            <button
              onClick={() => nav("/login")}
              className="sr-btn-primary"
            >
              Acceder como médico
            </button>

            <button
              onClick={() => nav("/panel-demo")}
              className="sr-btn-secondary"
            >
              Ver panel de ejemplo
            </button>

            <button
              type="button"
              onClick={handleStripeCheckout}
              disabled={stripeLoading}
              className="sr-btn-secondary"
            >
              {stripeLoading ? "Conectando con Stripe..." : "Activar PRO (Stripe)"}
            </button>
          </div>

          {stripeError && (
            <p className="sr-small text-red-600 mt-1">
              {stripeError}
            </p>
          )}

          <p className="sr-small text-slate-600 mt-2">
            ¿Aún no conoces a ningún colega que use Galenos.pro?{" "}
            <button
              type="button"
              onClick={() => nav("/solicitar-acceso")}
              className="underline text-sky-700 hover:text-sky-800"
            >
              Solicita acceso aquí
            </button>
            .
          </p>

          <p className="sr-small mt-3 text-slate-500">
            Versión inicial · Proyecto en desarrollo. Perfecto para ir probando el flujo y el panel.
          </p>
        </section>

        <section className="hidden md:block">
          <div className="sr-card">
            <h2 className="sr-h1 mb-3 text-lg">¿Qué hace Galenos.pro?</h2>
            <ul className="sr-list space-y-1">
              <li>Convierte analíticas en tablas y gráficas.</li>
              <li>Compara resultados con analíticas previas.</li>
              <li>Señala tendencias (mejoría, empeoramiento, cambios sutiles).</li>
              <li>Genera un informe clínico orientativo y prudente.</li>
              <li>Guarda el historial por paciente.</li>
            </ul>
            <p className="sr-small mt-4 text-slate-500">
              Galenos.pro no diagnostica ni prescribe. Es una herramienta de
              apoyo diseñada para médicos.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
