// src/pages/Agenda.jsx — Panel PRO · Agenda profesional (crear + listar + editar + borrar + casos)
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Seo from "../components/Seo.jsx";

const LS_EMAIL = "mediador_email";

export default function Agenda() {
  const email = localStorage.getItem(LS_EMAIL) || "";
  const nav = useNavigate();
  const [searchParams] = useSearchParams();

  // Pre-carga de caso (si venimos de Casos.jsx)
  const preloadCaso = searchParams.get("caso_id");

  // FORMULARIO
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");
  const [tipo, setTipo] = useState("cita");
  const [casoId, setCasoId] = useState("");

  // LISTAS
  const [casos, setCasos] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // ESTADO EDICIÓN
  const [editId, setEditId] = useState(null);

  // MENSAJES
  const [infoMsg, setInfoMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  function goPanel() {
    nav("/panel-mediador");
  }

  // =======================
  // CARGAR CASOS Y AGENDA
  // =======================
  useEffect(() => {
    if (!email) return;

    loadCasos().then(() => {
      if (preloadCaso) setCasoId(preloadCaso);
    });

    loadAgenda();
  }, [email]);

  async function loadCasos() {
    try {
      const resp = await fetch(`/api/casos?email=${encodeURIComponent(email)}`);
      const data = await resp.json().catch(() => []);
      if (resp.ok && Array.isArray(data)) setCasos(data);
    } catch {}
  }

  async function loadAgenda() {
    setLoading(true);
    try {
      const resp = await fetch(`/api/agenda?email=${encodeURIComponent(email)}`);
      const data = await resp.json().catch(() => ({}));
      if (resp.ok && data?.ok) setItems(data.items || []);
    } catch {}
    setLoading(false);
  }

  // =======================
  // RESET FORM
  // =======================
  function resetForm() {
    setTitulo("");
    setDescripcion("");
    setFecha("");
    setTipo("cita");
    setCasoId("");
    setEditId(null);
  }

  // =======================
  // EDITAR EVENTO
  // =======================
  function startEdit(ev) {
    setEditId(ev.id);
    setTitulo(ev.titulo);
    setDescripcion(ev.descripcion || "");

    // Adaptar fecha al input datetime-local
    const d = new Date(ev.fecha);
    const isoLocal = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

    setFecha(isoLocal);
    setTipo(ev.tipo);
    setCasoId(ev.caso_id ? String(ev.caso_id) : "");
  }

  // =======================
  // CREAR / EDITAR EVENTO
  // =======================
  async function handleSubmit(e) {
    e.preventDefault();

    if (!titulo.trim()) {
      setErrorMsg("El título es obligatorio");
      return;
    }
    if (!fecha) {
      setErrorMsg("Debes indicar fecha y hora.");
      return;
    }

    const payload = {
      email,
      titulo,
      descripcion,
      fecha,
      tipo,
      caso_id: casoId ? Number(casoId) : null,
    };

    try {
      let url = "/api/agenda";
      let method = "POST";

      if (editId) {
        url = `/api/agenda/${editId}`;
        method = "PUT";
      }

      const resp = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok || !data.ok) throw new Error(data.detail || "Error guardando");

      setInfoMsg(editId ? "Evento actualizado" : "Evento creado");
      resetForm();
      loadAgenda();
    } catch (e) {
      setErrorMsg(e.message);
    }
  }

  // =======================
  // BORRAR
  // =======================
  async function handleDelete(id) {
    const ok = window.confirm("¿Seguro que quieres eliminar este evento?");
    if (!ok) return;

    try {
      const resp = await fetch(
        `/api/agenda/${id}?email=${encodeURIComponent(email)}`,
        { method: "DELETE" }
      );
      const data = await resp.json();

      if (!resp.ok || !data.ok) throw new Error("No se pudo eliminar");

      setInfoMsg("Evento eliminado");
      loadAgenda();
      if (editId === id) resetForm();
    } catch (e) {
      setErrorMsg(e.message);
    }
  }

  return (
    <>
      <Seo title="Agenda · Panel PRO" />

      <main className="sr-container py-8" style={{ minHeight: "calc(100vh - 160px)" }}>
        {/* ===========================
           HEADER
        ============================ */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="sr-h1">🗓️ Agenda</h1>
          <button className="sr-btn-secondary" onClick={goPanel}>
            ← Volver al Panel PRO
          </button>
        </div>

        {/* ===========================
           MENSAJES
        ============================ */}
        {errorMsg && (
          <div
            className="sr-card mb-6"
            style={{ borderColor: "#fecaca", color: "#991b1b" }}
          >
            <p className="sr-small">❌ {errorMsg}</p>
          </div>
        )}

        {infoMsg && (
          <div
            className="sr-card mb-6"
            style={{ borderColor: "#bbf7d0", color: "#166534" }}
          >
            <p className="sr-small">✅ {infoMsg}</p>
          </div>
        )}

        {/* ===========================
           FORMULARIO
        ============================ */}
        <section className="sr-card mb-8">
          <h2 className="sr-h2 mb-3">
            {editId ? "✏️ Editar evento" : "➕ Crear evento"}
          </h2>

          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div>
              <label className="sr-label">Título</label>
              <input
                className="sr-input"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </div>

            <div>
              <label className="sr-label">Descripción</label>
              <textarea
                className="sr-input"
                rows={3}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>

            <div>
              <label className="sr-label">Fecha y hora</label>
              <input
                type="datetime-local"
                className="sr-input"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>

            <div>
              <label className="sr-label">Tipo</label>
              <select className="sr-input" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                <option value="cita">Cita</option>
                <option value="recordatorio">Recordatorio</option>
                <option value="videollamada">Videollamada</option>
              </select>
            </div>

            {/* DESPLEGABLE DE CASOS */}
            <div>
              <label className="sr-label">Vincular a un caso</label>
              <select
                className="sr-input"
                value={casoId}
                onChange={(e) => setCasoId(e.target.value)}
              >
                <option value="">— Sin caso asociado —</option>
                {casos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.titulo}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button className="sr-btn-primary" type="submit">
                {editId ? "Guardar cambios" : "Crear evento"}
              </button>

              {editId && (
                <button
                  type="button"
                  className="sr-btn-secondary"
                  onClick={resetForm}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        {/* ===========================
           LISTADO PROFESIONAL
        ============================ */}
        <section className="sr-card">
          <h2 className="sr-h2 mb-4">📋 Eventos existentes</h2>

          {loading && (
            <p className="sr-small text-zinc-500">Cargando eventos…</p>
          )}

          {!loading && items.length === 0 && (
            <p className="sr-small text-zinc-600">
              No tienes eventos registrados.
            </p>
          )}

          {!loading && items.length > 0 && (
            <div className="grid gap-4">
              {items.map((ev) => (
                <article key={ev.id} className="sr-card">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="sr-h3">{ev.titulo}</h3>
                    <span className="sr-small">
                      {ev.tipo === "cita" && "📅 Cita"}
                      {ev.tipo === "recordatorio" && "⏰ Recordatorio"}
                      {ev.tipo === "videollamada" && "🎥 Videollamada"}
                    </span>
                  </div>

                  {ev.descripcion && (
                    <p className="sr-small text-zinc-700">{ev.descripcion}</p>
                  )}

                  <p className="sr-small mt-1">
                    <b>Fecha:</b> {new Date(ev.fecha).toLocaleString()}
                  </p>

                  {ev.caso_id && (
                    <p className="sr-small mt-1">
                      <b>Caso:</b>{" "}
                      {casos.find((c) => c.id === ev.caso_id)?.titulo ||
                        `ID ${ev.caso_id}`}
                    </p>
                  )}

                  <div className="mt-3 flex gap-2">
                    <button className="sr-btn-secondary" onClick={() => startEdit(ev)}>
                      ✏️ Editar
                    </button>
                    <button className="sr-btn-secondary" onClick={() => handleDelete(ev.id)}>
                      🗑️ Eliminar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
