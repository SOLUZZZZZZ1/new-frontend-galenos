// src/components/StripeButton.jsx — Botón de suscripción Stripe (Checkout en pestaña nueva)
import React, { useState } from "react";

const LS_EMAIL = "mediador_email";

export default function StripeButton({ email: emailProp, label = "Suscribirme a PRO" }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const email = (emailProp || localStorage.getItem(LS_EMAIL) || "").trim();

  async function handleClick() {
    setErrorMsg("");

    if (!email) {
      setErrorMsg("No se ha encontrado el email del mediador.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/stripe/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const text = await res.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {}

      if (!res.ok || !data?.url) {
        const msg =
          (data && (data.detail || data.message)) ||
          "No se pudo iniciar la suscripción.";
        throw new Error(msg);
      }

      const stripeUrl = data.url;
      const opened = window.open(stripeUrl, "_blank");

      // Fallback si el navegador bloquea la pestaña nueva
      if (!opened) {
        window.location.href = stripeUrl;
      }
    } catch (e) {
      setErrorMsg(e.message || "Error conectando con Stripe.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        className="sr-btn-primary"
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? "Conectando con Stripe…" : label}
      </button>
      {errorMsg && (
        <p className="sr-small mt-2" style={{ color: "#991b1b" }}>
          ❌ {errorMsg}
        </p>
      )}
    </div>
  );
}
