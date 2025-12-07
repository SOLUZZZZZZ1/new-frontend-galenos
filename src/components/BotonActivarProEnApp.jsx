import React from "react";
import { useNavigate } from "react-router-dom";

const API =
  import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

export default function BotonActivarProEnApp() {
  const nav = useNavigate();

  async function handleActivatePro() {
    const token = localStorage.getItem("galenos_token");

    if (!token) {
      nav("/login");
      return;
    }

    // 1) Comprobar perfil médico real
    try {
      const resProfile = await fetch(`${API}/doctor/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const raw = await resProfile.text();
      console.log("👉 [/botón PRO] /doctor/profile/me:", raw);

      if (resProfile.status === 404) {
        nav("/perfil");
        return;
      }

      if (!resProfile.ok) {
        alert("No se pudo comprobar tu perfil médico.");
        return;
      }
    } catch (err) {
      console.error(err);
      alert("No se pudo comprobar el perfil médico.");
      return;
    }

    // 2) Crear sesión Stripe
    try {
      const res = await fetch(`${API}/billing/create-checkout-session`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const raw = await res.text();
      console.log("[Stripe]", raw);

      if (!res.ok) {
        alert("No se pudo iniciar la prueba PRO.");
        return;
      }

      const data = JSON.parse(raw);

      if (!data.checkout_url) {
        alert("Stripe no devolvió URL de pago.");
        return;
      }

      window.location.href = data.checkout_url;
    } catch (err) {
      console.error("Stripe error:", err);
      alert("Error al conectar con Stripe.");
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
