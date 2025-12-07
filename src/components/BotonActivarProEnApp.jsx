// Botón interno para activar PRO: comprueba el perfil en backend y luego abre Stripe.

import React from "react";
import { useNavigate } from "react-router-dom";

const API =
  import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

export default function BotonActivarProEnApp() {
  const nav = useNavigate();

  async function handleActivatePro() {
    const token = localStorage.getItem("galenos_token");

    // 1) Sin sesión → al login (no al alta)
    if (!token) {
      nav("/login");
      return;
    }

    // 2) Comprobar perfil médico REAL (tabla doctor_profiles)
    try {
      const resProfile = await fetch(`${API}/doctor/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const rawProfile = await resProfile.text();
      console.log("👉 [/botón PRO] /doctor/profile/me (raw):", rawProfile);

      if (resProfile.status === 404) {
        // No tiene perfil → ir a /perfil (formulario de perfil médico, NO alta de usuario)
        nav("/perfil");
        return;
      }

      if (!resProfile.ok) {
        console.error("Error perfil:", rawProfile);
        alert("No se pudo comprobar tu perfil médico.");
        return;
      }
    } catch (err) {
      console.error("Perfil error:", err);
      alert("No se pudo comprobar el perfil médico.");
      return;
    }

    // 3) Crear sesión de Stripe asociada al médico autenticado
    try {
      const res = await fetch(`${API}/billing/create-checkout-session`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const raw = await res.text();
      console.log("[Stripe raw]:", raw);

      if (!res.ok) {
        alert("No se pudo iniciar la prueba PRO.");
        return;
      }

      let data;
      try {
        data = JSON.parse(raw);
      } catch (e) {
        console.error("Error parseando respuesta Stripe:", e, raw);
        alert("Respuesta inesperada del servidor de pagos.");
        return;
      }

      if (!data.checkout_url) {
        alert("Stripe no devolvió la URL de pago.");
        return;
      }

      // 4) Redirigir directamente a Stripe (sin popups ni navegación SPA)
      window.location.href = data.checkout_url;
    } catch (err) {
      console.error("Stripe error:", err);
      alert("No se pudo conectar con Stripe.");
    }
  }

  return (
    <button
      onClick={handleActivatePro}
      className="sr-btn-primary text-sm whitespace-nowrap"
    >
      Activar Galenos PRO (3 días gratis)
    </button>
  );
}
