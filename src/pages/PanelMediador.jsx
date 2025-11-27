// src/pages/PanelMediador.jsx — Panel del mediador con trial + Stripe bien integrados
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import ProDashboard from "../components/ProDashboard.jsx";
import StripeButton from "../components/StripeButton.jsx";

const LS_EMAIL = "mediador_email";

export default function PanelMediador() {
  const nav = useNavigate();
  const email = (localStorage.getItem(LS_EMAIL) || "").trim();

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  const [subStatus, setSubStatus] = useState("none");
  const [accountStatus, setAccountStatus] = useState("missing");
  const [trialEnd, setTrialEnd] = useState(null);
  const [trialLeft, setTrialLeft] = useState(null);

  useEffect(() => {
    if (!email) {
      nav("/acceso");
      return;
    }
    loadStatus();
  }, [email, nav]);

  async function loadStatus() {
    setLoading(true);
    setErrorMsg("");
    setInfoMsg("");

    try {
      const resp = await fetch(
        `/api/mediadores/status?email=${encodeURIComponent(email)}`
      );
      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "No se pudo cargar el estado PRO/BÁSICO."
        );
      }

      const status = data.subscription_status || "none";
      setSubStatus(status);
      setAccountStatus(data.status || "active");

      if (data.trial_end) {
        const end = new Date(data.trial_end);
        const now = new Date();
        setTrialEnd(end.toISOString());

        const ms = end.getTime() - now.getTime();
        const days = Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
        setTrialLeft(days);
      } else {
        setTrialEnd(null);
        setTrialLeft(null);
      }
    } catch (e) {
      setErrorMsg(e.message || "Error cargando el estado del mediador.");
    } finally {
      setLoading(false);
    }
  }

  // Activa trial solo si está en BASIC (none)
  async function handleTrial() {
    try {
      if (subStatus !== "none") {
        setInfoMsg("Ya tienes una prueba o un plan PRO en curso.");
        return;
      }

      const resp = await fetch(
        `/api/mediadores/set_trial?email=${encodeURIComponent(email)}`,
        { method: "POST" }
      );
      const data = await resp.json().catch(() => ({}));

      if (!resp.ok || !data?.ok) {
        throw new Error(
          data?.detail || data?.message || "No se pudo activar la prueba PRO."
        );
      }

      setInfoMsg("🎉 Prueba PRO de 7 días activada correctamente.");
      await loadStatus();
    } catch (e) {
      setErrorMsg(e.message || "Error activando la prueba PRO.");
    }
  }

  function handleLogout() {
    localStorage.removeItem(LS_EMAIL);
    nav("/acceso");
  }

  // --- Cálculo del estado real (trial activo vs. trial caducado) ---
  const now = new Date();
  const endDate = trialEnd ? new Date(trialEnd) : null;
  const trialActive =
    subStatus === "trialing" && endDate && endDate.getTime() > now.getTime();

  const isSubscribed = subStatus === "active";      // PRO de pago
  const isPro = isSubscribed || trialActive;       // PRO (trial o pago)

  // Tus correos "maestros" para test Stripe aunque ya sean PRO
  const isMaster = ["soluzziona@gmail.com", "marbra.mrb@gmail.com"].includes(
    email.toLowerCase()
  );

  return (
    <>
      <Seo title="Panel del mediador · Mediazion" />
      <main
        className="sr-container py-8"
        style={{ minHeight: "calc(100vh - 160px)" }}
      >
        {errorMsg && (
          <div
            className="sr-card mb-4"
            style={{ borderColor: "#fecaca", color: "#991b1b" }}
          >
            <p className="sr-small">❌ {errorMsg}</p>
          </div>
        )}

        {infoMsg && (
          <div
            className="sr-card mb-4"
            style={{ borderColor: "#bbf7d0", color: "#166534" }}
          >
            <p className="sr-small">✅ {infoMsg}</p>
          </div>
        )}

        {loading ? (
          <p className="sr-p">Cargando tu panel…</p>
        ) : (
          <>
            {/* Panel principal con tu diseño */}
            <ProDashboard
              who={email}
              subStatus={subStatus}
              trialLeft={trialActive ? trialLeft : null}
              onSubscribe={subStatus === "none" ? handleTrial : null}
              onLogout={handleLogout}
            />

            {/* BLOQUE: Suscripción PRO para usuarios que YA NO son PRO */}
            {!isPro && (
              <section className="sr-card mt-6">
                <h2 className="sr-h2 mb-2">Suscripción PRO</h2>
                <p className="sr-p mb-2">
                  Tu prueba PRO ha finalizado o aún no la has activado. Si
                  quieres seguir utilizando IA, actas, recursos y agenda
                  avanzada, puedes activar tu suscripción PRO.
                </p>
                <StripeButton
                  email={email}
                  label="Activar suscripción PRO"
                />
              </section>
            )}

            {/* BLOQUE: Test Stripe SOLO para tus correos maestros, aunque ya estén en PRO */}
            {isPro && isMaster && (
              <section className="sr-card mt-6">
                <h2 className="sr-h2 mb-2">🧪 Test Stripe (solo admin)</h2>
                <p className="sr-small text-zinc-600 mb-2">
                  Este botón se muestra solo para tus correos maestros para
                  probar el flujo de Stripe aunque tu cuenta ya sea PRO.
                </p>
                <StripeButton
                  email={email}
                  label="Probar flujo de pago Stripe"
                />
              </section>
            )}
          </>
        )}
      </main>
    </>
  );
}
