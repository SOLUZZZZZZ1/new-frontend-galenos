// src/pages/PanelMedico.jsx — Panel inicial del médico (versión esqueleto)
import React from "react";
import { useNavigate } from "react-router-dom";

export default function PanelMedico() {
  const nav = useNavigate();
  const email = localStorage.getItem("galenos_email") || "";

  function handleLogout() {
    localStorage.removeItem("galenos_token");
    localStorage.removeItem("galenos_email");
    nav("/login");
  }

  return (
    <main
      className="sr-container py-8"
      style={{ minHeight: "calc(100vh - 160px)" }}
    >
      <section className="sr-card mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="sr-h1 m-0">Panel del Médico</h1>
            <p className="sr-small text-slate-600">
              Sesión: <b>{email || "médico en prueba"}</b>
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              className="sr-btn-secondary"
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        <p className="sr-p mt-4">
          Esta es la versión inicial del Panel del Médico en Galenos.pro.
          Desde aquí, en las siguientes versiones, podrás acceder a:
        </p>
        <ul className="sr-list mt-2">
          <li>Listado de casos / pacientes.</li>
          <li>Análisis de analíticas con IA y visión.</li>
          <li>Lectura y resumen de informes clínicos.</li>
          <li>Agenda de citas y tareas.</li>
          <li>Herramientas de IA de apoyo clínico.</li>
        </ul>
      </section>
    </main>
  );
}
