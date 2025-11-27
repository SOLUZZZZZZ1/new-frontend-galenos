// src/pages/VocesEditor.jsx — Editor PRO con moderación IA y avisos completos
import React, { useState } from "react";
import Seo from "../components/Seo.jsx";

export default function VocesEditor() {
  const [email] = useState(localStorage.getItem("mediador_email") || "");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [infoMsg, setInfoMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [moderation, setModeration] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();

    setErrorMsg("");
    setInfoMsg("");
    setModeration(null);

    if (!email) {
      setErrorMsg("Debes estar autenticado como mediador.");
      return;
    }
    if (!title.trim() || !content.trim()) {
      setErrorMsg("El título y el contenido son obligatorios.");
      return;
    }
    if (!acceptTerms) {
      setErrorMsg("Debes aceptar las condiciones antes de publicar.");
      return;
    }

    setLoading(true);

    try {
      const resp = await fetch("/api/voces/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          title,
          summary,
          content,
          accept_terms: true
        }),
      });

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok || !data?.ok) {
        throw new Error(
          data?.detail || data?.message || "No se pudo publicar el artículo."
        );
      }

      // El backend ahora SIEMPRE pasa por la IA (gracias a nuestra integración)
      const status = data.status || "published";  // published / pending_review / rejected
      const mod = data.moderation || null;
      setModeration(mod);

      if (status === "published") {
        setInfoMsg("Artículo publicado correctamente.");
      } else if (status === "pending_review") {
        setInfoMsg("Artículo pendiente de revisión por la IA.");
      } else if (status === "rejected") {
        setErrorMsg("La IA ha rechazado esta publicación.");
      }

    } catch (e) {
      console.error(e);
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Seo title="Publicar en Voces" description="Editor de artículos para mediadores PRO" />
      <main className="sr-container py-8" style={{ minHeight: "calc(100vh - 160px)" }}>

        <h1 className="sr-h1 mb-4">✏️ Publicar en Voces</h1>

        {!email && (
          <div className="sr-card mb-4">
            <p className="sr-p">
              Debes iniciar sesión para publicar en Voces.
            </p>
          </div>
        )}

        {/* Errores */}
        {errorMsg && (
          <div className="sr-card mb-4" style={{ borderColor: "#fecaca", color: "#991b1b" }}>
            <p className="sr-small">❌ {errorMsg}</p>
          </div>
        )}

        {/* Info */}
        {infoMsg && (
          <div className="sr-card mb-4" style={{ borderColor: "#bbf7d0", color: "#166534" }}>
            <p className="sr-small">✅ {infoMsg}</p>
          </div>
        )}

        {/* Moderación IA */}
        {moderation && (
          <div className="sr-card mb-4" style={{ borderColor: "#bfdbfe", color: "#1e3a8a" }}>
            <h3 className="sr-h3 mb-1">🔍 Moderación IA</h3>
            <p className="sr-small">
              Acción: <b>{moderation.action}</b>  
            </p>
            <p className="sr-small">
              Riesgo: <b>{moderation.risk}</b>
            </p>

            {Array.isArray(moderation.reasons) && moderation.reasons.length > 0 && (
              <>
                <p className="sr-small mt-2">Motivos detectados:</p>
                <ul className="list-disc ml-4 text-sm">
                  {moderation.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="sr-card grid gap-4">

          <div>
            <label className="sr-label">Título</label>
            <input
              className="sr-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título del artículo"
            />
          </div>

          <div>
            <label className="sr-label">Resumen (opcional)</label>
            <input
              className="sr-input"
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Resumen corto del artículo"
            />
          </div>

          <div>
            <label className="sr-label">Contenido</label>
            <textarea
              className="sr-input min-h-[200px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe tu artículo aquí..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
            />
            <span className="sr-small">
              Declaro que soy el autor, y acepto que Mediazion no comparte las opiniones vertidas ni es responsable de ellas.
            </span>
          </div>

          <button
            type="submit"
            className="sr-btn-primary"
            disabled={loading || !email}
          >
            {loading ? "Publicando…" : "Publicar artículo"}
          </button>
        </form>
      </main>
    </>
  );
}
