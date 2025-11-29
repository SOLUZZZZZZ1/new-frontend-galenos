// src/pages/AdminPanel.jsx — Panel Admin con Tabs (sin backend aún)
import React, { useState } from "react";

export default function AdminPanel() {
  const email = localStorage.getItem("galenos_email") || "";
  const isMaster = email === "soluzziona@gmail.com";

  // TAB actual
  const [tab, setTab] = useState("requests");

  // Datos MOCK (solo para visualizar diseño)
  const mockRequests = [
    { id: 1, name: "Dr. Luis", email: "luis@hospital.com", country: "España", city: "Sevilla" },
    { id: 2, name: "Dra. Ana", email: "ana@hospital.com", country: "Chile", city: "Santiago" },
  ];

  const mockUsers = [
    { id: 1, email: "medico1@hospital.com", name: "Dr. Usuario 1" },
    { id: 2, email: "medico2@hospital.com", name: "Dra. Usuario 2" },
  ];

  const mockInvitations = [
    { id: 1, token: "abc123", used_count: 0, max_uses: 1 },
    { id: 2, token: "def456", used_count: 1, max_uses: 1 },
  ];

  // Si NO es master, bloquear
  if (!isMaster) {
    return (
      <main className="sr-container py-8">
        <section className="sr-card max-w-xl mx-auto space-y-3">
          <h1 className="sr-h1 text-2xl">Panel administrador</h1>
          <p className="sr-p text-sm text-slate-600">
            Este espacio está reservado para el usuario maestro de Galenos.pro.
          </p>
          <p className="sr-small text-slate-500">
            Has accedido con: <b>{email || "desconocido"}</b>.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="sr-container py-8 space-y-6">
      {/* Cabecera */}
      <header className="space-y-2">
        <h1 className="sr-h1 text-3xl">Panel administrador · Galenos.pro</h1>
        <p className="sr-p text-sm text-slate-600">
          Estás dentro como usuario maestro (<b>{email}</b>).{" "}
          Esta es la versión de diseño (sin backend conectado todavía).
        </p>
      </header>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setTab("requests")}
          className={`sr-btn-secondary ${tab === "requests" ? "bg-sky-700 text-white" : ""}`}
        >
          Solicitudes
        </button>

        <button
          onClick={() => setTab("users")}
          className={`sr-btn-secondary ${tab === "users" ? "bg-sky-700 text-white" : ""}`}
        >
          Médicos
        </button>

        <button
          onClick={() => setTab("invites")}
          className={`sr-btn-secondary ${tab === "invites" ? "bg-sky-700 text-white" : ""}`}
        >
          Invitaciones
        </button>

        <button
          onClick={() => setTab("settings")}
          className={`sr-btn-secondary ${tab === "settings" ? "bg-sky-700 text-white" : ""}`}
        >
          Ajustes
        </button>
      </div>

      {/* CONTENIDO SEGÚN TAB -------------------------------- */}

      {/* TAB: Solicitudes */}
      {tab === "requests" && (
        <section className="sr-card space-y-4">
          <h2 className="sr-h1 text-xl">Solicitudes de acceso</h2>

          {mockRequests.map((r) => (
            <div key={r.id} className="border-b pb-3">
              <p className="sr-p">
                <b>{r.name}</b> — {r.email}
              </p>
              <p className="sr-small text-slate-500">
                {r.country}, {r.city}
              </p>

              <div className="flex gap-2 mt-2">
                <button className="sr-btn-primary text-sm">Aprobar (mock)</button>
                <button className="sr-btn-secondary text-sm">Rechazar (mock)</button>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* TAB: Médicos */}
      {tab === "users" && (
        <section className="sr-card space-y-3">
          <h2 className="sr-h1 text-xl">Médicos registrados</h2>

          {mockUsers.map((u) => (
            <p key={u.id} className="sr-small">
              {u.email} — {u.name}
            </p>
          ))}
        </section>
      )}

      {/* TAB: Invitaciones */}
      {tab === "invites" && (
        <section className="sr-card space-y-3">
          <h2 className="sr-h1 text-xl">Invitaciones</h2>

          {mockInvitations.map((inv) => (
            <p key={inv.id} className="sr-small">
              Token: {inv.token} — Usos: {inv.used_count}/{inv.max_uses}
            </p>
          ))}
        </section>
      )}

      {/* TAB: Ajustes */}
      {tab === "settings" && (
        <section className="sr-card space-y-3">
          <h2 className="sr-h1 text-xl">Ajustes del panel admin</h2>
          <p className="sr-small text-slate-600">
            Aquí podrás cambiar opciones internas del sistema cuando conectemos el backend.
          </p>
          <p className="sr-small text-slate-600">
            Esta es solo la vista de diseño. El backend está listo para conectar cuando quieras.
          </p>
        </section>
      )}
    </main>
  );
}
