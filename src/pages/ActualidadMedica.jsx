import React from "react";

/**
 * Página: Actualidad médica
 *
 * Versión base para Galenos.
 * Muestra tarjetas de noticias con:
 * - título
 * - resumen breve
 * - fuente
 * - fecha
 * - enlace externo a la noticia completa
 *
 * Más adelante, se puede sustituir el array `noticiasEjemplo`
 * por datos reales desde el backend (GET /medical-news).
 */

const ActualidadMedica = () => {
  const noticiasEjemplo = [
    {
      id: 1,
      titulo: "Nuevas guías en insuficiencia cardiaca 2025",
      resumen:
        "Resumen breve de las principales recomendaciones en el manejo y seguimiento de la insuficiencia cardiaca según las últimas guías europeas.",
      fuente: "Sociedad Europea de Cardiología (ESC)",
      url: "https://example.com/noticia-insuficiencia-cardiaca",
      fecha: "2025-12-10",
    },
    {
      id: 2,
      titulo: "Actualización en el uso de antibióticos en urgencias",
      resumen:
        "Revisión de pautas empíricas en sepsis, neumonía adquirida en la comunidad e infecciones de partes blandas en contexto de resistencias.",
      fuente: "Revista de Medicina de Urgencias",
      url: "https://example.com/noticia-antibioticos-urgencias",
      fecha: "2025-12-09",
    },
    {
      id: 3,
      titulo: "Nuevas evidencias en el manejo de la EPOC estable",
      resumen:
        "Metaanálisis reciente que revisa el papel de distintos broncodilatadores y corticoides inhalados en la reducción de exacerbaciones.",
      fuente: "BMJ (British Medical Journal)",
      url: "https://example.com/noticia-epoc-bmj",
      fecha: "2025-12-08",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">Actualidad médica</h1>
        <p className="text-sm text-gray-600">
          Resúmenes rápidos de noticias y actualizaciones clínicas procedentes de fuentes acreditadas.
          Haz clic en “Ver noticia completa” para abrir el medio original en una pestaña nueva.
        </p>
      </header>

      <section className="space-y-4">
        {noticiasEjemplo.map((n) => (
          <article
            key={n.id}
            className="border rounded-lg p-4 bg-white shadow-sm"
          >
            <h2 className="text-lg font-semibold mb-1">{n.titulo}</h2>
            <p className="text-xs text-gray-500 mb-2">
              {n.fuente} · {n.fecha}
            </p>
            <p className="text-sm mb-3">{n.resumen}</p>
            <a
              href={n.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm font-semibold underline"
            >
              Ver noticia completa
            </a>
          </article>
        ))}

        {noticiasEjemplo.length === 0 && (
          <p className="text-sm text-gray-500">
            De momento no hay noticias disponibles. Cuando se conecte el módulo de fuentes externas,
            verás aquí un listado actualizado en tiempo real.
          </p>
        )}
      </section>
    </div>
  );
};

export default ActualidadMedica;
