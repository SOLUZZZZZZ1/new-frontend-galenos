// src/pages/AdminPanel.jsx — Versión mínima para comprobar que compila
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
            Has accedido con: <b>{email || "desconocido"}</b>.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="sr-container py-8">
      <section className="sr-card max-w-xl mx-auto space-y-3">
        <h1 className="sr-h1 text-2xl">Panel administrador (mínimo)</h1>
        <p className="sr-p text-sm text-slate-600">
          Estás dentro como usuario maestro (<b>{email}</b>).
        </p>
        <p className="sr-small text-slate-500">
          Esta es la versión mínima del panel admin, solo para verificar que el
          frontend compila correctamente en Vercel.
        </p>
      </section>
    </main>
  );
}
