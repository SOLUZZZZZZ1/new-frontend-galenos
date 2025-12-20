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
          content="Plataforma clínica para médicos que ayuda a organizar información, interpretar analíticas e imágenes y mantener un timeline clínico de forma segura."
        />
      </Helmet>

      <main className="min-h-[80vh] flex flex-col">
        <section className="sr-container flex-1 grid md:grid-cols-2 gap-10 items-center px-4 py-10">
          {/* COLUMNA IZQUIERDA */}
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
              un timeline por paciente.
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
                <p>Interpreta imágenes (RX, TAC, RM, ECO).</p>
              </div>
              <div className="flex gap-2">
                <span className="text-sky-700">✓</span>
                <p>Mantiene un timeline clínico organizado.</p>
              </div>
            </div>

            <div className="mb-5 rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-slate-800">
              <p className="font-semibold mb-1">Cuenta profesional</p>
              <p className="mb-1">
                Crea tu cuenta de médico y después, desde tu panel, podrás activar
                la prueba PRO de 10 días (sin cargo inicial).
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
              El pago solo aparece dentro de la app, tras iniciar sesión.
            </p>
          </div>

          {/* COLUMNA DERECHA */}
          <div className="space-y-5 bg-white/70 backdrop-blur-sm rounded-xl border border-slate-200 p-5 shadow-sm">
            <div>
              <h2 className="text-sm font-semibold mb-1 text-slate-900">
                Historias clínicas
              </h2>
              <p className="text-sm text-slate-700">
                Sube o pega evolutivos largos y Galenos resume la información clave.
              </p>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <h2 className="text-sm font-semibold mb-1 text-slate-900">
                Analíticas con IA
              </h2>
              <p className="text-sm text-slate-700">
                Extrae marcadores, rangos y valores relevantes automáticamente.
              </p>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <h2 className="text-sm font-semibold mb-1 text-slate-900">
                Imágenes médicas
              </h2>
              <p className="text-sm text-slate-700">
                Analiza estudios RX/TAC/RM/ECO y genera un resumen prudente.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
