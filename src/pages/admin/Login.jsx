// src/pages/admin/Login.jsx — Login sencillo de administración MEDIAZION
import React, { useState, useEffect } from "react";
import Seo from "../../components/Seo.jsx";
import { useNavigate } from "react-router-dom";

const LS_ADMIN_KEY = "mediazion_admin_auth";

export default function AdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@mediazion.eu");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Si ya hay sesión admin, ir directo al dashboard
  useEffect(() => {
    const stored = localStorage.getItem(LS_ADMIN_KEY);
    if (stored === "ok") {
      nav("/admin/dashboard", { replace: true });
    }
  }, [nav]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      // 🔹 Versión simple: validación local
      // Más adelante podemos conectar esto a /api/admin/login si quieres.
      if (email === "admin@mediazion.eu" && password === "8354Law1") {
        localStorage.setItem(LS_ADMIN_KEY, "ok");
        nav("/admin/dashboard", { replace: true });
        return;
      }

      setErrorMsg("Credenciales incorrectas.");
    } catch (err) {
      setErrorMsg("Error iniciando sesión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Seo
        title="Admin · Acceso"
        description="Acceso de administración MEDIAZION"
        canonical="https://mediazion.eu/admin"
      />
      <main className="sr-container py-12" style={{ minHeight: "calc(100vh - 160px)" }}>
        <div className="max-w-md mx-auto sr-card">
          <h1 className="sr-h1 mb-4">Acceso Admin</h1>
          <p className="sr-small text-zinc-600 mb-4">
            Panel de administración de MEDIAZION. Solo para uso interno.
          </p>

          {errorMsg && (
            <div
              className="sr-card mb-4"
              style={{ borderColor: "#fecaca", color: "#991b1b" }}
            >
              <p className="sr-small">❌ {errorMsg}</p>
            </div>
          )}

          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div>
              <label className="sr-label">Email</label>
              <input
                type="email"
                className="sr-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div>
              <label className="sr-label">Contraseña</label>
              <input
                type="password"
                className="sr-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <button
              className="sr-btn-primary"
              type="submit"
              disabled={loading}
            >
              {loading ? "Entrando…" : "Entrar"}
            </button>
          </form>

          <p className="sr-small text-zinc-500 mt-4">
            Si olvidas las credenciales, contacta con soporte interno de MEDIAZION.
          </p>
        </div>
      </main>
    </>
  );
}
