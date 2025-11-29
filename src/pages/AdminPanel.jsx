// src/pages/AdminPanel.jsx — Panel Admin diseño profesional sin backend
import React, { useState } from "react";

export default function AdminPanel() {
  const email = localStorage.getItem("galenos_email") || "";
  const isMaster = email === "soluzziona@gmail.com";

  const [tab, setTab] = useState("dashboard");

  if (!isMaster) {
    return (
      <main className="sr-container py-8">
        <section className="sr-card max-w-xl mx-auto space-y-3">
          <h1 className="sr-h1 text-2xl">Panel administrador</h1>
          <p className="sr-p text-sm text-slate-600">
            Este espacio está reservado para el usuario maestro de Galenos.pro.
          </p>
          <p className="sr-small text-slate-500">
            Accediste como: <b>{email || "desconocido"}</b>
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="sr-container py-8 space-y-6">
      <header className="space-y-1">
        <h1 className="sr-h1 text-3xl">Panel administrador · Galenos.pro</h1>
        <p className="sr-small text-slate-600">
          Bienvenido, <b>{email}</b>. Esta es la versión visual del panel admin.  
          Más adelante conectaremos datos reales.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 mb-4">
        {[
          ["dashboard", "Inicio"],
          ["requests", "Solicitudes"],
          ["users", "Médicos"],
          ["invites", "Invitaciones"]
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`sr-btn-secondary text-sm ${
              tab === value ? "bg-sky-700 text-white" : ""
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Dashboard */}
      {tab === "dashboard" && (
