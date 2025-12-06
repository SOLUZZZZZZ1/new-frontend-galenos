// src/pages/RegistroMedicoLibre.jsx — Alta libre de médico · Galenos.pro
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// URL del backend de Galenos (Render)
const API =
  import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

export default function RegistroMedicoLibre() {
  const navigate = useNavigate();
  const location = useLocation();

  // Si viene ?next=pro o similar, lo respetamos
  const params = new URLSearchParams(location.search);
  const next = params.get("next") || "/dashboard";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [alias, setAlias] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const SPECIALTIES = [
    "Medicina de familia",
    "Medicina interna",
    "Urgencias",
    "Cardiología",
    "Neumología",
    "Nefrología",
    "Endocrinología",
    "Oncología",
    "Neurología",
    "Psiquiatría",
    "Pediatría",
    "Traumatología",
    "Otra",
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!name.trim()) {
      setError("Introduce tu nombre o nombre profesional.");
      return;
    }
    if (!email.trim()) {
      setError("Introduce tu correo.");
      return;
    }
    if (!alias.trim()) {
      setError("Introduce un alias profesional (será visible en De Guardia).");
      return;
    }
    if (!password || !password2) {
      setError("Introduce y confirma tu contraseña.");
      return;
    }
    if (password !== password2) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const payload = {
      name: name.trim(),
      email: email.trim(),
      password: password,
      specialty: specialty || null,
      alias: alias.trim(),
    };

    try {
      setLoading(true);
      console.log("🩺 [Registro] Enviando a:", `${API}/auth/register`);

      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const raw = await res.text();
      console.log("👉 [Registro] Respuesta (raw):", raw);

      if (!res.ok) {
        let msg = "No se ha podido completar el registro.";
        try {
          const errData = JSON.parse(raw);
          if (errData.detail) msg = errData.detail;
        } catch {}
        setError(msg);
        return;
      }

      let data;
      try {
        data = JSON.parse(raw);
      } catch (err) {
        console.error("❌ [Registro] No se pudo parsear JSON:", err);
        setError("Respuesta inesperada del servidor de registro.");
        return;
      }

      const token = data.access_token || data.token || null;

      if (!token) {
        setInfo(
          "Registro completado, pero el servidor no devolvió token. Intenta iniciar sesión manualmente."
        );
        return;
      }

      // Guardar datos básicos en localStorage
      localStorage.setItem("galenos_token", token);
      localStorage.setItem("galenos_email", data.email || email || "");
      if (data.name || name) {
        localStorage.setItem("galenos_name", data.name || name);
      }
      if (data.alias || alias) {
        localStorage.setItem("galenos_alias", data.alias || alias);
      }
      if (data.specialty || specialty) {
        localStorage.setItem("galenos_specialty", data.specialty || specialty);
      }

      setInfo("Registro completado. Redirigiendo al panel...");
      // Redirigir a la ruta deseada
      navigate(next, { replace: true });
    } catch (err) {
      console.error("❌ [Registro] Error al conectar con el backend:", err);
      setError("No se ha podido conectar con el servidor de registro.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="sr-container py-8 flex items-center justify-center">
      <section className="sr-card max-w-lg w-full space-y-6">
        <header className="space-y-1">
          <h1 className="sr-h1 text-2xl">Alta de médico · Galenos.pro</h1>
          <p className="sr-p text-sm text-slate-600">
            Crea tu cuenta profesional. Más adelante podrás activar Galenos PRO con 3 días de
            prueba desde tu panel. No se te cobrará nada al registrarte.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="sr-label">Nombre completo / Nombre profesional</label>
            <input
              type="text"
              className="sr-input w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Dra. Marta López"
            />
          </div>

          <div>
            <label className="sr-label">Correo electrónico</label>
            <input
              type="email"
              className="sr-input w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu.correo@hospital.com"
            />
          </div>

          <div>
            <label className="sr-label">Especialidad</label>
            <select
              className="sr-input w-full"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
            >
              <option value="">Selecciona especialidad (opcional)</option>
              {SPECIALTIES.map((sp) => (
                <option key={sp} value={sp}>
                  {sp}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="sr-label">Alias profesional</label>
            <input
              type="text"
              className="sr-input w-full"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="Nombre que se mostrará en De Guardia (sin datos reales)"
            />
            <p className="sr-small text-xs text-slate-500 mt-1">
              Ejemplo: <strong>Internista Norte</strong>, <strong>MFyC Sur</strong>,{" "}
              <strong>NeuroDoc</strong>… No uses tu nombre real si no lo deseas.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="sr-label">Contraseña</label>
              <input
                type="password"
                className="sr-input w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="sr-label">Repite la contraseña</label>
              <input
                type="password"
                className="sr-input w-full"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          </div>

          {error && <p className="sr-small text-red-600">{error}</p>}
          {info && !error && <p className="sr-small text-emerald-700">{info}</p>}

          <div className="flex items-center gap-2 mt-2">
            <input
              id="legal"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300"
              required
            />
            <label htmlFor="legal" className="sr-small text-xs text-slate-600">
              Acepto la{" "}
              <span className="underline cursor-pointer">
                política de privacidad y condiciones de uso
              </span>{" "}
              de Galenos.pro (uso exclusivo profesional sanitario).
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="sr-btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed mt-3"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta profesional"}
          </button>
        </form>

        <p className="sr-small text-xs text-slate-500">
          Si ya tienes cuenta, puedes{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            iniciar sesión aquí
          </button>
          .
        </p>
      </section>
    </main>
  );
}
