// src/pages/InicioGalenos.jsx — Landing Galenos.pro con IA Médica y botón PRO (Stripe)
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// URL del backend de Galenos (Render)
const API =
  import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

export default function InicioGalenos() {
  const nav = useNavigate();

  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState("");

  async function handleStripeCheckout() {
    setStripeError("");

    // 1) Comprobar si el usuario está logueado ANTES de ir a Stripe
    // ⚠️ IMPORTANTE: si tu token se guarda con otro nombre, cámbialo aquí.
    const token = localStorage.getItem("authToken");
    if (!token) {
      // Si no hay sesión, lo enviamos primero al login.
      // El parámetro ?next=pro sirve para que, tras iniciar sesión,
      // puedas devolverle a la zona PRO o mostrarle el botón de Stripe.
      nav("/login?next=pro");
      return;
    }

    try {
      setStripeLoading(true);
      console.log(
        "💳 [Landing] Creando sesión de Stripe en:",
        `${API}/billing/create-checkout-session`
      );
      const res = await fetch(`${API}/billing/create-checkout-session`);
      const raw = await res.text();
      console.log("👉 [Landing] Respuesta Stripe (raw):", raw);

      if (!res.ok) {
        setStripeError(
          "No se ha podido iniciar el pago en Stripe desde la landing."
        );
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

      // 2) Abrimos Stripe en una pestaña nueva
      const newWin = window.open(
        data.checkout_url,
        "_blank",
        "noopener,noreferrer"
      );

      // Fallback por si el navegador bloquea el pop-up
      if (!newWin) {
        window.location.href = data.checkout_url;
      }
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

          <p className="text-lg text-slate-700 mb-3">
            Galenos.pro es un panel de apoyo con IA médica responsable diseñado
            para médicos y clínicas. Analiza historias clínicas, evolutivos y
            analíticas de laboratorio para ayudarte a ver mejor el cuadro
            completo.
          </p>

          <p className="text-slate-700 mb-3">
            No sustituye al criterio médico, sino que actúa como una capa extra
            de revisión y contexto. Está pensado para profesionales que atienden
            a muchos pacientes al día y necesitan apoyo para revisar la
            información de forma rápida y ordenada.
          </p>

          <div className="mb-4 rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-slate-800">
            <p className="font-semibold mb-1">Acceso PRO con 3 días de prueba</p>
            <p className="mb-1">
              Para activar Galenos PRO tendrás que iniciar sesión y, a
              continuación, dejar registrada tu tarjeta en Stripe.{" "}
              <strong>No se realiza ningún cargo al inicio:</strong> dispones de{" "}
              <strong>3 días de prueba gratuita</strong>.
            </p>
            <p className="text-xs text-slate-700">
              Solo se realizará el primer cobro si decides continuar después de
              la prueba. Podrás cancelar la suscripción antes de que termine el
              período de prueba para que no se cargue nada.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              onClick={handleStripeCheckout}
              disabled={stripeLoading}
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {stripeLoading
                ? "Conectando con Stripe..."
                : "Acceder a Galenos PRO (3 días gratis)"}
            </button>

            <button
              type="button"
              onClick={() => nav("/login")}
              className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Entrar con mi cuenta
            </button>
          </div>

          {stripeError && (
            <p className="mt-3 text-sm text-red-600">{stripeError}</p>
          )}

          <p className="mt-4 text-xs text-slate-500">
            Pagos seguros gestionados por Stripe. Para activar la prueba
            gratuita es necesario indicar una tarjeta. Podrás cancelar la
            suscripción en cualquier momento antes de que termine el período de
            prueba para que no se realice ningún cargo.
          </p>
        </section>

        <section className="bg-white/70 backdrop-blur-sm rounded-xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">
            ¿Qué hace Galenos.pro por ti?
          </h2>
          <p className="text-sm text-slate-700 mb-3">
            Imagina un asistente que:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
            <li>
              Lee la historia clínica y el evolutivo del paciente — incluso si
              son muchas páginas.
            </li>
            <li>
              Resume la información clave en lenguaje clínico, con cuidado y sin
              alarmismos.
            </li>
            <li>
              Te ayuda a organizar la información por episodios, diagnósticos
              previos, tratamientos y respuestas.
            </li>
            <li>
              Te propone preguntas orientativas para la anamnesis, basadas en el
              perfil del paciente.
            </li>
          </ul>

          <div className="mt-4 border-t border-slate-200 pt-4">
            <h3 className="text-sm font-semibold mb-2">
              Módulo de analíticas (en desarrollo avanzado)
            </h3>
            <p className="text-sm text-slate-700 mb-2">
              Podrás subir analíticas de laboratorio (PDF o texto) y el sistema:
            </p>
            <ul className="sr-list space-y-1">
              <li>Convierte analíticas en tablas y gráficas.</li>
              <li>Compara resultados con analíticas previas.</li>
              <li>
                Señala tendencias (mejoría, empeoramiento, cambios sutiles).
              </li>
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
