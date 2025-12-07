// src/pages/PerfilMedico.jsx — Perfil del médico · Galenos.pro
import React from "react";
import { useNavigate } from "react-router-dom";

export default function PerfilMedico() {
  const navigate = useNavigate();

  const email = localStorage.getItem("galenos_email") || "";
  const name = localStorage.getItem("galenos_name") || "";
  const alias = localStorage.getItem("galenos_alias") || "";
  const specialty = localStorage.getItem("galenos_specialty") || "";

  return (
    <main className="sr-container py-8 max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">
        Perfil del médico
      </h1>

      {/* Datos profesionales */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Datos profesionales
        </h2>

        <div className="space-y-3 text-sm text-slate-700">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.16em]">
              Nombre profesional
            </p>
            <p className="mt-0.5">
              {name || <span className="text-slate-400">Sin especificar</span>}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.16em]">
              Correo electrónico
            </p>
            <p className="mt-0.5">
              {email || <span className="text-slate-400">Sin especificar</span>}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.16em]">
              Especialidad
            </p>
            <p className="mt-0.5">
              {specialty || (
                <span className="text-slate-400">No indicada</span>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Alias profesional */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">
          Alias profesional
        </h2>
        <p className="text-slate-800 text-sm font-medium">
          {alias || <span className="text-slate-400">Sin alias definido</span>}
        </p>
        <p className="sr-small text-slate-500 text-xs">
          Este alias se utilizará en el futuro módulo <strong>De Guardia</strong>{" "}
          para identificar tus aportes de forma anónima ante otros médicos. Por motivos
          de coherencia y reputación, no se podrá cambiar libremente.
        </p>
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="sr-btn-secondary text-sm"
        >
          Volver al panel
        </button>
      </div>
    </main>
  );
}
