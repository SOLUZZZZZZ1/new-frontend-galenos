// src/pages/Actualidad.jsx — Actualidad jurídica automática + buscador opcional
import React, { useEffect, useState } from "react";
import Seo from "../components/Seo.jsx";

export default function Actualidad() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");

  // 🔥 CARGA AUTOMÁTICA DE NOTICIAS AL ABRIR
  useEffect(() => {
    cargarNoticias("");
  }, []);

  async function cargarNoticias(busqueda = "") {
    try {
      setLoading(true);
      setError("");

      const url = busqueda.trim()
        ? `/api/news?q=${encodeURIComponent(busqueda)}`
        : `/api/news`;

      const r = await fetch(url);
      const data = await r.json();

      if (!r.ok || !data?.ok) {
        throw new Error(data?.detail || "No se pudieron cargar las noticias");
      }

      setItems(data.items || []);
    } catch (e) {
      setError(e.message || "Error cargando noticias");
    } finally {
      setLoading(false);
    }
  }

  function buscar(e) {
    e.preventDefault();
    cargarNoticias(q);
  }

  return (
    <>
      <Seo
        title="Actualidad Jurídica · MEDIAZION"
        description="Noticias automáticas de mediación: BOE, Confilegal, CGPJ, LegalToday."
      />

      <main className="sr-container py-10">
        <h1 className="sr-h1">Actualidad Jurídica</h1>
        <p className="sr-p mb-4">
          Noticias recientes de mediación y resolución de conflictos (BOE, Confilegal,
          LegalToday, CGPJ). Se actualizan automáticamente cada día.
        </p>

        {/* Buscador opcional */}
        <form
          onSubmit={buscar}
          className="sr-card mb-6"
          style={{ maxWidth: 600 }}
        >
          <input
            className="sr-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filtrar noticias (ej.: mediación familiar)"
          />
          <button className="sr-btn-primary mt-3">Buscar</button>
        </form>

        {error && (
          <p className="sr-small mb-4" style={{ color: "#991B1B" }}>
            ❌ {error}
          </p>
        )}

        {/* Listado */}
        {loading ? (
          <p className="sr-p">Cargando noticias…</p>
        ) : items.length === 0 ? (
          <p className="sr-p">No hay noticias disponibles.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((it, i) => (
              <article key={i} className="sr-card flex flex-col">
                <h3 className="sr-h3">{it.title}</h3>
                <p className="sr-small text-zinc-600">
                  {it.source} · {it.date}
                </p>
                <p className="sr-p mb-3 whitespace-pre-wrap">
                  {it.summary}
                </p>
                <a
                  className="sr-btn-secondary mt-auto"
                  href={it.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver fuente →
                </a>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
