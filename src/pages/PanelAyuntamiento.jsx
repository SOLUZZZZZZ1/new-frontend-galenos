// src/pages/PanelAyuntamiento.jsx — Panel del Ayuntamiento · Mediazion
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../components/Seo.jsx";

const LS_AYTO_TOKEN = "ayto_token";

export default function PanelAyuntamiento() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(LS_AYTO_TOKEN) || "";
    if (!stored) {
      nav("/ayuntamientos/acceso");
      return;
    }
    setEmail(stored);
  }, [nav]);

  function handleLogout() {
    localStorage.removeItem(LS_AYTO_TOKEN);
    nav("/ayuntamientos/acceso");
  }

  return (
    <>
      <Seo
        title="Panel Ayuntamientos · Mediazion"
        description="Panel de mediación comunitaria para ayuntamientos."
        canonical="https://mediazion.eu/panel-ayuntamiento"
      />
      <main
        className="sr-container py-8"
        style={{ minHeight: "calc(100vh - 160px)" }}
      >
        <section className="sr-card" style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Cabecera */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h1 className="sr-h1 mb-1">Panel del Ayuntamiento</h1>
              <p className="sr-small text-zinc-600">
                Sesión iniciada como: <b>{email || "Usuario Ayuntamiento"}</b>
              </p>
              <p className="sr-small text-zinc-500">
                Este panel está pensado para gestionar mediación comunitaria,
                convivencia y conflictos vecinales desde el Ayuntamiento.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="sr-btn-secondary" type="button" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </div>
          </div>

          {/* Tarjetas principales */}
          <div className="mt-6 sr-grid-3">
            <div className="sr-card">
              <h2 className="sr-h3 mb-1">Casos comunitarios</h2>
              <p className="sr-p">
                Registra y gestiona conflictos de convivencia, problemas vecinales
                y situaciones de mediación comunitaria. Cada caso tendrá su ficha
                con datos de las partes, actuaciones e historial.
              </p>
              <p className="sr-small text-zinc-500 mt-2">
                Próximamente: listado completo de casos, filtros por barrio y
                derivación a mediadores externos.
              </p>
            </div>

            <div className="sr-card">
              <h2 className="sr-h3 mb-1">Actas e informes</h2>
              <p className="sr-p">
                Genera actas de sesión y actas finales con formato homogéneo,
                listas para incorporar a expedientes municipales. Opción de
                co-branding con escudo del Ayuntamiento.
              </p>
              <p className="sr-small text-zinc-500 mt-2">
                Próximamente: descarga directa en DOCX/PDF y modelos específicos
                para mediación comunitaria.
              </p>
            </div>

            <div className="sr-card">
              <h2 className="sr-h3 mb-1">Agenda</h2>
              <p className="sr-p">
                Organiza citas de mediación, reserva de espacios y reuniones de
                seguimiento vinculadas a los casos registrados.
              </p>
              <p className="sr-small text-zinc-500 mt-2">
                Próximamente: integración con videollamadas y recordatorios por
                correo.
              </p>
            </div>

            <div className="sr-card">
              <h2 className="sr-h3 mb-1">IA para técnicos municipales</h2>
              <p className="sr-p">
                Utiliza IA para redactar cartas a vecinos, resúmenes de casos,
                informes internos y propuestas de acuerdo en lenguaje claro y
                profesional.
              </p>
              <p className="sr-small text-zinc-500 mt-2">
                Próximamente: acceso directo a IA Profesional desde este panel.
              </p>
            </div>

            <div className="sr-card">
              <h2 className="sr-h3 mb-1">Estadísticas y memoria</h2>
              <p className="sr-p">
                Visualiza datos agregados: número de casos, tipos de conflictos,
                tiempos de resolución y resultados, para preparar memorias
                anuales o justificar proyectos.
              </p>
              <p className="sr-small text-zinc-500 mt-2">
                Próximamente: panel de estadísticas con filtros por fechas,
                barrios y tipología de conflicto.
              </p>
            </div>

            <div className="sr-card">
              <h2 className="sr-h3 mb-1">Configuración del Ayuntamiento</h2>
              <p className="sr-p">
                Gestiona los datos del Ayuntamiento, escudo, departamentos
                implicados y usuarios internos que tendrán acceso al panel.
              </p>
              <p className="sr-small text-zinc-500 mt-2">
                Próximamente: alta de técnicos, roles internos y permisos.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
