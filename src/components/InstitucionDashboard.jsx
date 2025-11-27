// src/components/InstitucionDashboard.jsx — Panel Institucional basado en Panel PRO
import React from "react";
import { Link } from "react-router-dom";

/**
 * Panel Institucional
 *
 * Props:
 * - who: email de la sesión (institución)
 * - institucion: nombre del ayuntamiento/colegio/cámara
 * - expiresAt: fecha de expiración (ISO o Date) opcional
 * - onLogout: función para cerrar sesión institucional
 *
 * Se usa igual que ProDashboard, pero sin PRO/trial/Stripe ni Voces publicar.
 */
export default function InstitucionDashboard({
  who,
  institucion,
  expiresAt,
  onLogout,
}) {
  const email = (who || "").trim();
  const nombreInstitucion = institucion || "Institución";

  const fechaExp =
    expiresAt instanceof Date
      ? expiresAt
      : expiresAt
      ? new Date(expiresAt)
      : null;

  const expiracionTexto = fechaExp
    ? fechaExp.toLocaleDateString("es-ES")
    : "—";

  return (
    <section className="sr-card" style={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* Cabecera (equivalente a Panel del Mediador) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="sr-h1">Panel del Ayuntamiento</h1>
          <p className="sr-small text-zinc-600">
            Sesión iniciada como: <b>{email || "—"}</b>
          </p>
          <p className="sr-small text-zinc-600">
            Entidad: <b>{nombreInstitucion}</b>
          </p>
          <p className="sr-small text-zinc-600 mt-1">
            Vigencia del acceso: <b>{expiracionTexto}</b>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Aquí podrías enlazar a un futuro perfil institucional */}
          <Link
            className="sr-btn-secondary"
            to="/panel-mediador/perfil"
          >
            Perfil
          </Link>
          <button className="sr-btn-secondary" type="button" onClick={onLogout}>
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Bloque informativo (en lugar del bloque PRO/trial) */}
      <div className="mt-4 rounded-2xl p-4 border bg-sky-50 text-sky-800">
        <p className="sr-p">
          Este panel está pensado para gestionar{" "}
          <b>mediación comunitaria, convivencia y conflictos vecinales</b> desde
          el Ayuntamiento o la institución: casos, actas, agenda e IA adaptada.
        </p>
      </div>

      {/* PESTAÑAS 3x3 — mismas que el PRO, pero sin PRO/trial/Stripe ni Voces publicar */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Fila 1 */}
        <Quick
          to="/panel-mediador/ai"
          label="IA Profesional"
          emoji="🤖"
          description="Usar IA para redactar escritos, resúmenes e informes."
        />
        <Quick
          to="/panel-mediador/ai-legal"
          label="IA Legal"
          emoji="⚖️"
          description="Soporte jurídico automatizado ligado a los casos."
        />
        <Quick
          to="/panel-mediador/acta"
          label="Actas"
          emoji="📝"
          description="Generar actas de sesión y documentos oficiales."
        />

        {/* Fila 2 */}
        <Quick
          to="/panel-mediador/casos"
          label="Casos comunitarios"
          emoji="🗂️"
          description="Registrar y gestionar expedientes de mediación vecinal."
        />
        <Quick
          to="/panel-mediador/agenda"
          label="Agenda"
          emoji="🗓️"
          description="Organizar citas, reuniones y seguimientos."
        />
        <Quick
          to="/panel-mediador/documentos"
          label="Documentos"
          emoji="📁"
          description="Acceder a plantillas y material de trabajo."
        />

        {/* Fila 3 */}
        <Quick
          to="/panel-mediador/perfil"
          label="Perfil"
          emoji="👤"
          description="Gestionar datos de contacto y configuración básica."
        />
        <Quick
          to="/voces"
          label="Voces (público)"
          emoji="📰"
          description="Leer artículos y contenido público de Mediazion."
        />
        <Quick
          to="/mediadores/directorio"
          label="Directorio de mediadores"
          emoji="👥"
          description="Consultar mediadores disponibles para derivaciones."
        />
      </div>

      {/* Mensaje inferior tipo PRO */}
      <div className="mt-8 text-center sr-small text-zinc-500">
        🛠️ Próximamente en tu Panel Institucional: estadísticas por barrio, informes
        listos para memoria anual y nuevas plantillas específicas para servicios municipales.
      </div>

      <div className="mt-2 text-center sr-small text-zinc-500">
        MEDIAZION · Panel Institucional — {new Date().getFullYear()} <br />
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

function Quick({ to, label, emoji, description }) {
  return (
    <Link
      to={to}
      className="rounded-2xl border p-4 bg-white hover:shadow-md"
      aria-disabled={false}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl">{emoji}</div>
        <div>
          <div className="font-semibold">{label}</div>
          <div className="sr-small text-zinc-600 mt-1">{description}</div>
        </div>
      </div>
    </Link>
  );
}
