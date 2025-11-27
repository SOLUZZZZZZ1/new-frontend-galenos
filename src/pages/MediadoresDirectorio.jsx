// src/pages/MediadoresDirectorio.jsx — Directorio con búsqueda por provincia, badges y ficha ampliada en modal

import React, { useEffect, useState } from "react";
import Seo from "../components/Seo.jsx";

export default function MediadoresDirectorio() {
  const [allItems, setAllItems] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState("");
  const [selected, setSelected] = useState(null);

  async function cargarListado() {
    setLoading(true);
    setMsg("");
    try {
      const r = await fetch("/api/mediadores/public");
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data?.ok) {
        throw new Error(data?.detail || "No se pudo cargar el directorio");
      }
      let lista = data.items || [];

      // Ordenar por provincia y nombre
      lista = [...lista].sort((a, b) => {
        const pa = (a.provincia || "").toLowerCase();
        const pb = (b.provincia || "").toLowerCase();
        if (pa < pb) return -1;
        if (pa > pb) return 1;
        const na = (a.name || a.alias || "").toLowerCase();
        const nb = (b.name || b.alias || "").toLowerCase();
        if (na < nb) return -1;
        if (na > nb) return 1;
        return 0;
      });

      setAllItems(lista);
      setItems(lista);
    } catch (e) {
      setMsg("❌ " + (e.message || "Error cargando el directorio"));
      setAllItems([]);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarListado();
  }, []);

  function buscar(e) {
    e.preventDefault();
    const query = q.trim().toLowerCase();
    if (!query) {
      setItems(allItems);
      return;
    }
    const filtrados = allItems.filter((m) => {
      const nombre = (m.name || "").toLowerCase();
      const alias = (m.alias || "").toLowerCase();
      const bio = (m.bio || "").toLowerCase();
      const especialidad = (m.especialidad || "").toLowerCase();
      const provincia = (m.provincia || "").toLowerCase();
      const ciudad = (m.ciudad || "").toLowerCase();
      return (
        nombre.includes(query) ||
        alias.includes(query) ||
        bio.includes(query) ||
        especialidad.includes(query) ||
        provincia.includes(query) ||
        ciudad.includes(query)
      );
    });
    setItems(filtrados);
  }

  function abrirFicha(m) {
    setSelected(m);
  }

  function cerrarFicha() {
    setSelected(null);
  }

  function buildBadges(m) {
    const badges = [];
    const esp = (m.especialidad || "").toLowerCase();
    const etiquetas = (m.etiquetas || "").toLowerCase();
    if (esp.includes("civil") || etiquetas.includes("civil")) badges.push("Civil");
    if (esp.includes("mercantil") || etiquetas.includes("mercantil")) badges.push("Mercantil");
    if (esp.includes("familiar") || etiquetas.includes("familiar")) badges.push("Familiar");
    if (esp.includes("comunit") || etiquetas.includes("comunit")) badges.push("Comunitaria");
    if (etiquetas.includes("online") || esp.includes("online")) badges.push("Online");
    return badges;
  }

  return (
    <>
      <Seo
        title="Directorio de Mediadores · Mediazion"
        description="Encuentra mediadores activos según provincia, nombre, alias, especialidad y bio."
      />
      <main className="sr-container py-10">
        <h1 className="sr-h1">Directorio de Mediadores</h1>
        <p className="sr-p">
          Consulta mediadores activos en Mediazion. Solo se muestran perfiles completados.
        </p>

        {/* BUSCADOR */}
        <form
          onSubmit={buscar}
          className="sr-card mt-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-end"
          style={{ maxWidth: 800 }}
        >
          <div className="flex-1">
            <label className="sr-label">Buscar</label>
            <input
              type="text"
              className="sr-input w-full"
              placeholder="Escribe provincia (ej. Barcelona), nombre, alias o especialidad…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <button className="sr-btn-primary" type="submit">
            Buscar
          </button>
        </form>

        {msg && (
          <p className="sr-small mt-4" style={{ color: "#991B1B" }}>
            {msg}
          </p>
        )}

        {/* LISTADO */}
        {loading ? (
          <p className="sr-p mt-6">Cargando mediadores…</p>
        ) : items.length === 0 ? (
          <p className="sr-p mt-6">No hay mediadores disponibles.</p>
        ) : (
          <section className="grid gap-4 mt-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((m) => {
              const badges = buildBadges(m);
              return (
                <article
                  key={m.id}
                  className="sr-card cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => abrirFicha(m)}
                >
                  <h3 className="sr-h3 mb-0">{m.name || m.alias || "Mediador/a"}</h3>
                  <p className="sr-small text-zinc-600 mb-1">
                    {m.provincia || "Provincia no indicada"}
                    {m.ciudad ? ` · ${m.ciudad}` : ""}
                  </p>

                  {badges.length > 0 && (
                    <p className="sr-small mb-2">
                      {badges.map((b) => (
                        <span
                          key={b}
                          className="inline-block px-2 py-0.5 mr-1 mb-1 rounded-full border text-xs text-sky-800 border-sky-200 bg-sky-50"
                        >
                          {b}
                        </span>
                      ))}
                    </p>
                  )}

                  {m.photo_url && (
                    <img
                      src={m.photo_url}
                      alt="Avatar mediador"
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: "cover",
                        borderRadius: "50%",
                        marginBottom: 8,
                      }}
                    />
                  )}

                  {m.bio && (
                    <p className="sr-p text-sm line-clamp-3 whitespace-pre-wrap">
                      {m.bio}
                    </p>
                  )}

                  <p className="sr-small mt-2 text-sky-700">
                    Haz clic para ver ficha completa
                  </p>
                </article>
              );
            })}
          </section>
        )}
      </main>

      {/* MODAL FICHA AMPLIADA */}
      {selected && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
          onClick={cerrarFicha}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 md:p-8 relative sr-card"
            style={{ maxHeight: "80vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={cerrarFicha}
              className="absolute top-3 right-4 text-zinc-500 hover:text-zinc-800 text-xl"
              aria-label="Cerrar"
            >
              ×
            </button>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center md:items-start">
                {selected.photo_url && (
                  <img
                    src={selected.photo_url}
                    alt="Avatar mediador"
                    style={{
                      width: 120,
                      height: 120,
                      objectFit: "cover",
                      borderRadius: "50%",
                      marginBottom: 10,
                    }}
                  />
                )}
                <h2 className="sr-h2 mb-1">
                  {selected.name || selected.alias || "Mediador/a"}
                </h2>
                <p className="sr-small text-zinc-600">
                  {selected.provincia || "Provincia no indicada"}
                  {selected.ciudad ? ` · ${selected.ciudad}` : ""}
                  {selected.especialidad ? ` · ${selected.especialidad}` : ""}
                </p>
                {buildBadges(selected).length > 0 && (
                  <p className="sr-small mt-2">
                    {buildBadges(selected).map((b) => (
                      <span
                        key={b}
                        className="inline-block px-2 py-0.5 mr-1 mb-1 rounded-full border text-xs text-sky-800 border-sky-200 bg-sky-50"
                      >
                        {b}
                      </span>
                    ))}
                  </p>
                )}
              </div>

              <div className="flex-1">
                {selected.bio && (
                  <>
                    <h3 className="sr-h3 mb-2">Sobre este mediador/a</h3>
                    <p className="sr-p whitespace-pre-wrap">{selected.bio}</p>
                  </>
                )}

                {selected.web && (
                  <p className="sr-small mt-3">
                    Web:{" "}
                    <a
                      href={selected.web}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-700 underline"
                    >
                      {selected.web}
                    </a>
                  </p>
                )}

                {selected.email_publico && (
                  <p className="sr-small mt-1">
                    Email:{" "}
                    <a
                      href={`mailto:${selected.email_publico}`}
                      className="text-sky-700 underline"
                    >
                      {selected.email_publico}
                    </a>
                  </p>
                )}

                <p className="sr-small mt-4 text-zinc-500">
                  Próximamente podrás contactar directamente a través de Mediazion desde esta ficha.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
