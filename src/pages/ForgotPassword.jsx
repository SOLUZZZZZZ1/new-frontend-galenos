// src/pages/ForgotPassword.jsx — Galenos (SAFE)
// - Respuesta genérica (no revela si existe el email)

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [info, setInfo] = useState("");
  const [err, setErr] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setInfo("");

    const em = (email || "").trim().toLowerCase();
    if (!em) {
      setErr("Escribe tu email.");
      return;
    }

    try {
      setSending(true);
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: em }),
      });
      await res.text(); // no dependemos del body
      setInfo("Si existe una cuenta con ese email, recibirás un enlace de restablecimiento en unos minutos.");
    } catch {
      setInfo("Si existe una cuenta con ese email, recibirás un enlace de restablecimiento en unos minutos.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="sr-container py-8">
      <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <h1 className="text-xl font-semibold text-slate-900">He olvidado mi contraseña</h1>
        <p className="text-sm text-slate-600">
          Introduce tu email. Si existe una cuenta, te enviaremos un enlace para restablecer la contraseña.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="sr-label">Email</label>
            <input
              className="sr-input w-full"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
            />
          </div>

          {err && <p className="text-sm text-rose-700">{err}</p>}
          {info && <p className="text-sm text-emerald-700">{info}</p>}

          <button
            type="submit"
            disabled={sending}
            className="sr-btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {sending ? "Enviando..." : "Enviar enlace"}
          </button>
        </form>

        <button type="button" onClick={() => navigate("/login")} className="sr-btn-secondary">
          Volver a login
        </button>
      </div>
    </div>
  );
}
