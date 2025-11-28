// src/pages/InicioGalenos.jsx — Landing Galenos.pro
import React from "react";
import { useNavigate } from "react-router-dom";

export default function InicioGalenos() {
  const nav = useNavigate();

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="sr-container grid md:grid-cols-2 gap-8 items-center">
        <section>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Galenos.pro · Panel PRO de apoyo para médicos
          </h1>
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
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => nav("/login")}
              className="sr-btn-primary"
            >
              Acceder como médico
            </button>
            <button
              onClick={() => nav("/panel-medico")}
              className="sr-btn-secondary"
            >
              Ver panel de ejemplo
            </button>
          </div>
          <p className="sr-small mt-3 text-slate-500">
            Versión inicial · Proyecto en desarrollo. Perfecto para ir
            probando el flujo y el panel.
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
