// src/pages/Camaras.jsx — Cámaras de Comercio · Mediazion (versión PRO)
import React from "react";
import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";

export default function Camaras() {
  return (
    <>
      <Seo
        title="Cámaras de Comercio · Mediazion"
        description="Mediación empresarial, mercantil y societaria para Cámaras de Comercio."
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
            {/* Icono edificio empresarial */}
            <svg width="72" height="72" fill="#0ea5e9" viewBox="0 0 24 24">
              <path d="M4 22V2h9v4h7v16h-5v-6H9v6H4zm7-8h5v-4h-5v4z" />
            </svg>
          </div>
          <div>
            <h1 className="sr-h1 mb-3">Cámaras de Comercio</h1>
            <p className="sr-p mb-1">
              Mediazion ayuda a las Cámaras de Comercio a ofrecer un servicio de
              mediación empresarial moderno, ágil y profesional, reduciendo la
              judicialización de conflictos y mejorando la competitividad del
              tejido empresarial.
            </p>
            <p className="sr-small text-zinc-600">
              Pensado para departamentos jurídicos, de servicios a empresas y
              áreas de arbitraje y mediación.
            </p>
          </div>
        </section>

        {/* APORTES PRINCIPALES */}
        <section className="sr-card mb-6">
          <h2 className="sr-h2 mb-2">¿Qué aporta Mediazion?</h2>
          <ul className="sr-p list-disc ml-6">
            <li>Gestión integral de expedientes mercantiles y societarios.</li>
            <li>Actas DOCX/PDF con formato profesional y homogéneo.</li>
            <li>
              IA Legal para revisar contratos, resumir documentación y redactar
              borradores de acuerdos.
            </li>
            <li>Agenda de mediaciones y reuniones con empresas y profesionales.</li>
            <li>
              Estadísticas para memorias anuales, informes internos y proyectos
              europeos.
            </li>
          </ul>
        </section>

        {/* CASOS TÍPICOS */}
        <section className="sr-card mb-6">
          <h2 className="sr-h2 mb-2">Casos típicos</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <ul className="sr-p list-disc ml-6">
              <li>Impagos y reclamaciones económicas entre empresas.</li>
              <li>Conflictos entre socios o accionistas.</li>
              <li>Desacuerdos en contratos de suministro o servicios.</li>
              <li>Diferencias en contratos de franquicia.</li>
            </ul>
            <ul className="sr-p list-disc ml-6">
              <li>Conflictos en contratos de distribución y agencia.</li>
              <li>Dificultades en la continuidad de negocios familiares.</li>
              <li>Desacuerdos en proyectos conjuntos y colaboraciones.</li>
              <li>Cualquier conflicto mercantil que admita una solución negociada.</li>
            </ul>
          </div>
        </section>

        {/* CONTACTO + DEMO + ALTA */}
        <section className="sr-card">
          <h2 className="sr-h2 mb-2">Contacto institucional</h2>
          <p className="sr-p mb-2">
            Si formas parte de una Cámara de Comercio y quieres explorar cómo
            Mediazion puede apoyar vuestro servicio de mediación empresarial,
            podemos organizar una demostración adaptada a vuestra realidad.
          </p>
          <p className="sr-p mb-1">
            <b>Email:</b> admin@mediazion.eu
          </p>
          <div className="flex flex-wrap gap-3 mt-2">
            <Link to="/contacto" className="sr-btn-secondary inline-block">
              Solicitar reunión / demo
            </Link>
            <Link
              to="/instituciones/registro"
              className="sr-btn-secondary inline-block"
            >
              📝 Solicitar alta institucional
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
