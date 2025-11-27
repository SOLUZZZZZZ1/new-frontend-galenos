// src/pages/PanelMediadorDemo.jsx — Panel DEMO para instituciones (Ayto / Cámara / Colegio)
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import ProDashboard from "../components/ProDashboard.jsx";

export default function PanelMediadorDemo() {
  const nav = useNavigate();

  // Leer modo demo institucional desde localStorage
  const demoTipo =
    typeof window !== "undefined"
      ? localStorage.getItem("demo_institucion")
      : null;
  const esDemoInstitucional = Boolean(demoTipo);

  // Si NO hay demo, mostrar instrucción sencilla
  if (!esDemoInstitucional) {
    return (
      <>
        <Seo title="Panel demo · Mediazion" />
        <main
          className="sr-container py-12"
          style={{ minHeight: "calc(100vh - 160px)" }}
        >
          <section className="sr-card">
            <h1 className="sr-h1 mb-3">Panel demo de Mediazion</h1>
            <p className="sr-p mb-3">
              Este panel está configurado actualmente <b>solo para demostraciones institucionales</b>.
            </p>
            <p className="sr-p mb-3">
              Para acceder al panel demo, entra desde{" "}
              <b>Instituciones</b> y selecciona <b>Ayuntamientos</b>,{" "}
              <b>Cámaras de Comercio</b> o <b>Colegios Profesionales</b> y usa
              el botón <b>“Entrar en demo PRO”</b>.
            </p>
            <Link to="/instituciones" className="sr-btn-secondary inline-block mt-2">
              ⬅ Volver a Instituciones
            </Link>
          </section>
        </main>
      </>
    );
  }

  // Si hay demo activa, mostrar panel demo
  const etiquetaDemo = demoTipo
    ? `DEMO ${demoTipo.toUpperCase()}`
    : "DEMO INSTITUCIONAL";

  const salirDemo = () => {
    localStorage.removeItem("demo_institucion");
    nav("/instituciones");
  };

  return (
    <>
      <Seo title="Panel demo institucional · Mediazion" />
      <main
        className="sr-container py-8"
        style={{ minHeight: "calc(100vh - 160px)" }}
      >
        <div
          className="sr-card mb-4"
          style={{
            borderColor: "#bfdbfe",
            color: "#1d4ed8",
            background: "#eff6ff",
          }}
        >
          <p className="sr-small">
            Estás viendo <b>Mediazion en modo DEMO institucional</b> para{" "}
            <b>{demoTipo}</b>. El acceso es limitado y se utiliza solo para
            demostraciones. Los datos que veas aquí pueden ser de ejemplo.
          </p>
          <button
            onClick={salirDemo}
            className="sr-btn-secondary mt-3"
            type="button"
          >
            ⬅ Salir del modo demo
          </button>
        </div>

        <ProDashboard
          who={etiquetaDemo}
          subStatus="active"     // se muestra como PRO visualmente
          trialLeft={null}
          onSubscribe={null}    // sin activar trial real en demo
          onLogout={salirDemo}  // cerrar demo
        />
      </main>
    </>
  );
}
