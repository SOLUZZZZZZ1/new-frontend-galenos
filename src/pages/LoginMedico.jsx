// src/pages/LoginMedico.jsx — Acceso · Galenos.pro
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// URL del backend de Galenos (Render)
const API = import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

export default function LoginMedico() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state && location.state.from && location.state.from.pathname) || "/panel-medico";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Introduce tu correo y tu contraseña.");
      return;
    }

    try {
      setLoading(true);

      const body = {
        email,
        password,
      };

      console.log("🔥 Login contra:", `${API}/auth/login`);

      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const raw = await res.text();
      console.log("👉 Respuesta login (raw):", raw);

      if (!res.ok) {
        setError("Credenciales incorrectas o usuario inactivo.");
        return;
      }

      let data;
      try {
        data = JSON.parse(raw);
      } catch (err) {
        console.error("❌ No se pudo parsear JSON de login:", err);
        setError("Error inesperado en el servidor de autenticación.");
        return;
      }

      // Token estándar tipo FastAPI: { access_token, token_type }
      const token = data.access_token || data.token || null;

      if (!token) {
        setError("Respuesta de login sin token. Revisa la API.");
        return;
      }

      // Guardamos datos básicos en localStorage
      localStorage.setItem("galenos_token", token);
      localStorage.setItem("galenos_email", data.email || email || "");
      if (data.name) {
        localStorage.setItem("galenos_name", data.name);
      }

      // Navegamos al panel (o a la ruta original almacenada)
      navigate(from, { replace: true });
    } catch (err) {
      console.error("❌ Error en petición de login:", err);
      setError("No se ha podido conectar con el servidor de autenticación.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="sr-container py-8 flex items-center justify-center">
      <section className="sr-card max-w-md w-full space-y-6">
        <header className="space-y-1">
          <h1 className="sr-h1 text-2xl">Acceso · Galenos.pro</h1>
          <p className="sr-p text-sm text-slate-600">
            Accede con tus credenciales de médico para entrar al panel.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="sr-label">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu.correo@hospital.com"
              className="sr-input w-full"
            />
          </div>

          <div>
            <label htmlFor="password" className="sr-label">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="sr-input w-full"
            />
          </div>

          {error && (
            <p className="sr-small text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="sr-btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Entrando..." : "Entrar al Panel Médico"}
          </button>
        </form>

        <p className="sr-small text-slate-500 text-xs">
          Si aún no tienes acceso, esta versión MVP está pensada para demos internas.
          Más adelante se habilitará el alta verificada de médicos.
        </p>
      </section>
    </main>
  );
}
