// payment.js (frontend)
export async function startCheckout(amountCents) {
  const res = await fetch("https://backend-api-mediazion-1.onrender.com/create-checkout-session", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ price_cents: amountCents, currency: "eur", description: "Manual Mediación" })
  });
  if (!res.ok) throw new Error("Error creando sesión de pago");
  const data = await res.json();
  // redirige al checkout hosted de Stripe
  window.location.href = data.url;
}
