// src/pages/VocesListaPRO.jsx — Listado de VOCES del propio mediador (PRO)
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";

const LS_EMAIL = "mediador_email";

export default function VocesListaPRO() {
  const [email, setEmail] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  useEffect(() => {
    const e = localStorage.getItem(LS_EMAIL) || "";
    setEmail(e);
  }, []);

  useEffect(() => {
    if (!email) return;
    loadMyVoces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  async function loadMyVoces() {
    setLoading(true);
    setErrorMsg("");
    setInfoMsg("");
    try {
      const resp = await fetch("/api/voces/public");
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data?.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "No se pudieron cargar las publicaciones."
        );
      }
      const all = Array.isArray(data.items) ? data.items : [];
      const my = all.filter(
        (p) =>
          p.author_email &&
          email &&
          String(p.author_email).toLowerCase() ===
            String(email).toLowerCase()
      );
      setItems(my);
    } catch (e) {
      console.error(e);
      setErrorMsg(e.message || "Error cargando tus publicaciones.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!email) return;
    const ok = window.confirm(
      "¿Seguro que quieres eliminar esta publicación?"
    );
    if (!ok) return;

    setErrorMsg("");
    setInfoMsg("");
    try {
      const resp = await fetch(
        `/api/voces/${id}?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
        }
      );
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data?.ok) {
        throw new Error(
          data?.detail || data?.message || "No se pudo eliminar."
        );
      }
      setInfoMsg("Publicación eliminada.");
      setItems((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      console.error(e);
      setErrorMsg(e.message || "Error eliminando la publicación.");
    }
  }

  return (
    <>
      <Seo
        title="Mis Voces · Panel PRO"
        description="Listado de artículos publicados por el propio mediador en Mediazion."
      />
      <main
        className="sr-container py-8"
        style={{ minHeight: "calc(100vh - 160px)" }}
      >
        <header className="sr-card mb-4">
          <h1 className="sr-h1">Mis Voces</h1>
          <p className="sr-small text-zinc-600">
            Aquí verás los artículos que has publicado en la sección pública de
            Voces.
          </p>
          {email && (
            <div className="mt-3">
              <Link
                className="sr-btn-primary"
                to="/panel-mediador/voces/nuevo"
              >
                Escribir nuevo artículo
              </Link>
            </div>
          )}
        </header>

        {!email && (
          <section className="sr-card mb-4">
            <p className="sr-p">
              No se ha encontrado el correo del mediador en{" "}
              <code>{LS_EMAIL}</code>. Inicia sesión en el panel para ver tus
              publicaciones.
            </p>
          </section>
        )}

        {email && (
          <>
            {errorMsg && (
              <section
                className="sr-card mb-3"
                style={{ borderColor: "#fecaca", color: "#991b1b" }}
              >
                <p className="sr-small">❌ {errorMsg}</p>
              </section>
            )}

            {infoMsg && (
              <section
                className="sr-card mb-3"
                style={{ borderColor: "#bbf7d0", color: "#166534" }}
              >
                <p className="sr-small">✅ {infoMsg}</p>
              </section>
            )}

            <section className="sr-card">
              <div className="flex items-center justify-between mb-3">
                <h2 className="sr-h3">Artículos publicados</h2>
                {loading && (
                  <span className="sr-small text-zinc-500">Cargando…</span>
                )}
              </div>

              {!loading && items.length === 0 && !errorMsg && (
                <p className="sr-small text-zinc-600">
                  Todavía no has publicado ningún artículo en Voces.
                </p>
              )}

              {!loading && items.length > 0 && (
                <div className="grid gap-3">
                  {items.map((it) => (
                    <article key={it.id} className="sr-card">
                      <h3 className="sr-h3 mb-1">{it.title}</h3>
                      {it.summary && (
                        <p className="sr-p text-zinc-700">{it.summary}</p>
                      )}
                      <p className="sr-small text-zinc-500 mt-1">
                        Publicado como: <code>{it.slug}</code>
                        {it.published_at && (
                          <>
                            {" · "}
                            {new Date(it.published_at).toLocaleString()}
                          </>
                        )}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <Link
                          className="sr-btn-secondary"
                          to={`/voces/${encodeURIComponent(it.slug)}`}
                        >
                          Ver artículo público
                        </Link>
                        <button
                          className="sr-btn-secondary"
                          type="button"
                          onClick={() => handleDelete(it.id)}
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </>
  );
}
