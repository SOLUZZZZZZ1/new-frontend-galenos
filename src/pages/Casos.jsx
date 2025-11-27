// src/pages/Casos.jsx — Gestor de casos para mediadores PRO (backend pg_conn + email)
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../components/Seo.jsx";

const LS_EMAIL = "mediador_email";

const ESTADOS = [
  { value: "abierto", label: "Abierto" },
  { value: "en_curso", label: "En curso" },
  { value: "cerrado", label: "Cerrado" },
];

function EstadoBadge({ estado }) {
  const e = (estado || "abierto").toLowerCase();
  let text = "Abierto";
  if (e === "en_curso") text = "En curso";
  if (e === "cerrado") text = "Cerrado";

  const base =
    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium";
  let extra = " bg-emerald-100 text-emerald-800";
  if (e === "en_curso") extra = " bg-amber-100 text-amber-800";
  if (e === "cerrado") extra = " bg-slate-100 text-slate-800 line-through";

  return <span className={base + extra}>{text}</span>;
}

export default function Casos() {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [casos, setCasos] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [estado, setEstado] = useState("abierto");

  const [loadingList, setLoadingList] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [creating, setCreating] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  // Leer email al arrancar
  useEffect(() => {
    const e = localStorage.getItem(LS_EMAIL) || "";
    setEmail(e);
  }, []);

  // Cargar listado cuando tengamos email
  useEffect(() => {
    if (!email) return;
    loadCasos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  async function loadCasos() {
    if (!email) return;
    setErrorMsg("");
    setInfoMsg("");
    setLoadingList(true);
    try {
      const resp = await fetch(`/api/casos?email=${encodeURIComponent(email)}`);
      const data = await resp.json().catch(() => []);
      if (!resp.ok) {
        throw new Error(
          (data && (data.detail || data.message)) ||
            "No se pudieron cargar los casos."
        );
      }
      const lista = Array.isArray(data) ? data : [];
      setCasos(lista);
      if (lista.length > 0) {
        // si no hay seleccionado, cogemos el primero
        if (!selectedId) {
          handleSelect(lista[0]);
        }
      } else {
        // sin casos → formulario en modo crear
        prepareNewCase();
      }
    } catch (e) {
      console.error(e);
      setErrorMsg(e.message || "Error cargando casos.");
    } finally {
      setLoadingList(false);
    }
  }

  function resetForm() {
    setTitulo("");
    setDescripcion("");
    setEstado("abierto");
  }

  function handleSelect(caso) {
    if (!caso) {
      prepareNewCase();
      return;
    }
    setSelectedId(caso.id);
    setTitulo(caso.titulo || "");
    setDescripcion(caso.descripcion || "");
    setEstado(caso.estado || "abierto");
    setCreating(false);
    setInfoMsg("");
    setErrorMsg("");
  }

  function prepareNewCase() {
    setSelectedId(null);
    resetForm();
    setCreating(true);
    setInfoMsg("");
    setErrorMsg("");
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Debes iniciar sesión en el panel para gestionar casos.");
      return;
    }
    if (!titulo.trim()) {
      setErrorMsg("El título es obligatorio.");
      return;
    }

    setErrorMsg("");
    setInfoMsg("");
    setLoadingSave(true);

    const payload = {
      email,
      titulo: titulo.trim(),
      descripcion: descripcion || "",
      estado: estado || "abierto",
    };

    try {
      let url = "/api/casos";
      let method = "POST";

      if (!creating && selectedId) {
        url = `/api/casos/${selectedId}`;
        method = "PUT";
      }

      const resp = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        throw new Error(
          (data && (data.detail || data.message)) ||
            "No se pudo guardar el caso. Revisa los datos."
        );
      }

      // Mensaje limpio, sin [object Object]
      setInfoMsg(creating ? "Caso creado correctamente." : "Cambios guardados.");

      // Recargamos lista y seleccionamos algo
      await loadCasos();
    } catch (e) {
      console.error(e);
      setErrorMsg(e.message || "Error guardando el caso.");
    } finally {
      setLoadingSave(false);
    }
  }

  async function handleDelete() {
    if (!selectedId || !email) return;
    const ok = window.confirm("¿Seguro que quieres eliminar este caso?");
    if (!ok) return;

    setErrorMsg("");
    setInfoMsg("");

    try {
      const resp = await fetch(
        `/api/casos/${selectedId}?email=${encodeURIComponent(email)}`,
        { method: "DELETE" }
      );
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        throw new Error(
          (data && (data.detail || data.message)) ||
            "No se pudo eliminar el caso."
        );
      }

      setInfoMsg("Caso eliminado.");
      const remaining = casos.filter((c) => c.id !== selectedId);
      setCasos(remaining);
      if (remaining.length > 0) {
        handleSelect(remaining[0]);
      } else {
        prepareNewCase();
      }
    } catch (e) {
      console.error(e);
      setErrorMsg(e.message || "Error eliminando el caso.");
    }
  }

  const current = selectedId
    ? casos.find((c) => c.id === selectedId) || null
    : null;

  return (
    <>
      <Seo
        title="Casos — Mediazion"
        description="Gestor de casos y expedientes para mediadores PRO en Mediazion."
      />
      <main className="sr-container py-8" style={{ minHeight: "calc(100vh - 160px)" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="sr-h1">Casos</h1>
            <p className="sr-small text-slate-600">
              Gestiona tus expedientes de mediación. Solo tú ves esta información.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="sr-btn-secondary"
              type="button"
              onClick={() => nav("/panel-mediador")}
            >
              Volver al panel
            </button>
            <button
              className="sr-btn-primary"
              type="button"
              onClick={prepareNewCase}
            >
              Nuevo caso
            </button>
          </div>
        </div>

        {!email && (
          <div className="sr-card mb-4">
            <p className="sr-p">
              Debes iniciar sesión en el panel para gestionar tus casos. No se ha
              encontrado el correo en localStorage (<code>{LS_EMAIL}</code>).
            </p>
          </div>
        )}

        {errorMsg && (
          <div className="sr-card mb-3" style={{ borderColor: "#fecaca", color: "#991b1b" }}>
            <p className="sr-small">❌ {errorMsg}</p>
          </div>
        )}

        {infoMsg && (
          <div className="sr-card mb-3" style={{ borderColor: "#bbf7d0", color: "#166534" }}>
            <p className="sr-small">✅ {infoMsg}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Columna izquierda: listado */}
          <section className="md:col-span-1 sr-card" style={{ minHeight: 260 }}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="sr-h3">Tus casos</h2>
              {loadingList && (
                <span className="sr-small text-slate-500">Cargando…</span>
              )}
            </div>

            {(!casos || casos.length === 0) && !loadingList && (
              <p className="sr-small text-slate-500">
                No tienes casos todavía. Pulsa <b>“Nuevo caso”</b> para crear el primero.
              </p>
            )}

            {casos && casos.length > 0 && (
              <ul className="divide-y divide-slate-100 mt-2">
                {casos.map((c) => (
                  <li
                    key={c.id}
                    className={
                      "px-3 py-2 text-sm cursor-pointer hover:bg-slate-50 " +
                      (selectedId === c.id ? "bg-slate-100" : "")
                    }
                    onClick={() => handleSelect(c)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium truncate">
                        {c.titulo || "Sin título"}
                      </div>
                      <EstadoBadge estado={c.estado} />
                    </div>
                    {c.descripcion && (
                      <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">
                        {c.descripcion}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Columna derecha: detalle / formulario */}
          <section className="md:col-span-2 sr-card">
            <h2 className="sr-h3 mb-3">
              {creating || !current ? "Nuevo caso" : "Detalle del caso"}
            </h2>

            <form onSubmit={handleSave} className="grid gap-3">
              <div>
                <label className="sr-label mb-1">Título</label>
                <input
                  type="text"
                  className="sr-input"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej. Conflicto familiar, negociación alquiler, etc."
                />
              </div>

              <div>
                <label className="sr-label mb-1">Descripción</label>
                <textarea
                  className="sr-input"
                  rows={5}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe brevemente el caso. Esta información solo la ves tú."
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <label className="sr-label mb-1">Estado</label>
                  <select
                    className="sr-input"
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                  >
                    {ESTADOS.map((op) => (
                      <option key={op.value} value={op.value}>
                        {op.label}
                      </option>
                    ))}
                  </select>
                </div>
                {current && (
                  <div className="sr-small text-slate-500">
                    ID interno: {current.id}
                  </div>
                )}
              </div>

              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  type="submit"
                  className="sr-btn-primary"
                  disabled={loadingSave || !email}
                >
                  {loadingSave
                    ? "Guardando…"
                    : creating
                    ? "Crear caso"
                    : "Guardar cambios"}
                </button>
                <button
                  type="button"
                  className="sr-btn-secondary"
                  onClick={() => {
                    if (current) {
                      handleSelect(current);
                    } else {
                      resetForm();
                    }
                  }}
                  disabled={loadingSave}
                >
                  Deshacer cambios
                </button>
                {!creating && current && (
                  <button
                    type="button"
                    className="sr-btn-secondary"
                    onClick={handleDelete}
                    disabled={loadingSave}
                  >
                    Eliminar caso
                  </button>
                )}
              </div>
            </form>

            {!creating && current && (
              <p className="sr-small text-slate-500 mt-4">
                Más adelante podrás adjuntar documentos del caso, enlazar sesiones
                de Agenda y trabajar este expediente con la IA.
              </p>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
