// src/pages/ResetPassword.jsx — Galenos (SAFE)
// - Lee token de URL: /reset-password?token=...

import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function ResetPassword() {
  const q = useQuery();
  const navigate = useNavigate();
  const token = (q.get("token") || "").trim();

  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [saving, setSaving] = useState(false);
  const [info, setInfo] = useState("");
  const [err, setErr] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setInfo("");

    if (!token || token.length < 16) {
      setErr("Enlace inválido. Solicita uno nuevo.");
      return;
    }
    if (!pw1 || pw1.length < 10) {
      setErr("La nueva contraseña debe tener al menos 10 caracteres.");
      return;
    }
    if (pw1 !== pw2) {
      setErr("La confirmación no coincide.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`${API}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: pw1 }),
      });

      const raw = await res.text();
      if (!res.ok) {
        let msg = "No se pudo restablecer la contraseña.";
        try {
          const data = JSON.parse(raw);
          if (data?.detail) msg = data.detail;
        } catch {}
        setErr(msg);
        return;
      }

      setInfo("Contraseña actualizada. Ya puedes iniciar sesión.");
      setPw1("");
      setPw2("");
      setTimeout(() => navigate("/login"), 1200);
    } catch {
      setErr("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="sr-container py-8">
      <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <h1 className="text-xl font-semibold text-slate-900">Restablecer contraseña</h1>

        {!token ? (
          <p className="text-sm text-rose-700">Enlace inválido. Solicita uno nuevo desde login.</p>
        ) : (
          <>
            <p className="text-sm text-slate-600">
              Define una nueva contraseña (mínimo 10 caracteres).
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="sr-label">Nueva contraseña</label>
                <input
                  className="sr-input w-full"
                  type="password"
                  autoComplete="new-password"
                  value={pw1}
                  onChange={(e) => setPw1(e.target.value)}
                  placeholder="Mínimo 10 caracteres"
                />
              </div>

              <div>
                <label className="sr-label">Repite la nueva contraseña</label>
                <input
                  className="sr-input w-full"
                  type="password"
                  autoComplete="new-password"
                  value={pw2}
                  onChange={(e) => setPw2(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                />
              </div>

              {err && <p className="text-sm text-rose-700">{err}</p>}
              {info && <p className="text-sm text-emerald-700">{info}</p>}

              <button
                type="submit"
                disabled={saving}
                className="sr-btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? "Guardando..." : "Guardar contraseña"}
              </button>
            </form>
          </>
        )}

        <button type="button" onClick={() => navigate("/login")} className="sr-btn-secondary">
          Volver a login
        </button>
      </div>
    </div>
  );
}
