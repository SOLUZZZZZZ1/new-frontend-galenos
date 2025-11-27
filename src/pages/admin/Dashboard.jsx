// src/pages/admin/Dashboard.jsx
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const LS_ADMIN_KEY = "mediazion_admin_auth";

export default function AdminDashboard() {
  const nav = useNavigate();

  // Protección básica: si no hay "login" admin, redirige al /admin (login)
  useEffect(() => {
    const token = localStorage.getItem(LS_ADMIN_KEY);
    if (token !== "ok") {
      nav("/admin", { replace: true });
    }
  }, [nav]);

  return (
    <main
      className="sr-container py-10"
      style={{ minHeight: "calc(100vh - 160px)" }}
    >
      <h1 className="sr-h1 mb-2">Panel de administración</h1>
      <p className="sr-p mb-8">
        Espacio interno para controlar Mediazion: accesos rápidos a mediadores,
        contenido, contactos, IA, instituciones y utilidades técnicas.
      </p>

      {/* BLOQUE 1: Tarjetas resumen / accesos rápidos */}
      <section className="grid gap-6 md:grid-cols-3 mb-10">
        {/* Mediadores */}
        <div className="sr-card">
          <h2 className="sr-h2 mb-2">Mediadores</h2>
          <p className="sr-p mb-4">
            Revisa quién está dado de alta, accede a su panel y consulta el
            directorio público.
          </p>
          <div className="flex flex-col gap-2">
            <Link to="/mediadores/directorio" className="sr-btn-secondary">
              Ver directorio público
            </Link>
            <Link to="/panel-mediador" className="sr-btn-secondary">
              Entrar al Panel de mediador (vista PRO)
            </Link>
            <Link to="/admin/mediadores" className="sr-btn-secondary">
              Gestionar mediadores (admin)
            </Link>
          </div>
        </div>

        {/* Contenido y Voces */}
        <div className="sr-card">
          <h2 className="sr-h2 mb-2">Contenido · Voces</h2>
          <p className="sr-p mb-4">
            Revisa los artículos publicados y el espacio Voces como escaparate
            de Mediazion.
          </p>
          <div className="flex flex-col gap-2">
            <Link to="/voces" className="sr-btn-secondary">
              Ver Voces público
            </Link>
            <Link to="/panel-mediador/voces" className="sr-btn-secondary">
              Ver “Mis Voces” (lista PRO)
            </Link>
          </div>
        </div>

        {/* Contacto y leads */}
        <div className="sr-card">
          <h2 className="sr-h2 mb-2">Contactos desde la web</h2>
          <p className="sr-p mb-4">
            Todos los mensajes enviados desde el formulario de contacto llegan
            a <strong>info@mediazion.eu</strong> y se clasifican
            automáticamente (mediador / cliente / otro).
          </p>
          <div className="flex flex-col gap-2">
            <Link to="/contacto" className="sr-btn-secondary">
              Probar formulario de contacto
            </Link>
            <a
              href="mailto:info@mediazion.eu"
              className="sr-btn-ghost"
            >
              Abrir bandeja de contacto
            </a>
          </div>
        </div>

        {/* Asistente IA */}
        <div className="sr-card">
          <h2 className="sr-h2 mb-2">Asistente IA</h2>
          <p className="sr-p mb-4">
            Usa la IA Profesional y la IA Legal para ayudarte a redactar
            mensajes, preparar documentos, revisar textos o resolver dudas
            jurídicas mientras gestionas Mediazion.
          </p>
          <div className="flex flex-col gap-2">
            <Link to="/panel-mediador/ai" className="sr-btn-secondary">
              Abrir IA Profesional
            </Link>
            <Link to="/panel-mediador/ai-legal" className="sr-btn-secondary">
              Abrir IA Legal
            </Link>
          </div>
        </div>

        {/* Instituciones */}
        <div className="sr-card">
          <h2 className="sr-h2 mb-2">Instituciones</h2>
          <p className="sr-p mb-4">
            Gestiona las solicitudes de Ayuntamientos, Cámaras de Comercio y
            Colegios Profesionales: estados, detalle y creación de usuarios
            institucionales.
          </p>
          <div className="flex flex-col gap-2">
            <Link to="/instituciones" className="sr-btn-secondary">
              Ver página pública de Instituciones
            </Link>
            <Link to="/instituciones/registro" className="sr-btn-secondary">
              Probar formulario institucional
            </Link>
            <Link to="/admin/instituciones" className="sr-btn-primary">
              Abrir panel de Instituciones (admin)
            </Link>
          </div>
        </div>
      </section>

      {/* BLOQUE 2: Herramientas técnicas / backend */}
      <section className="sr-card mb-10">
        <h2 className="sr-h2 mb-2">Herramientas técnicas (backend)</h2>
        <p className="sr-p mb-4">
          Estos enlaces son útiles para comprobaciones técnicas puntuales. Sólo
          se recomienda usarlos si sabes lo que estás haciendo.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Salud backend */}
          <div>
            <h3 className="sr-h3 mb-1">Salud del backend</h3>
            <p className="sr-small mb-2">
              Endpoint protegido que comprueba que la API Admin responde
              correctamente.
            </p>
            <code className="sr-code-block mb-2">GET /admin/health</code>
            <p className="sr-small mb-3">
              Requiere cabecera <code>X-Admin-Token</code> con el token de
              administrador configurado en el backend.
            </p>
            <a
              href="/admin/health"
              target="_blank"
              rel="noreferrer"
              className="sr-btn-secondary"
            >
              Abrir /admin/health en nueva pestaña
            </a>
          </div>

          {/* Mantenimiento mediadores */}
          <div>
            <h3 className="sr-h3 mb-1">Mediadores · mantenimiento</h3>
            <p className="sr-small mb-2">
              El backend dispone de utilidades para limpiar la tabla de
              mediadores (por dominio, por email, por estado…). Se usan
              normalmente vía Postman o similar.
            </p>
            <ul className="sr-small mb-3 list-disc pl-4">
              <li>POST /admin/mediadores/purge_email</li>
              <li>POST /admin/mediadores/purge_by_domain</li>
              <li>POST /admin/mediadores/purge_where</li>
            </ul>
            <p className="sr-small">
              Más adelante, estas funciones se integrarán aquí con botones
              seguros (confirmaciones) para no tener que usar herramientas
              externas.
            </p>
          </div>
        </div>
      </section>

      {/* BLOQUE 3: Próximas funciones */}
      <section className="sr-card">
        <h2 className="sr-h2 mb-2">Próximas funciones del panel admin</h2>
        <p className="sr-p mb-3">
          Ideas previstas para este espacio (no activas todavía, pero pensadas
          para el futuro cercano):
        </p>
        <ul className="sr-p list-disc pl-5 space-y-1">
          <li>
            Ver y filtrar listado completo de mediadores (estado, zona, PRO…).
          </li>
          <li>
            Estadísticas de uso del Panel PRO e IA (consultas, actas, casos).
          </li>
          <li>
            Resumen de ingresos por suscripciones y estado de pagos.
          </li>
          <li>
            Gestión visual de publicaciones en Voces (borrador / publicado).
          </li>
          <li>
            Panel de seguimiento de contactos (leads) desde la web.
          </li>
        </ul>
      </section>
    </main>
  );
}
