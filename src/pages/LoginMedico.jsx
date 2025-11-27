// src/pages/LoginMedico.jsx — Login simple del médico (versión inicial)
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginMedico() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Versión inicial: login de prueba.
    // Más adelante sustituimos esto por llamada real a galenos-backend.
    if (!email || !pass) {
      setError("Introduce tu email y contraseña.");
      return;
    }

    // TODO: llamada real a /api/auth/login en backend
    // Por ahora, aceptamos cualquier combinación y guardamos un token ficticio.
    localStorage.setItem("galenos_token", "ok");
    localStorage.setItem("galenos_email", email);
    nav("/panel-medico");
  }

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full sr-card p-6">
        <h1 className="sr-h1 mb-4">Acceso · Galenos.pro</h1>
        <p className="sr-p text-slate-600 mb-4">
          Accede con tus credenciales de médico para entrar al panel.
        </p>

        {error && (
          <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px  -4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="sr-label" htmlFor="email">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              className="sr-input mt-1 w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu.correo@hospital.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="sr-label" htmlFor="pass">
              Contraseña
            </label>
            <input
              id="pass"
              type="password"
              className="sr-input mt-1 w-full"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="sr-btn-primary w-full mt-2"
          >
            Entrar al Panel Médico
          </button>
        </form>
      </div>
    </main>
  );
}
