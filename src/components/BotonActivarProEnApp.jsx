// src/components/BotonActivarProEnApp.jsx
// Botón interno para activar PRO: comprueba el perfil y luego abre Stripe.

import React from "react";
import { useNavigate } from "react-router-dom";

const API =
  import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

export default function BotonActivarProEnApp() {
  const nav = useNavigate();

  async function handleActivatePro() {
    const token = localStorage.getItem("galenos_token");
    if (!token) return nav("/login");

    // 1) Comprobar perfil médico
    try {
      const resProfile = await fetch(`${API}/doctor/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (resProfile.status === 404) {
        // No tiene perfil → completar antes de Stripe
        return nav("/perfil-medico");
      }

      if (!resProfile.ok) {
        console.error("Error perfil:", await resProfile.text());
        alert("No se pudo comprobar tu perfil médico.");
        return;
      }
    } catch (err) {
      console.error("Perfil error:", err);
      return alert("No se pudo comprobar el perfil médico.");
    }

    // 2) Crear sesión de Stripe
    try {
      const res = await fetch(`${API}/billing/create-checkout-session`);
      const raw = await res.text();
      console.log("[Stripe raw]:", raw);

      if (!res.ok) {
        return alert("No se pudo iniciar la prueba PRO.");
      }

      const data = JSON.parse(raw);
      if (!data.checkout_url) {
        return alert("Stripe no devolvió la URL de pago.");
      }

      // Abrir Stripe
      const win = window.open(data.checkout_url, "_blank", "noopener,noreferrer");
      if (!win) window.location.href = data.checkout_url;
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
