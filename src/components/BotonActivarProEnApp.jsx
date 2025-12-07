// src/components/BotonActivarProEnApp.jsx
// Botón interno para activar PRO: comprueba perfil médico y luego abre Stripe Checkout.

import React from "react";
import axios from "axios";
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

    // 1) Comprobar que hay perfil médico creado
    try {
      await axios.get(`${API}/doctor/profile/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404) {
        // No hay perfil médico → llevar a la pantalla de perfil
        nav("/perfil-medico");
        return;
      }
      console.error("Error comprobando perfil médico:", err);
      alert("No se ha podido comprobar el perfil médico.");
      return;
    }

    // 2) Crear sesión de Stripe para la prueba PRO
    try {
      const res = await axios.get(`${API}/billing/create-checkout-session`);
      const url = res.data?.checkout_url;
      if (!url) {
        alert("El servidor no ha devuelto una URL de pago.");
        return;
      }

      const win = window.open(url, "_blank", "noopener,noreferrer");
      if (!win) {
        window.location.href = url;
      }
    } catch (err) {
      console.error("Error al iniciar pago en Stripe desde la app:", err);
      alert("No se ha podido conectar con el servidor de pagos.");
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
