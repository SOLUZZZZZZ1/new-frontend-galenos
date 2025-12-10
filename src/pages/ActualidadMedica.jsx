import React, { useEffect, useState } from "react";

/**
 * Página: Actualidad médica (conectada al backend)
 *
 * Llama a GET /medical-news y muestra tarjetas con:
 * - título
 * - resumen
 * - fuente
 * - fecha
 * - enlace externo a la noticia completa
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

        const resp = await fetch("/medical-news?limit=20");
        if (!resp.ok) {
          throw new Error("No se ha podido cargar la actualidad médica");
        }
        const data = await resp.json();
        setNews(data || []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Error cargando la actualidad médica");
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
          Resúmenes rápidos de noticias y actualizaciones clínicas procedentes de fuentes acreditadas.
          Haz clic en “Ver noticia completa” para abrir el medio original en una pestaña nueva.
        </p>
      </header>

      {loading && (
        <p className="text-sm text-gray-500">Cargando noticias médicas…</p>
      )}

      {error && !loading && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}

      {!loading && !error && news.length === 0 && (
        <p className="text-sm text-gray-500">
          De momento no hay noticias registradas. Cuando el servicio RSS empiece a alimentar la base de datos,
          verás aquí las últimas novedades clínicas en tiempo casi real.
        </p>
      )}

      {!loading && !error && news.length > 0 && (
        <section className="space-y-4">
          {news.map((n) => (
            <article
              key={n.id}
              className="border rounded-lg p-4 bg-white shadow-sm"
            >
              <h2 className="text-lg font-semibold mb-1">{n.title}</h2>
              <p className="text-xs text-gray-500 mb-2">
                {n.source_name || "Fuente no especificada"}
                {n.published_at && " · "}
                {n.published_at &&
                  new Date(n.published_at).toLocaleDateString("es-ES")}
              </p>
              {n.summary && (
                <p className="text-sm mb-3">{n.summary}</p>
              )}
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
