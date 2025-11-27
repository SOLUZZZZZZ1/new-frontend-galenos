// src/pages/Tarifas.jsx
import React from "react";
import Seo from "../components/Seo.jsx";

export default function Tarifas(){
  return (
    <>
      <Seo
        title="Tarifas de mediación · Precios orientativos · MEDIAZION"
        description="Apertura de expediente, sesión de mediación (60–90 min) y certificación final. Importes orientativos y confirmación por expediente."
        canonical="https://mediazion.eu/tarifas"
      />
      <main
        className="min-h-[calc(100vh-80px)]"
        style={{
          backgroundImage: "url('/columnas.webp?v=2')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          position: "relative",
          padding: "40px 20px"
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(255,255,255,0.75), rgba(255,255,255,0.90))"
          }}
        />
        <div className="sr-container" style={{ position: "relative", zIndex: 1 }}>
          <div
            className="sr-card"
            style={{
              maxWidth: "900px",
              margin: "0 auto",
              background: "rgba(255,255,255,0.95)",
              border: "1px solid rgba(0,0,0,0.06)",
              borderRadius: "16px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
              color: "#0f172a",
              padding: "28px 28px 20px"
            }}
          >
            <h1 className="sr-h1 mb-3">Tarifas</h1>
            <p className="sr-p mb-8">
              Transparencia y previsibilidad. Estos importes son orientativos y se confirman en cada expediente.
            </p>

            <section className="sr-card mb-6" style={{ background:"rgba(255,255,255,0.98)" }}>
              <h2 className="sr-h2">Apertura de expediente</h2>
              <p className="sr-p">Incluye análisis de viabilidad y propuesta de agenda.</p>
              <p className="sr-p" style={{ fontWeight: 700, marginTop: 8 }}>Desde 120 €</p>
            </section>

            <section className="sr-card mb-6" style={{ background:"rgba(255,255,255,0.98)" }}>
              <h2 className="sr-h2">Sesión de mediación</h2>
              <p className="sr-p">Sesiones de 60–90 min, con acta y acuerdos parciales.</p>
              <p className="sr-p" style={{ fontWeight: 700, marginTop: 8 }}>Desde 180 €</p>
            </section>

            <section className="sr-card" style={{ background:"rgba(255,255,255,0.98)" }}>
              <h2 className="sr-h2">Certificación final</h2>
              <p className="sr-p">Con/sin avenencia, con documentación preparada para firma.</p>
              <p className="sr-p" style={{ fontWeight: 700, marginTop: 8 }}>Desde 150 €</p>
            </section>

            <div className="text-sm text-zinc-700" style={{ marginTop: 16 }}>
              <p className="sr-p">© MEDIAZION · Centro de Mediación y Resolución de Conflictos</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
