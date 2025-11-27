// src/pages/Ayuntamientos.jsx — Ayuntamientos y Mediazion (versión PRO)
import React from "react";
import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";

export default function Ayuntamientos() {
  return (
    <>
      <Seo
        title="Ayuntamientos y Mediazion"
        description="Solución de mediación comunitaria y convivencia vecinal para Ayuntamientos."
        canonical="https://mediazion.eu/ayuntamientos"
      />

      <main
        className="sr-container py-12"
        style={{ minHeight: "calc(100vh - 160px)" }}
      >
        {/* VOLVER A INSTITUCIONES */}
        <div className="mb-4">
          <Link
            to="/instituciones"
            className="sr-small text-sky-700 underline"
          >
            ← Volver a Instituciones
          </Link>
        </div>

        {/* CABECERA */}
        <section className="sr-card mb-6 flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-shrink-0">
            {/* Icono edificio municipal */}
            <svg width="72" height="72" fill="#0ea5e9" viewBox="0 0 24 24">
              <path d="M3 22v-2h18v2H3zm2-4V9h14v9H5zM12 2l9 5H3l9-5z" />
            </svg>
          </div>
          <div>
            <h1 className="sr-h1 mb-3">Ayuntamientos y Mediazion</h1>
            <p className="sr-p mb-1">
              Mediazion es una plataforma profesional diseñada para ayudar a los
              Ayuntamientos a gestionar la mediación comunitaria, la convivencia
              vecinal y los conflictos de barrio con orden, trazabilidad y
              herramientas modernas.
            </p>
            <p className="sr-small text-zinc-600">
              Ideal para servicios sociales, policía local, unidades de
              convivencia y áreas de participación ciudadana.
            </p>
          </div>
        </section>

        {/* APORTES PRINCIPALES */}
        <section className="sr-card mb-6">
          <h2 className="sr-h2 mb-2">¿Qué aporta Mediazion a un Ayuntamiento?</h2>
          <ul className="sr-p list-disc ml-6 mb-2">
            <li>
              <b>Registro estructurado</b> de casos de convivencia y conflictos
              vecinales.
            </li>
            <li>
              <b>Actas homogéneas y profesionales</b>, listas para unir al
              expediente electrónico municipal.
            </li>
            <li>
              <b>Agenda vinculada a casos</b> para organizar sesiones, visitas y
              reuniones con las partes.
            </li>
            <li>
              <b>IA profesional</b> para redactar cartas, informes técnicos y
              resúmenes de expedientes.
            </li>
            <li>
              <b>Estadísticas e informes</b> para memorias anuales, proyectos
              europeos y órganos de gobierno.
            </li>
          </ul>
        </section>

        {/* CASOS TÍPICOS */}
        <section className="sr-card mb-6">
          <h2 className="sr-h2 mb-2">Casos típicos que se pueden gestionar</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <ul className="sr-p list-disc ml-6">
              <li>Problemas de ruidos y convivencia entre vecinos.</li>
              <li>Uso de patios, zonas comunes y espacios públicos.</li>
              <li>Conflictos derivados de obras, tráfico o actividades.</li>
              <li>
                Disputas entre comercios y vecindario (terrazas, horarios, etc.).
              </li>
            </ul>
            <ul className="sr-p list-disc ml-6">
              <li>Conflictos escolares con impacto en la comunidad.</li>
              <li>Desacuerdos entre comunidades de propietarios.</li>
              <li>Quejas recurrentes que requieren mediación previa.</li>
              <li>
                Cualquier situación en la que la intervención neutra mejore la
                convivencia.
              </li>
            </ul>
          </div>
          <p className="sr-small text-zinc-600 mt-3">
            La plataforma se adapta al circuito de mediación comunitaria ya
            existente en el municipio y no pretende sustituir la política
            pública, sino reforzarla.
          </p>
        </section>

        {/* ACCESO Y PILOTO */}
        <section className="sr-card mb-6">
          <h2 className="sr-h2 mb-2">Acceso de Ayuntamientos y pilotos</h2>
          <p className="sr-p mb-2">
            Cada Ayuntamiento dispone de un acceso específico para sus
            técnicos/as de mediación o convivencia. Desde ese panel podrán
            gestionar casos, actas, agenda y estadísticas con total seguridad.
          </p>
          <p className="sr-p mb-3">
            Si quieres estudiar un piloto o una prueba en tu municipio, podemos
            habilitar un acceso inicial acompañado y ayudarte en la puesta en
            marcha, formación básica y documentación de procesos.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/ayuntamientos/acceso"
              className="sr-btn-primary inline-block"
            >
              Acceso Ayuntamientos
            </Link>

            {/* DEMO (puedes dejarlo o quitarlo más adelante) */}
            

            {/* ALTA INSTITUCIONAL */}
            <Link
              to="/instituciones/registro"
              className="sr-btn-secondary inline-block"
            >
              📝 Solicitar alta institucional
            </Link>
          </div>
        </section>

        {/* CONTACTO */}
        <section className="sr-card">
          <h2 className="sr-h2 mb-2">¿Hablamos?</h2>
          <p className="sr-p mb-2">
            Si eres responsable de un Ayuntamiento y te interesa explorar cómo
            Mediazion puede ayudar en convivencia y mediación comunitaria, ponte
            en contacto con nosotros:
          </p>
          <p className="sr-p mb-1">
            <b>Email:</b> admin@mediazion.eu
          </p>
          <Link to="/contacto" className="sr-btn-secondary inline-block mt-2">
            Ir al formulario de contacto
          </Link>
        </section>
      </main>
    </>
  );
}
