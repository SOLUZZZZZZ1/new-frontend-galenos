// src/pages/Plantillas.jsx — Plantillas IA (Recetas rápidas) · MEDIAZION
import React, { useState } from "react";
import Seo from "./src/components/Seo.jsx";

const RECETAS = [
  { id: 1, title: "Acta estándar", desc: "…", prompt: "…" },
  { id: 2, title: "Correo de seguimiento", desc: "…", prompt: "…" },
  { id: 3, title: "Resumen ejecutivo", desc: "…", prompt: "…" },
];

export default function Plantillas() {
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function generar(prompt) {
    setLoading(true);
    setAnswer("");
    try {
      const token = localStorage.getItem("jwt_token") || "ok";
      const res = await fetch("/api/ai/assist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        throw new Error(data?.detail || data?.message || "Error de IA");
      }
      setAnswer(data.text || "");
    } catch (e) {
      setAnswer("❌ " + (e.message || "Error generando plantilla"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Seo title="Plantillas IA · MEDIAZION" />
      <main className="sr-container py-8">
        <h1 className="sr-h1 mb-2">Plantillas IA</h1>
        <p className="sr-p mb-4">
          Usa estas plantillas rápidas para generar textos habituales de mediación.
        </p>

        <section className="grid gap-4 md:grid-cols-2">
          {RECETAS.map((r) => (
            <article key={r.id} className="sr-card">
              <h3 className="sr-h3 mb-1">{r.title}</h3>
              <p className="sr-p mb-3">{r.desc}</p>
              <button
                className="sr-btn-primary"
                disabled={loading}
                onClick={() => generar(r.prompt)}
              >
                {loading ? "Generando…" : "Usar plantilla"}
              </button>
            </article>
          ))}
        </section>

        {answer && (
          <section className="sr-card mt-6">
            <h2 className="sr-h2 mb-2">Resultado</h2>
            <pre className="sr-p whitespace-pre-wrap">{answer}</pre>
          </section>
        )}
      </main>
    </>
  );
}
