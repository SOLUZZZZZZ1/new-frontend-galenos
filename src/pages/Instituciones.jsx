// src/pages/Instituciones.jsx — Instituciones · Mediazion (versión PRO con iconos)
import React from "react";
import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";

export default function Instituciones() {
  return (
    <>
      <Seo
        title="Instituciones · Mediazion"
        description="Soluciones profesionales para Ayuntamientos, Cámaras de Comercio y Colegios Profesionales."
      />

      <main
        className="sr-container py-12"
        style={{ minHeight: "calc(100vh - 160px)" }}
      >
        <h1 className="sr-h1 mb-6 text-center">Instituciones</h1>

        <p className="sr-p text-center mb-10 max-w-3xl mx-auto">
          Mediazion ofrece soluciones profesionales adaptadas para la Administración Pública,
          entidades empresariales y colectivos profesionales. Herramientas digitales
          modernas para gestionar mediación comunitaria, mercantil y profesional.
        </p>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Ayuntamientos */}
          <Link
            to="/ayuntamientos"
            className="sr-card hover:shadow-xl transition rounded-2xl p-6 text-center"
            style={{ minHeight: 260 }}
          >
            <div className="mb-4 flex justify-center">
              {/* Icono edificio municipal */}
              <svg width="48" height="48" fill="#0ea5e9" viewBox="0 0 24 24">
                <path d="M3 22v-2h18v2H3zm2-4V9h14v9H5zM12 2l9 5H3l9-5z"/>
              </svg>
            </div>
            <h2 className="sr-h2 mb-2">Ayuntamientos</h2>
            <p className="sr-p">
              Mediación comunitaria y convivencia vecinal. Casos, actas municipales,
              agenda, IA y estadísticas para servicios públicos.
            </p>
          </Link>

          {/* Cámaras de Comercio */}
          <Link
            to="/instituciones/camaras"
            className="sr-card hover:shadow-xl transition rounded-2xl p-6 text-center"
            style={{ minHeight: 260 }}
          >
            <div className="mb-4 flex justify-center">
              {/* Icono edificio empresarial */}
              <svg width="48" height="48" fill="#0ea5e9" viewBox="0 0 24 24">
                <path d="M4 22V2h9v4h7v16h-5v-6H9v6H4zm7-8h5v-4h-5v4z"/>
              </svg>
            </div>
            <h2 className="sr-h2 mb-2">Cámaras de Comercio</h2>
            <p className="sr-p">
              Mediación empresarial y mercantil: impagos, conflictos societarios,
              contratos y apoyo con IA Legal.
            </p>
          </Link>

          {/* Colegios Profesionales */}
          <Link
            to="/instituciones/colegios"
            className="sr-card hover:shadow-xl transition rounded-2xl p-6 text-center"
            style={{ minHeight: 260 }}
          >
            <div className="mb-4 flex justify-center">
              {/* Icono libro / colegio profesional */}
              <svg width="48" height="48" fill="#0ea5e9" viewBox="0 0 24 24">
                <path d="M4 4h11l5 5v11H4V4zm11 1.5V9h3.5L15 5.5z"/>
              </svg>
            </div>
            <h2 className="sr-h2 mb-2">Colegios Profesionales</h2>
            <p className="sr-p">
              Herramientas para colegiados: panel profesional, actas, IA, directorio
              público y gestión centralizada de mediaciones.
            </p>
          </Link>
        </section>
      </main>
    </>
  );
}
