// src/pages/LoginMediador.jsx — Acceso mediadores con inputs visibles
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../components/Seo.jsx";

export default function LoginMediador() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await r.json().catch(() => ({}));

      if (!r.ok || !data?.ok) {
        throw new Error(data?.detail || "Credenciales incorrectas");
      }

      // Guardar sesión
      localStorage.setItem("mediador_email", form.email.toLowerCase());
      localStorage.setItem("jwt_token", data.token || "ok");

      nav("/panel-mediador");
    } catch (e) {
      setError(e.message || "No se pudo iniciar sesión");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Seo
        title="Acceso mediadores · MEDIAZION"
        description="Acceso al panel profesional de mediadores de MEDIAZION."
        canonical="https://mediazion.eu/acceso"
      />
      <main
        className="sr-container py-12 flex justify-center"
        style={{
          minHeight: "calc(100vh - 160px)",
          backgroundImage: "url('/marmol.jpg')",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
        }}
      >
        <div
          className="sr-card"
          style={{
            maxWidth: 420,
            width: "100%",
            background: "rgba(255,255,255,0.95)",
            borderRadius: 16,
            padding: "2rem",
          }}
        >
          <h1 className="sr-h1 mb-2">Acceso de mediadores</h1>
          <p className="sr-p mb-4">
            Introduce tu correo y contraseña para acceder al panel.
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="sr-label mb-1 block">Correo electrónico</label>
              <input
                name="email"
                type="email"
                className="sr-input w-full border border-zinc-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                value={form.email}
                onChange={onChange}
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label className="sr-label mb-1 block">Contraseña</label>
              <input
                name="password"
                type="password"
                className="sr-input w-full border border-zinc-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                value={form.password}
                onChange={onChange}
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <p className="sr-small mt-1" style={{ color: "#b91c1c" }}>
                {error}
              </p>
            )}

            <button
              className="sr-btn-primary w-full mt-2"
              type="submit"
              disabled={busy}
            >
              {busy ? "Accediendo…" : "Entrar al panel"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
