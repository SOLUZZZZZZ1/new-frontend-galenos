// src/pages/AyuntamientoLogin.jsx — Acceso Ayuntamientos · Mediazion
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../components/Seo.jsx";

const LS_AYTO_TOKEN = "ayto_token";

export default function AyuntamientoLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");
    setBusy(true);

    try {
      // 🔹 Más adelante: cambiar a llamada real:
      // const resp = await fetch("/api/ayuntamientos/login", { ... })
      // Por ahora, simulamos login si el email no está vacío:
      if (!email || !pass) {
        throw new Error("Introduce email y contraseña.");
      }

      // Guardamos un token simple en localStorage
      localStorage.setItem(LS_AYTO_TOKEN, email);
      setMsg("✅ Acceso correcto. Redirigiendo al panel…");
      setTimeout(() => {
        nav("/panel-ayuntamiento");
      }, 700);
    } catch (e) {
      setMsg("❌ " + (e.message || "Error de acceso"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Seo
        title="Acceso Ayuntamientos · Mediazion"
        description="Acceso al panel de mediación comunitaria para Ayuntamientos."
        canonical="https://mediazion.eu/ayuntamientos/acceso"
      />
      <main
        className="sr-container py-12"
        style={{ minHeight: "calc(100vh - 160px)" }}
      >
        <h1 className="sr-h1 mb-4">Acceso Ayuntamientos</h1>
        <p className="sr-p mb-4">
          Introduce las credenciales facilitadas por Mediazion para acceder al
          Panel de Mediación Comunitaria de tu Ayuntamiento.
        </p>

        <section className="sr-card" style={{ maxWidth: 480 }}>
          <form onSubmit={onSubmit} className="grid gap-3">
            <div>
              <label className="sr-label">Email institucional</label>
              <input
                type="email"
                className="sr-input"
                placeholder="ayuntamiento@municipio.es"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="sr-label">Contraseña</label>
              <input
                type="password"
                className="sr-input"
                placeholder="********"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
              />
            </div>
            <button className="sr-btn-primary" type="submit" disabled={busy}>
              {busy ? "Accediendo…" : "Entrar al panel"}
            </button>
            {msg && (
              <p className="sr-small" style={{ color: msg.startsWith("✅") ? "#166534" : "#991b1b" }}>
                {msg}
              </p>
            )}
          </form>
        </section>
      </main>
    </>
  );
}
