// src/pages/AdminPanel.jsx — Panel Admin Fase 1 · Galenos.pro
import React from "react";

export default function AdminPanel() {
  const email = localStorage.getItem("galenos_email") || "";

  const isMaster = email === "soluzziona@gmail.com";

  if (!isMaster) {
    return (
      <main className="sr-container py-8">
        <section className="sr-card max-w-xl mx-auto space-y-3">
          <h1 className="sr-h1 text-2xl">Panel administrador</h1>
          <p className="sr-p text-sm text-slate-600">
            Este espacio está reservado para el usuario maestro de Galenos.pro.
          </p>
          <p className="sr-small text-slate-500">
            Has accedido con el correo: <b>{email || "desconocido"}</b>.
            Si no eres el usuario master, no puedes ver este panel.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="sr-container py-8 space-y-6">
      <header className="space-y-2">
        <h1 className="sr-h1 text-3xl">Panel administrador · Galenos.pro</h1>
        <p className="sr-p text-sm text-slate-600">
          Estás dentro como usuario maestro (<b>{email}</b>). Desde aquí
          iremos añadiendo el control de solicitudes de acceso, médicos y
          invitaciones.
        </p>
      </header>

      <section className="grid md:grid-cols-3 gap-4">
        <div className="sr-card">
          <h2 className="sr-h1 text-base mb-1">Solicitudes de acceso</h2>
          <p className="sr-small text-slate-600">
            Próximamente verás aquí una lista de médicos que han solicitado acceso
            a Galenos.pro, con botón para aprobar y generar invitación.
          </p>
        </div>

        <div className="sr-card">
          <h2 className="sr-h1 text-base mb-1">Médicos registrados</h2>
          <p className="sr-small text-slate-600">
            Aquí podrás revisar qué cuentas están activas y gestionar su estado.
          </p>
        </div>

        <div className="sr-card">
          <h2 className="sr-h1 text-base mb-1">Invitaciones</h2>
          <p className="sr-small text-slate-600">
            En esta sección verás invitaciones creadas, su estado y usos.
          </p>
        </div>
      </section>

      <section className="sr-card">
        <h2 className="sr-h1 text-base mb-1">Notas internas</h2>
        <p className="sr-small text-slate-600">
          Este panel es la Fase 1. El backend ya está listo para crecer; poco a
          poco conectaremos aquí las APIs reales para que puedas gestionar
          Galenos.pro sin tocar Render.
        </p>
      </section>
    </main>
  );
}
