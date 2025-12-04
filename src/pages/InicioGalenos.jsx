// src/pages/InicioGalenos.jsx — Landing Galenos.pro optimizada para suscripción PRO
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

    const token = localStorage.getItem("galenos_token");
    if (!token) {
      nav("/alta-medico?next=pro");
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

      const newWin = window.open(
        data.checkout_url,
        "_blank",
        "noopener,noreferrer"
      );

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
    <main className="min-h-[80vh] flex flex-col">
      {/* HERO PRINCIPAL */}
      <section className="sr-container flex-1 grid md:grid-cols-2 gap-10 items-center px-4 py-10">
        {/* COLUMNA IZQUIERDA: MENSAJE PRINCIPAL */}
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-sky-700 uppercase mb-2">
            IA clínica prudente para médicos
          </p>

          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-slate-900">
            Menos burocracia.
            <span className="block text-sky-800">Más medicina.</span>
          </h1>

          <p className="text-lg text-slate-700 mb-5">
            Galenos.pro te ayuda a leer historias clínicas extensas, interpretar analíticas,
            organizar imágenes médicas y mantener un timeline por paciente, para que puedas
            centrarte en la parte importante: el paciente y tus decisiones clínicas.
          </p>

          <div className="grid gap-2 mb-5 text-sm text-slate-700">
            <div className="flex gap-2">
              <span className="text-sky-700 mt-[2px]">✓</span>
              <p>
                Resume historias y evolutivos largos en lenguaje clínico claro y prudente.
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-sky-700 mt-[2px]">✓</span>
              <p>
                Extrae marcadores de analíticas, destaca valores fuera de rango y los guarda en
                la ficha del paciente.
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-sky-700 mt-[2px]">✓</span>
              <p>
                Analiza imágenes (RX / TAC / RM / ECO), genera un resumen prudente y enlaza los
                estudios al timeline del paciente.
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-sky-700 mt-[2px]">✓</span>
              <p>
                Mantiene un timeline clínico con notas, analíticas e imágenes, todo en un único panel.
              </p>
            </div>
          </div>

          {/* Bloque de prueba PRO */}
          <div className="mb-5 rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-slate-800">
            <p className="font-semibold mb-1">Acceso PRO con 3 días de prueba</p>
            <p className="mb-1">
              Crea tu cuenta de médico, inicia sesión y activa Galenos PRO dejando registrada tu
              tarjeta en Stripe. <strong>No se realiza ningún cargo al inicio:</strong>{" "}
              dispones de <strong>3 días de prueba gratuita</strong>.
            </p>
            <p className="text-xs text-slate-700">
              La primera cuota se cobrará solo si continúas utilizando Galenos después del
              período de prueba.
            </p>
          </div>

          {/* Botones de acción (HERO) */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              onClick={handleStripeCheckout}
              disabled={stripeLoading}
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {stripeLoading
                ? "Conectando con Stripe..."
                : "Activar Galenos PRO (3 días gratis)"}
            </button>

            <button
              type="button"
              onClick={() => nav("/login")}
              className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Ya tengo cuenta
            </button>
          </div>

          {stripeError && (
            <p className="mt-3 text-sm text-red-600">{stripeError}</p>
          )}

          <p className="mt-4 text-xs text-slate-500">
            Pagos seguros gestionados por Stripe.
          </p>
        </div>

        {/* COLUMNA DERECHA: BLOQUES EXPLICATIVOS */}
        <div className="space-y-5 bg-white/70 backdrop-blur-sm rounded-xl border border-slate-200 p-5 shadow-sm">
          {/* Bloque 1: Historias clínicas */}
          <div>
            <h2 className="text-sm font-semibold mb-1 text-slate-900">
              1. Historias clínicas y evolutivos
            </h2>
            <p className="text-sm text-slate-700 mb-2">
              Sube o pega evolutivos largos, informes y anotaciones. Galenos:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
              <li>Resume la información clave en lenguaje clínico.</li>
              <li>Te ayuda a identificar episodios, diagnósticos previos y tratamientos.</li>
              <li>Te propone preguntas orientativas para la anamnesis.</li>
            </ul>
          </div>

          {/* Bloque 2: Analíticas */}
          <div className="border-t border-slate-200 pt-4">
            <h2 className="text-sm font-semibold mb-1 text-slate-900">
              2. Analíticas de laboratorio con IA
            </h2>
            <p className="text-sm text-slate-700 mb-2">
              Sube analíticas (PDF o imagen) y Galenos:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
              <li>Convierte parámetros en una tabla estructurada por marcadores.</li>
              <li>Detecta valores fuera de rango (alto / bajo / normal).</li>
              <li>Permite ver la evolución de un marcador a lo largo del tiempo.</li>
              <li>Guarda cada analítica con su fecha clínica real en la ficha del paciente.</li>
            </ul>
          </div>

          {/* Bloque 3: Imágenes médicas */}
          <div className="border-t border-slate-200 pt-4">
            <h2 className="text-sm font-semibold mb-1 text-slate-900">
              3. Imágenes médicas (RX / TAC / RM / ECO)
            </h2>
            <p className="text-sm text-slate-700 mb-2">
              Sube estudios de imagen y Galenos genera un resumen prudente:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
              <li>Describe hallazgos visuales en lenguaje neutro.</li>
              <li>Resalta patrones e imágenes relevantes para tu reflexión clínica.</li>
              <li>Evita duplicados, enlazando el estudio a la ficha del paciente y al timeline.</li>
            </ul>
            <p className="sr-small mt-2 text-slate-500">
              Galenos.pro no diagnostica ni prescribe. Es una herramienta de apoyo diseñada para
              médicos, no para pacientes.
            </p>
          </div>
        </div>
      </section>

      {/* SECCIÓN: 10 GB + ESPACIO ESCALABLE */}
      <section className="bg-slate-50 border-t border-slate-200 py-10">
        <div className="sr-container px-4 max-w-5xl mx-auto space-y-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              10 GB de almacenamiento clínico seguro e inteligente
            </h2>
            <p className="text-slate-700 text-sm md:text-base">
              Galenos incluye <strong>10 GB de almacenamiento cifrado</strong>, suficientes para
              conservar años de evolución clínica sin preocuparte por el espacio:
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-700">
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="font-semibold mb-2">Capacidad real</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Más de <strong>3.000 analíticas</strong> completas.</li>
                <li>Cientos de <strong>imágenes médicas</strong> RX/TAC/RM/ECO.</li>
                <li>Timeline clínico completo de tus pacientes.</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="font-semibold mb-2">Almacenamiento inteligente</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Detección de duplicados para no consumir espacio innecesario.</li>
                <li>Marcadores y patrones enlazados a cada estudio.</li>
                <li>Todo organizado por paciente, fecha y tipo de evento.</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="font-semibold mb-2">Escalable cuando lo necesites</p>
              <ul className="list-disc list-inside space-y-1">
                <li>+10 GB, +50 GB o +100 GB opcionales.</li>
                <li>Planes específicos para centros y clínicas.</li>
                <li>Sin migraciones ni complicaciones: solo más espacio.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-white py-10 border-t border-slate-200">
        <div className="sr-container px-4 max-w-4xl mx_auto text-center space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">
            Empieza a usar Galenos.pro en tu próxima consulta
          </h2>
          <p className="text-sm md:text-base text-slate-700 max-w-2xl mx-auto">
            Prueba Galenos PRO durante 3 días sin coste inicial. La primera cuota se realiza
            automáticamente tras la prueba gratuita.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-3">
            <button
              onClick={handleStripeCheckout}
              disabled={stripeLoading}
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {stripeLoading
                ? "Conectando con Stripe..."
                : "Comenzar prueba PRO (3 días gratis)"}
            </button>
            <button
              type="button"
              onClick={() => nav("/login")}
              className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Entrar con mi cuenta
            </button>
          </div>

          <p className="text-xs text-slate-500 mt-2">
            Galenos.pro no reemplaza el juicio clínico ni emite diagnósticos. Es un soporte
            orientativo para médicos, no una herramienta para pacientes.
          </p>
        </div>
      </section>
    </main>
  );
}
