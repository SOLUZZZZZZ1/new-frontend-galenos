// src/pages/Mediadores.jsx — sin botón “Ver directorio” en el bloque inferior
import React from "react";
import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";

export default function Mediadores() {
  return (
    <>
      <Seo
        title="Mediadores · MEDIAZION"
        description="Únete a la red de mediadores: alta gratuita, panel profesional y directorio."
        canonical="https://mediazion.eu/mediadores"
      />
      <main className="sr-container py-12">
        <h1 className="sr-h1 mb-2">Mediadores</h1>
        <p className="sr-p">
          Únete a la red de <strong>MEDIAZION</strong>. Perfil profesional, directorio público y herramientas para tu práctica diaria.
        </p>

        <div className="sr-card mt-6" style={{ background:"rgba(255,255,255,0.97)" }}>
          <h2 className="sr-h2">Alta gratuita</h2>
          <p className="sr-p">
            Regístrate sin coste. Recibirás una contraseña temporal por email y podrás completar tu perfil.
            Después, activa tu <strong>prueba gratuita</strong> (49,50 € / mes al finalizar, sin permanencia).
          </p>
          <div style={{ marginTop: 12 }}>
            <Link className="sr-btn-primary" to="/mediadores/alta">Dar de alta gratuita</Link>
          </div>
        </div>

        <section className="sr-grid-3 mt-8">
          <article className="sr-card">
            <h3 className="sr-h3">Perfil profesional</h3>
            <p className="sr-p">Muestra tu experiencia, áreas de especialidad y certificaciones.</p>
          </article>
          <article className="sr-card">
            <h3 className="sr-h3">Gestión y acompañamiento</h3>
            <p className="sr-p">Documentación, agenda, y herramientas para coordinar casos con seguridad.</p>
          </article>
          <article className="sr-card">
            <h3 className="sr-h3">Visibilidad y red</h3>
            <p className="sr-p">Accede al Directorio y a nuestra comunidad para impulsar tu práctica.</p>
          </article>
        </section>
      </main>
    </>
  );
}
