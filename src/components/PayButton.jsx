// src/components/PayButton.jsx
import React, { useState } from "react";
import { startCheckout } from "../lib/payment";

export default function PayButton({ amountCents = 1200 }){ // 12,00 €
  const [loading, setLoading] = useState(false);
  const onPay = async () => {
    try {
      setLoading(true);
      await startCheckout({ amountCents, description: "Manual de Mediación MEDIAZION" });
    } catch (e) {
      alert(e.message || "Error iniciando pago");
      setLoading(false);
    }
  };
  return (
    <button className="sr-btn-primary" disabled={loading} onClick={onPay}>
      {loading ? "Redirigiendo a Stripe..." : `Comprar y descargar (${(amountCents/100).toFixed(2)} €)`}
    </button>
  );
}
