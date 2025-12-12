// src/pages/ActualidadMedica.jsx — Galenos.pro (RSS en directo)
import React, { useEffect, useState } from "react";

const API =
  import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

/**
 * Página: Actualidad médica (RSS en directo)
 *
 * Llama a GET {API}/medical-news/live y muestra tarjetas con:
 * - título
 * - resumen
 * - fuente
 * - fecha
 * - enlace externo a la noticia completa
 *
 * Respuesta esperada:
 * {
 *   items: [
 *     { title, summary, source_name, source_url, published_at }
 *   ],
 *   sources: [...]
 * }
 */

const ActualidadMedica = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);

        const resp = await fetch(`${API}/medical-news/live?limit=20`);
        const raw = await resp.text();

        if (!resp.ok) {
          let msg = "No se ha podido cargar la actualidad médica.";
          try {
            const errData = JSON.parse(raw);
            if (errData.detail) msg = errData.detail;
          } catch {
            // Si el backend devuelve HTML o texto raro, evitamos romper JSON.parse
          }
          setError(msg);
          return;
        }

        let data;
        try {
          data = JSON.parse(raw);
        } catch {
          setError("Respuesta inesperada al cargar la actualidad médica.");
          return;
        }

        const items = Array.isArray(data?.items) ? data.items : [];
        setNews(items);
      } catch (err) {
        console.error("❌ Error cargando actualidad médica:", err);
        setError("Error de conexión al cargar la actualidad médica.");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">Actualidad médica</h1>
        <p className="text-sm text-gray-600">
          Noticias médicas en directo desde fuentes RSS acreditadas. Haz clic en
          “Ver noticia completa” para abrir el medio original en una pestaña
          nueva.
        </p>
      </header>

      {loading && (
        <p className="text-sm text-gray-500">Cargando noticias médicas…</p>
      )}

      {error && !loading && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {!loading && !error && news.length === 0 && (
        <p className="text-sm text-gray-500">
          No hay entradas disponibles en este momento. Esto puede ocurrir si las
          fuentes RSS no responden temporalmente.
        </p>
      )}

      {!loading && !error && news.length > 0 && (
        <section className="space-y-4">
          {news.map((n, idx) => (
            <article
              key={`${n.source_url || n.title}-${idx}`}
              className="border rounded-lg p-4 bg-white shadow-sm"
            >
              <h2 className="text-lg font-semibold mb-1">{n.title}</h2>
              <p className="text-xs text-gray-500 mb-2">
                {n.source_name || "Fuente no especificada"}
                {n.published_at && " · "}
                {n.published_at &&
                  new Date(n.published_at).toLocaleDateString("es-ES")}
              </p>
              {n.summary && <p className="text-sm mb-3">{n.summary}</p>}
              <a
                href={n.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-semibold underline"
              >
                Ver noticia completa
              </a>
            </article>
          ))}
        </section>
      )}
    </div>
  );
};

export default ActualidadMedica;
