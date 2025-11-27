// src/pages/VocesPublic.jsx — lista de artículos públicos
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";

export default function VocesPublic() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/voces/public");
      const data = await r.json();
      if (r.ok && data?.ok) setItems(data.items || []);
    })();
  }, []);

  return (
    <>
      <Seo title="Voces · Artículos" />
      <main className="sr-container py-8" style={{ minHeight: "calc(100vh - 160px)" }}>
        <h1 className="sr-h1">Voces · Artículos</h1>
        <p className="sr-small text-zinc-600">Opiniones y reflexiones publicadas por mediadores/as. Mediazion no se hace responsable de su contenido.</p>
        <div className="grid gap-3 mt-4">
          {items.length === 0 && <p className="sr-p">No hay artículos publicados todavía.</p>}
          {items.map(it => (
            <article key={it.id} className="sr-card">
              <h3 className="sr-h3"><Link to={`/voces/${it.slug}`}>{it.title}</Link></h3>
              <p className="sr-small text-zinc-600">Por {it.author_email} · {it.published_at}</p>
              <p className="sr-p">{it.summary}</p>
              <Link className="sr-btn-secondary" to={`/voces/${it.slug}`}>Leer</Link>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
