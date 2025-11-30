// src/pages/RegistroMedicoLibre.jsx — Alta directa de médico (sin invitación) + arranque Stripe · Galenos.pro
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// URL del backend de Galenos (Render)
const API = import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

export default function RegistroMedicoLibre() {
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const [nextParam, setNextParam] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const n = params.get("next") || "";
    setNextParam(n);
  }, [location.search]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!email || !password) {
      setError("Introduce al menos tu correo y una contraseña.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== password2) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setLoading(true);

      // 1) Crear usuario en /auth/register (no envía correos, solo da de alta)
      const bodyRegister = {
        email,
        password,
        name: name || null,
      };

      console.log("🔥 Registro libre contra:", `${API}/auth/register`);

      const resReg = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyRegister),
      });

      const rawReg = await resReg.text();
      console.log("👉 Respuesta registro libre (raw):", rawReg);

      if (!resReg.ok) {
        try {
          const errData = JSON.parse(rawReg);
          setError(errData.detail || "No se ha podido completar el alta.");
        } catch (err) {
          setError("No se ha podido completar el alta.");
        }
        return;
      }

      // 2) Login automático para obtener el token
      const bodyLogin = {
        email,
        password,
      };

      console.log("🔥 Login automático tras alta contra:", `${API}/auth/login`);

      const resLogin = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyLogin),
      });

      const rawLogin = await resLogin.text();
      console.log("👉 Respuesta login tras alta (raw):", rawLogin);

      if (!resLogin.ok) {
        setError("Alta correcta, pero no se ha podido iniciar sesión automáticamente. Prueba a entrar desde el login.");
        return;
      }

      let dataLogin;
      try {
        dataLogin = JSON.parse(rawLogin);
      } catch (err) {
        console.error("❌ No se pudo parsear JSON de login tras alta:", err);
        setError("Alta correcta, pero error inesperado al iniciar sesión.");
        return;
      }

      const token = dataLogin.access_token || dataLogin.token || null;
      if (!token) {
        setError("Alta correcta, pero la API no ha devuelto token de acceso.");
        return;
      }

      // Guardar token y datos mínimos como en LoginMedico
      localStorage.setItem("galenos_token", token);
      localStorage.setItem("galenos_email", dataLogin.email || email || "");
      if (name || dataLogin.name) {
        localStorage.setItem("galenos_name", dataLogin.name || name);
      }

      // 3) Si viene desde el botón PRO (next=pro), arrancamos Stripe directamente
      if (nextParam === "pro") {
        setInfo("Cuenta creada correctamente. Conectando con Stripe…");

        try {
          console.log("💳 [Alta] Creando sesión de Stripe en:", `${API}/billing/create-checkout-session`);
          const resStripe = await fetch(`${API}/billing/create-checkout-session`);
          const rawStripe = await resStripe.text();
          console.log("👉 [Alta] Respuesta Stripe (raw):", rawStripe);

          if (!resStripe.ok) {
            setError("Cuenta creada, pero no se ha podido iniciar el pago en Stripe.");
            return;
          }

          let dataStripe;
          try {
            dataStripe = JSON.parse(rawStripe);
          } catch (err) {
            console.error("❌ [Alta] No se pudo parsear JSON de Stripe:", err);
            setError("Cuenta creada, pero respuesta inesperada del servidor de pagos.");
            return;
          }

          if (!dataStripe.checkout_url) {
            setError("Cuenta creada, pero el servidor no ha devuelto una URL de pago.");
            return;
          }

          const newWin = window.open(
            dataStripe.checkout_url,
            "_blank",
            "noopener,noreferrer"
          );
          if (!newWin) {
            window.location.href = dataStripe.checkout_url;
          }
          return; // no navegamos más desde aquí; Stripe redirige luego al panel
        } catch (err) {
          console.error("❌ [Alta] Error al conectar con Stripe:", err);
          setError("Cuenta creada, pero no se ha podido conectar con Stripe.");
          return;
        }
      }

      // 4) Si no viene de PRO, lo mandamos al panel médico normal
      setInfo("Cuenta creada correctamente. Entrando al panel…");
      navigate("/panel-medico", { replace: true });
    } catch (err) {
      console.error("❌ Error en alta libre:", err);
      setError("No se ha podido conectar con el servidor de alta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="sr-container py-8 flex items-center justify-center">
      <section className="sr-card max-w-md w-full space-y-6">
        <header className="space-y-1">
          <h1 className="sr-h1 text-2xl">Crear cuenta · Galenos.pro</h1>
          <p className="sr-p text-sm text-slate-600">
            Crea tu cuenta de médico en Galenos.pro. Después podrás activar tu prueba de 3 días de Galenos PRO con Stripe.
          </p>
        </header>

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

          <div>
            <label htmlFor="password2" className="sr-label">
              Repite la contraseña
            </label>
            <input
              id="password2"
              type="password"
              autoComplete="new-password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              className="sr-input w-full"
            />
          </div>

          {error && (
            <p className="sr-small text-red-600">
              {error}
            </p>
          )}

          {info && (
            <p className="sr-small text-emerald-600">
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="sr-btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta y continuar"}
          </button>
        </form>

        <p className="sr-small text-slate-500 text-xs">
          Si ya tienes cuenta, puedes{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="underline text-sky-700 hover:text-sky-800"
          >
            entrar desde aquí
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
