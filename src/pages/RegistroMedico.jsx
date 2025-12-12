// src/pages/RegistroMedico.jsx — Alta de médico desde invitación · Galenos.pro
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// URL del backend de Galenos (Render)
const API = import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

export default function RegistroMedico() {
  const navigate = useNavigate();
  const location = useLocation();

  const [token, setToken] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get("token") || "";
    setToken(t);
  }, [location.search]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Falta el token de invitación. Asegúrate de usar el enlace completo.");
      return;
    }
    if (!email || !password) {
      setError("Introduce al menos tu correo y una contraseña.");
      return;
    }

    try {
      setLoading(true);

      const body = {
        email,
        password,
        name: name || null,
        token,
      };

      console.log("🔥 Registro desde invitación contra:", `${API}/auth/register-from-invite`);

      const res = await fetch(`${API}/auth/register-from-invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const raw = await res.text();
      console.log("👉 Respuesta registro (raw):", raw);

      if (!res.ok) {
        try {
          const errData = JSON.parse(raw);
          setError(errData.detail || "No se ha podido completar el registro.");
        } catch (err) {
          setError("No se ha podido completar el registro.");
        }
        return;
      }

      let data;
      try {
        data = JSON.parse(raw);
      } catch (err) {
        console.error("❌ No se pudo parsear JSON de registro:", err);
        setError("Error inesperado en el servidor de registro.");
        return;
      }

      const tokenResp = data.access_token || data.token || null;
      if (!tokenResp) {
        setError("Registro correcto pero sin token de acceso. Revisa la API.");
        return;
      }

      // Guardar token y datos mínimos
      localStorage.setItem("galenos_token", tokenResp);
      localStorage.setItem("galenos_email", email || "");
      if (name) {
        localStorage.setItem("galenos_name", name);
      }

      // Redirigir al panel médico
      navigate("/panel-medico", { replace: true });
    } catch (err) {
      console.error("❌ Error en petición de registro:", err);
      setError("No se ha podido conectar con el servidor de registro.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="sr-container py-8 flex items-center justify-center">
      <section className="sr-card max-w-md w-full space-y-6">
        <header className="space-y-1">
          <h1 className="sr-h1 text-2xl">Alta de médico · Galenos.pro</h1>
          <p className="sr-p text-sm text-slate-600">
            Completa tus datos para acceder al panel médico. Este enlace está protegido por invitación.
          </p>
        </header>

        {!token && (
          <p className="sr-small text-red-600">
            No se ha encontrado ningún token de invitación en el enlace. Pide a tu colega que te reenvíe el enlace completo,
            o bien solicita acceso directo.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="sr-label">
              Nombre y apellidos (opcional)
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="sr-input w-full"
              placeholder="Dr./Dra. Nombre Apellidos"
            />
          </div>

          <div>
            <label htmlFor="email" className="sr-label">
              Correo profesional
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
              autoComplete="new-password"
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
            disabled={loading || !token}
            className="sr-btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta y acceder"}
          </button>
        </form>

        <p className="sr-small text-slate-500 text-xs">
          ¿No tienes invitación y quieres usar Galenos.pro?{" "}
          <button
            type="button"
            onClick={() => navigate("/solicitar-acceso")}
            className="underline text-sky-700 hover:text-sky-800"
          >
            Solicita acceso aquí
          </button>
          .
        </p>

        <p className="sr-small text-slate-500 text-xs">
          Galenos.pro es una herramienta de apoyo al médico. La decisión clínica final corresponde siempre al médico responsable.
        </p>
      </section>
    </main>
  );
}
