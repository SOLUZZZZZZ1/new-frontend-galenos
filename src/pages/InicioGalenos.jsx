import React from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function InicioGalenos() {
  const nav = useNavigate();

  function handleStart() {
    // ⚠️ Desde la landing SOLO se va al registro, nunca a Stripe
    nav("/alta-medico?next=pro");
  }

  return (
    <>
      <Helmet>
        <title>Galenos.pro | Plataforma clínica segura de apoyo al médico</title>
        <meta
          name="description"
          content="Plataforma clínica para médicos con IA prudente: organización de pacientes, analíticas, imágenes médicas y almacenamiento seguro escalable."
        />
      </Helmet>

      <main className="min-h-[80vh] flex flex-col">
        {/* HERO */}
        <section className="sr-container flex-1 grid md:grid-cols-2 gap-10 items-center px-4 py-10">
          {/* IZQUIERDA */}
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-sky-700 uppercase mb-2">
              IA clínica prudente para médicos
            </p>

            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-slate-900">
              Menos burocracia.
              <span className="block text-sky-800">Más medicina.</span>
            </h1>

            <p className="text-lg text-slate-700 mb-5">
              Galenos.pro te ayuda a leer historias clínicas extensas,
              interpretar analíticas, organizar imágenes médicas y mantener
              un timeline clínico claro por paciente.
            </p>

            <div className="grid gap-2 mb-5 text-sm text-slate-700">
              <div className="flex gap-2">
                <span className="text-sky-700">✓</span>
                <p>Resume historias clínicas largas.</p>
              </div>
              <div className="flex gap-2">
                <span className="text-sky-700">✓</span>
                <p>Extrae y analiza marcadores de analíticas.</p>
              </div>
              <div className="flex gap-2">
                <span className="text-sky-700">✓</span>
                <p>Interpreta imágenes médicas (RX, TAC, RM, ECO).</p>
              </div>
              <div className="flex gap-2">
                <span className="text-sky-700">✓</span>
                <p>Mantiene un timeline clínico organizado.</p>
              </div>
            </div>

            {/* CUENTA */}
            <div className="mb-5 rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-slate-800">
              <p className="font-semibold mb-1">Cuenta profesional</p>
              <p>
                Crea tu cuenta de médico y activa desde tu panel
                la prueba PRO de <strong>10 días</strong>, sin cargo inicial.
              </p>
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleStart}
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow hover:bg-blue-700"
              >
                Crear cuenta profesional
              </button>

              <button
                onClick={() => nav("/login")}
                className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Ya tengo cuenta
              </button>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              El pago solo aparece dentro de la aplicación, tras iniciar sesión.
            </p>
          </div>

          {/* DERECHA */}
          <div className="space-y-5 bg-white/70 backdrop-blur-sm rounded-xl border border-slate-200 p-5 shadow-sm">
            <div>
              <h2 className="text-sm font-semibold mb-1 text-slate-900">
                Historias clínicas
              </h2>
              <p className="text-sm text-slate-700">
                Sube o pega evolutivos largos y Galenos resume la información relevante.
              </p>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <h2 className="text-sm font-semibold mb-1 text-slate-900">
                Analíticas con IA
              </h2>
              <p className="text-sm text-slate-700">
                Extracción automática de marcadores, rangos y valores clave.
              </p>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <h2 className="text-sm font-semibold mb-1 text-slate-900">
                Imágenes médicas
              </h2>
              <p className="text-sm text-slate-700">
                Apoyo en RX, TAC, RM o ECO con resúmenes prudentes.
              </p>
            </div>
          </div>
        </section>

        {/* ALMACENAMIENTO */}
        <section className="sr-container py-10">
          <div className="sr-card">
            <h2 className="sr-h1 mb-3">Almacenamiento clínico seguro y escalable</h2>
            <p className="sr-p mb-3">
              Cada cuenta incluye <strong>10 GB de almacenamiento seguro</strong>
              para analíticas, imágenes médicas y documentación clínica.
            </p>
            <ul className="sr-list">
              <li>Escalable a 20, 50, 100 GB o más según necesidades.</li>
              <li>Sin migraciones, sin interrupciones.</li>
              <li>Los datos permanecen siempre accesibles y protegidos.</li>
            </ul>
          </div>
        </section>

        {/* SEGURIDAD */}
        <section className="sr-container py-6">
          <div className="sr-card">
            <h2 className="sr-h1 mb-3">Seguridad y responsabilidad médica</h2>
            <ul className="sr-list">
              <li>Datos cifrados y controlados por el médico.</li>
              <li>Sin decisiones automáticas.</li>
              <li>La herramienta no sustituye el criterio clínico profesional.</li>
            </ul>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="sr-container py-10 text-center">
          <button
            onClick={handleStart}
            className="sr-btn-primary text-base px-6 py-3"
          >
            Empezar con Galenos
          </button>
        </section>
      </main>
    </>
  );
}
