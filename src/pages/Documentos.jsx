// src/pages/Documentos.jsx — Panel PRO · Gestión real de Documentos Mediazion
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Seo from "../components/Seo.jsx";

const LS_EMAIL = "mediador_email";

export default function Documentos() {
  const email = localStorage.getItem(LS_EMAIL) || "";
  const nav = useNavigate();

  function goPerfil() {
    if (!email) {
      alert("Debes iniciar sesión para acceder a tu Perfil.");
      nav("/acceso");
      return;
    }
    nav("/panel-mediador/perfil");
  }

  function goIA() {
    if (!email) {
      alert("Debes iniciar sesión para acceder a la IA Profesional.");
      nav("/acceso");
      return;
    }
    nav("/panel-mediador/ai");
  }

  function goPanel() {
    if (!email) {
      nav("/acceso");
      return;
    }
    nav("/panel-mediador");
  }

  return (
    <>
      <Seo
        title="Documentos · Panel PRO"
        description="Gestión de documentos personales, CV y archivos utilizados con la IA Profesional."
      />

      <main
        className="sr-container py-8"
        style={{ minHeight: "calc(100vh - 160px)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="sr-h1">📁 Documentos</h1>
          <button className="sr-btn-secondary" onClick={goPanel}>
            ← Volver al Panel PRO
          </button>
        </div>

        <p className="sr-p text-zinc-700 mb-6">
          Desde aquí puedes gestionar tu avatar, curriculum y, en un futuro muy
          próximo, tus documentos generados por la IA, plantillas profesionales
          y una biblioteca personal segura.
        </p>

        {/* AVATAR */}
        <section className="sr-card mb-5">
          <h2 className="sr-h2 mb-1">📷 Foto / Avatar</h2>
          <p className="sr-small text-zinc-600 mb-3">
            Tu foto se gestiona desde tu Perfil.
          </p>
          <button className="sr-btn-secondary" onClick={goPerfil}>
            Ir a Perfil
          </button>
        </section>

        {/* CURRICULUM */}
        <section className="sr-card mb-5">
          <h2 className="sr-h2 mb-1">📄 Curriculum</h2>
          <p className="sr-small text-zinc-600 mb-3">
            Desde tu Perfil puedes subir tu CV en PDF o actualizarlo cuando
            quieras.
          </p>
          <button className="sr-btn-secondary" onClick={goPerfil}>
            Ir a Perfil
          </button>
        </section>

        {/* HISTORIAL DE IA (placeholder hasta conectar backend) */}
        <section className="sr-card mb-5">
          <h2 className="sr-h2 mb-1">🧠 Archivos usados con la IA Profesional</h2>
          <p className="sr-small text-zinc-600 mb-3">
            Muy pronto podrás ver aquí un historial de los documentos usados en
            IA (PDF, DOCX, TXT, imágenes) vinculados a cada consulta.
          </p>
          <button className="sr-btn-secondary" onClick={goIA}>
            Usar IA Profesional
          </button>
        </section>

        {/* PRÓXIMAS FUNCIONES */}
        <section className="sr-card mb-5">
          <h2 className="sr-h2 mb-2">🗂️ Próximamente</h2>
          <ul className="list-disc ml-6 text-sm text-zinc-700">
            <li>Historial real de documentos usados con IA</li>
            <li>Guardar documentos generados automáticamente por la IA</li>
            <li>Directorio personal de plantillas profesionales</li>
            <li>Gestor de actas generadas</li>
            <li>Biblioteca de documentos segura en S3</li>
          </ul>
        </section>
      </main>
    </>
  );
}
