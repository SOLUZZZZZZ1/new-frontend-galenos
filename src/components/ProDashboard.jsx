// src/components/ProDashboard.jsx — Dashboard PRO 3x3 con todas las pestañas + invitación colegas
import React from "react";
import { Link } from "react-router-dom";

export default class ProDashboard extends React.Component {
  render() {
    const {
      who,
      subStatus,
      trialLeft,
      onSubscribe,
      onLogout,
    } = this.props;

    const isPro = subStatus === "active" || subStatus === "trialing";

    let statusText = "";
    if (isPro && subStatus === "trialing") {
      if (typeof trialLeft === "number") {
        statusText = `PRO en prueba · te quedan ${trialLeft} día${
          trialLeft === 1 ? "" : "s"
        }.`;
      } else {
        statusText = "PRO en prueba · acceso completo temporal.";
      }
    } else if (isPro && subStatus === "active") {
      statusText = "PRO activo · acceso completo a todas las herramientas.";
    } else {
      statusText =
        "Panel BÁSICO · Activa PRO para desbloquear IA, actas, recursos y agenda.";
    }

    const email = (who || "").trim();

    return (
      <section className="sr-card" style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Cabecera */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items=center gap-3">
          <div>
            <h1 className="sr-h1">Panel del Mediador</h1>
            <p className="sr-small text-zinc-600">
              Sesión: <b>{who || "—"}</b>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Invitar colega → apunta al alta con ?ref=email si lo hay */}
            <Link
              className="sr-btn-secondary"
              to={
                email
                  ? `/mediadores/alta?ref=${encodeURIComponent(email)}`
                  : "/mediadores/alta"
              }
            >
              Invitar colega
            </Link>

            {/* Copiar invitación para WhatsApp / email */}
            <button
              className="sr-btn-secondary"
              type="button"
              onClick={() => {
                const base = "https://mediazion.eu/mediadores";
                const msg =
                  "Hola! Estoy usando Mediazion para gestionar mis mediaciones (IA profesional con visión para leer documentos, actas, agenda, casos...). " +
                  "Puedes darte de alta gratis aquí: " +
                  base;
                if (navigator.clipboard && navigator.clipboard.writeText) {
                  navigator.clipboard
                    .writeText(msg)
                    .then(() =>
                      alert(
                        "Texto de invitación copiado. Pégalo en WhatsApp o email."
                      )
                    )
                    .catch(() =>
                      alert(
                        "No se pudo copiar automáticamente. Copia este texto manualmente:\n\n" +
                          msg
                      )
                    );
                } else {
                  alert(
                    "Copia este texto y pégalo en WhatsApp o email:\n\n" + msg
                  );
                }
              }}
            >
              Copiar invitación
            </button>

            <Link className="sr-btn-secondary" to="/panel-mediador/perfil">
              Mi perfil
            </Link>
            <Link
              className="sr-btn-secondary"
              to="/panel-mediador/perfil?tab=seguridad"
            >
              Seguridad (Perfil)
            </Link>
            <button className="sr-btn-secondary" onClick={onLogout}>
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Estado PRO / BASIC */}
        <div className="mt-4">
          {isPro ? (
            <div className="rounded-2xl p-4 border bg-emerald-50 text-emerald-800">
              <p className="sr-p">
                <b>
                  {subStatus === "trialing" ? "PRO (trial)" : "PRO activo"}
                </b>{" "}
                — {statusText}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl p-4 border bg-amber-50 text-amber-800">
              <p className="sr-p">{statusText}</p>
              {onSubscribe && (
                <button
                  className="sr-btn-secondary mt-2"
                  onClick={onSubscribe}
                >
                  Activar prueba PRO 7 días
                </button>
              )}
            </div>
          )}
        </div>

        {/* PESTAÑAS 3x3 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Fila 1 */}
          <Quick
            to="/panel-mediador/ai"
            label="IA Profesional"
            emoji="🤖"
            disabled={!isPro}
          />
          <QuickAction
            to="/panel-mediador/ai-legal"
            title="IA Legal"
            emoji="⚖️"
            disabled={!isPro}
          />
          <Quick
            to="/panel-mediador/acta"
            label="Actas"
            emoji="📝"
            disabled={!isPro}
          />

          {/* Fila 2 */}
          <Quick
            to="/panel-mediador/casos"
            label="Casos"
            emoji="🗂️"
            disabled={!isPro}
          />
          <Quick
            to="/panel-mediador/agenda"
            label="Agenda"
            emoji="🗓️"
            disabled={!isPro}
          />
          <Quick
            to="/panel-mediador/pagos"
            label="Recursos"
            emoji="💳"
            disabled={!isPro}
          />

          {/* Fila 3 */}
          <Quick
            to="/panel-mediador/perfil"
            label="Perfil"
            emoji="👤"
            disabled={false} // Perfil siempre accesible
          />
          <Quick
            to="/panel-mediador/voces/nuevo"
            label="Voces (publicar)"
            emoji="🖊️"
            disabled={!isPro}
          />
          <Quick
            to="/voces"
            label="Voces (público)"
            emoji="📰"
            disabled={false}
          />
        </div>

        {/* Mensaje de evolución del panel */}
        <div className="mt-8 text-center sr-small text-zinc-500">
          🛠️ Próximamente en tu Panel PRO: videollamadas integradas, nuevas plantillas IA y más recursos descargables.
        </div>

        {/* Enlace a instrucciones de uso del panel */}
        <div className="mt-2 text-center sr-small text-zinc-500">
          MEDIAZION · Panel PRO — {new Date().getFullYear()} <br />
          <Link
            to="/panel-mediador/instrucciones"
            className="underline text-sky-600 hover:text-sky-800"
          >
            Instrucciones de uso del Panel
          </Link>
        </div>
      </section>
    );
  }
}

function Quick({ to, label, emoji, disabled }) {
  const cls = disabled ? "opacity-50 pointer-events-none" : "hover:shadow-md";
  return (
    <Link
      to={to}
      className={`rounded-2xl border p-4 bg-white ${cls}`}
      aria-disabled={disabled}
    >
      <div className="flex items-center gap-3">
        <div className="text-2xl">{emoji}</div>
        <div>
          <div className="font-semibold">{label}</div>
          <div className="sr-small text-zinc-600">Abrir</div>
        </div>
      </div>
    </Link>
  );
}

function QuickAction({ to, title, emoji, disabled }) {
  const cls = disabled ? "opacity-50 pointer-events-none" : "hover:shadow-md";
  return (
    <Link
      to={to}
      className={`rounded-2xl border p-4 bg-white ${cls}`}
      aria-disabled={disabled}
    >
      <div className="flex items-center gap-3">
        <div className="text-2xl">{emoji}</div>
        <div>
          <div className="font-semibold">{title}</div>
          <div className="sr-small text-zinc-600">Abrir</div>
        </div>
      </div>
    </Link>
  );
}
