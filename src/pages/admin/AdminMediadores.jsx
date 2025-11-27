// src/pages/admin/AdminMediadores.jsx — Gestión de mediadores (ADMIN) · Mediazion

import React, { useEffect, useState } from "react";
import Seo from "../../components/Seo.jsx";

export default function AdminMediadores() {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState("");

  const [busyId, setBusyId] = useState(null); // para deshabilitar botón mientras se actúa

  async function cargarListado() {
    setLoading(true);
    setMsg("");
    try {
      // Usamos la ruta pública que ya tienes en el backend:
      // /api/mediadores/public
      const r = await fetch("/api/mediadores/public");
      const data = await r.json().catch(() => ({}));

      let lista = [];

      if (Array.isArray(data)) {
        // por si el backend devuelve directamente un array
        lista = data;
      } else if (data?.ok && Array.isArray(data.items)) {
        // formato { ok: true, items: [...] }
        lista = data.items;
      } else {
        throw new Error(data?.detail || "No se pudo cargar la lista de mediadores");
      }

      setItems(lista);
      setFiltered(lista);
    } catch (e) {
      setMsg("❌ " + (e.message || "Error cargando mediadores"));
      setItems([]);
      setFiltered([]);
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
      setFiltered(items);
      return;
    }
    const f = items.filter((m) => {
      const email = (m.email || "").toLowerCase();
      const nombre = (m.name || "").toLowerCase();
      const provincia = (m.provincia || "").toLowerCase();
      return (
        email.includes(query) ||
        nombre.includes(query) ||
        provincia.includes(query)
      );
    });
    setFiltered(f);
  }

  function badgeEstado(m) {
    const estado = m.subscription_status || "none";
    const blocked = !!m.blocked;
    if (blocked) {
      return (
        <span className="inline-block px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs">
          BLOQUEADO
        </span>
      );
    }
    if (estado === "active") {
      return (
        <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs">
          PRO activo
        </span>
      );
    }
    if (estado === "trialing") {
      return (
        <span className="inline-block px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 text-xs">
          PRO (trial)
        </span>
      );
    }
    return (
      <span className="inline-block px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-xs">
        BÁSICO
      </span>
    );
  }

  async function toggleBloqueo(m) {
    // De momento, si aún no tienes endpoint admin, dejamos esto como un "placeholder".
    alert(
      "Aquí irá la acción de bloquear / desbloquear mediador.\n\n" +
        "ID: " +
        (m.id || "—") +
        "\nEmail: " +
        (m.email || "—")
    );
    // Cuando tengas backend:
    // - crear POST /api/admin/mediadores/toggle_block
    // - llamar al endpoint y después a cargarListado()
  }

  async function togglePro(m) {
    alert(
      "Aquí irá la acción de cambiar PRO/BÁSICO.\n\n" +
        "ID: " +
        (m.id || "—") +
        "\nEmail: " +
        (m.email || "—")
    );
    // Igual que arriba: ajustar cuando tengas endpoint real.
  }

  return (
    <>
      <Seo
        title="Admin · Gestión de mediadores · Mediazion"
        description="Panel de administración para gestionar mediadores, estados PRO y bloqueos."
      />
      <main
        className="sr-container py-8"
        style={{ minHeight: "calc(100vh - 160px)" }}
      >
        <h1 className="sr-h1 mb-2">Gestión de mediadores</h1>
        <p className="sr-p mb-4">
          Desde aquí puedes consultar, buscar y, próximamente, gestionar los
          mediadores registrados en Mediazion.
        </p>

        {/* BUSCADOR */}
        <section className="sr-card mb-4">
          <form
            onSubmit={buscar}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <div className="flex-1">
              <label className="sr-label">Buscar mediador</label>
              <input
                className="sr-input"
                placeholder="Buscar por email, nombre o provincia…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <button className="sr-btn-primary" type="submit">
              Buscar
            </button>
          </form>
          {msg && (
            <p className="sr-small mt-3" style={{ color: "#991b1b" }}>
              {msg}
            </p>
          )}
        </section>

        {/* LISTADO */}
        <section className="sr-card">
          <h2 className="sr-h2 mb-2">Listado de mediadores</h2>
          {loading ? (
            <p className="sr-p">Cargando mediadores…</p>
          ) : filtered.length === 0 ? (
            <p className="sr-p">
              No hay mediadores que coincidan con la búsqueda.
            </p>
          ) : (
            <div
              style={{
                width: "100%",
                overflowX: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 14,
                }}
              >
                <thead>
                  <tr
                    style={{
                      textAlign: "left",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    <th style={{ padding: "8px" }}>Email</th>
                    <th style={{ padding: "8px" }}>Nombre</th>
                    <th style={{ padding: "8px" }}>Provincia</th>
                    <th style={{ padding: "8px" }}>Estado</th>
                    <th style={{ padding: "8px" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => (
                    <tr
                      key={m.id || m.email}
                      style={{ borderBottom: "1px solid #e5e7eb" }}
                    >
                      <td style={{ padding: "8px" }}>{m.email}</td>
                      <td style={{ padding: "8px" }}>
                        {m.name || m.alias || "—"}
                      </td>
                      <td style={{ padding: "8px" }}>
                        {m.provincia || "—"}
                      </td>
                      <td style={{ padding: "8px" }}>{badgeEstado(m)}</td>
                      <td style={{ padding: "8px" }}>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 6,
                          }}
                        >
                          <button
                            type="button"
                            className="sr-btn-secondary"
                            style={{ padding: "4px 10px", fontSize: 12 }}
                            onClick={() =>
                              alert(
                                `Mediador: ${
                                  m.name || m.alias || m.email
                                }\n\nEmail: ${
                                  m.email
                                }\nProvincia: ${
                                  m.provincia || "—"
                                }\n\n(En el futuro esta acción puede abrir una ficha más completa).`
                              )
                            }
                          >
                            Ver ficha
                          </button>
                          <button
                            type="button"
                            className="sr-btn-secondary"
                            style={{ padding: "4px 10px", fontSize: 12 }}
                            onClick={() => togglePro(m)}
                          >
                            Cambiar PRO/BÁSICO
                          </button>
                          <button
                            type="button"
                            className="sr-btn-secondary"
                            style={{
                              padding: "4px 10px",
                              fontSize: 12,
                              backgroundColor: "#fee2e2",
                              color: "#991b1b",
                            }}
                            onClick={() => toggleBloqueo(m)}
                          >
                            {m.blocked ? "Desbloquear" : "Bloquear"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
