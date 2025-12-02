// src/pages/PacienteDetalle.jsx — Ficha completa del Paciente · Galenos.pro
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const API =
  import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

export default function PacienteDetalle() {
  const { id } = useParams(); // ID del paciente
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState("");

  const token = localStorage.getItem("galenos_token");

  // Datos del paciente
  const [analytics, setAnalytics] = useState([]);
  const [imaging, setImaging] = useState([]);
  const [notes, setNotes] = useState([]);
  const [timeline, setTimeline] = useState([]);

  // Nuevas notas
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  // Para editar nota
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  // Edición de datos del paciente
  const [editingPatient, setEditingPatient] = useState(false);
  const [editAlias, setEditAlias] = useState("");
  const [editAge, setEditAge] = useState("");
  const [editGender, setEditGender] = useState("");
  const [editNotesPatient, setEditNotesPatient] = useState("");
  const [savingPatient, setSavingPatient] = useState(false);

  // Bloques plegables
  const [open, setOpen] = useState({
    datos: true,
    analiticas: false,
    imagenes: false,
    notas: false,
    timeline: false,
  });

  function toggle(block) {
    setOpen((prev) => ({ ...prev, [block]: !prev[block] }));
  }

  // =========================
  // CARGA DE DATOS DEL PACIENTE
  // =========================
  useEffect(() => {
    async function loadAll() {
      try {
        setLoading(true);

        // 1. Datos del paciente
        const p = await fetch(`${API}/patients/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const patientData = await p.json();
        setPatient(patientData);

        // 2. Analíticas
        const a = await fetch(`${API}/analytics/by-patient/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAnalytics(await a.json());

        // 3. Imágenes
        const i = await fetch(`${API}/imaging/by-patient/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setImaging(await i.json());

        // 4. Notas
        const n = await fetch(`${API}/notes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotes(await n.json());

        // 5. Timeline
        const t = await fetch(`${API}/timeline/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTimeline(await t.json());
      } catch (err) {
        console.error("Error cargando ficha de paciente:", err);
        setError("No se pudo cargar la información del paciente.");
      } finally {
        setLoading(false);
      }
    }

    if (id && token) {
      loadAll();
    } else {
      setLoading(false);
      setError("Falta identificador de paciente o token.");
    }
  }, [id, token]);

  // =========================
  // CREAR NOTA
  // =========================
  async function createNote(e) {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      setSavingNote(true);

      const res = await fetch(`${API}/notes/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTitle.trim(),
          content: newContent.trim(),
        }),
      });

      const data = await res.json();
      setNotes((prev) => [...prev, data]);
      setNewTitle("");
      setNewContent("");
    } catch (err) {
      console.error("Error creando nota:", err);
      alert("Error creando nota.");
    } finally {
      setSavingNote(false);
    }
  }

  // =========================
  // EDITAR NOTA
  // =========================
  function startEdit(note) {
    setEditingNoteId(note.id);
    setEditTitle(note.title || "");
    setEditContent(note.content || "");
  }

  async function updateNote(noteId) {
    if (!editTitle.trim() || !editContent.trim()) return;

    try {
      const res = await fetch(`${API}/notes/note/${noteId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editTitle.trim(),
          content: editContent.trim(),
        }),
      });

      const updated = await res.json();

      setNotes((prev) => prev.map((n) => (n.id === noteId ? updated : n)));

      setEditingNoteId(null);
      setEditTitle("");
      setEditContent("");
    } catch (error) {
      console.error("Error al actualizar nota:", error);
      alert("No se pudo actualizar la nota.");
    }
  }

  // =========================
  // EDITAR DATOS DEL PACIENTE
  // =========================
  function startEditPatient() {
    if (!patient) return;
    setEditAlias(patient.alias || "");
    setEditAge(patient.age != null ? String(patient.age) : "");
    setEditGender(patient.gender || "");
    setEditNotesPatient(patient.notes || "");
    setEditingPatient(true);
  }

  function cancelEditPatient() {
    setEditingPatient(false);
    setSavingPatient(false);
  }

  async function savePatient(e) {
    e.preventDefault();
    if (!patient) return;

    try {
      setSavingPatient(true);
      const body = {
        alias: editAlias.trim(),
        age: editAge ? Number(editAge) : null,
        gender: editGender || null,
        notes: editNotesPatient || null,
      };

      const res = await fetch(`${API}/patients/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        console.error("Error al actualizar paciente:", await res.text());
        alert("No se pudieron actualizar los datos del paciente.");
        return;
      }

      const updated = await res.json();
      setPatient(updated);
      setEditingPatient(false);
    } catch (err) {
      console.error("Error guardando datos del paciente:", err);
      alert("No se pudieron guardar los datos del paciente.");
    } finally {
      setSavingPatient(false);
    }
  }

  if (loading) {
    return (
      <div className="sr-container py-8">
        <p className="text-slate-600">Cargando ficha del paciente...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sr-container py-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="sr-container py-8">
        <p className="text-slate-600">Paciente no encontrado.</p>
      </div>
    );
  }

  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString();
  };

  const sortedTimeline = [...timeline].sort((a, b) => {
    const da = new Date(a.created_at || a.date || 0).getTime();
    const db = new Date(b.created_at || b.date || 0).getTime();
    return db - da; // más reciente primero
  });

  const timelineLabel = (itemType) => {
    if (itemType === "imaging") return "imagen médica";
    if (itemType === "analytic") return "analítica";
    if (itemType === "note") return "nota clínica";
    if (itemType === "patient") return "alta de paciente";
    return "evento";
  };

  return (
    <div className="sr-container py-6 space-y-6">
      {/* CABECERA PACIENTE */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
              Paciente: {patient.alias || `ID ${patient.id}`}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              ID interno: <span className="font-mono">{patient.id}</span>
              {patient.created_at && (
                <>
                  {" "}
                  · Alta: <span>{formatDate(patient.created_at)}</span>
                </>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* BLOQUE: DATOS DEL PACIENTE */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200">
        <button
          type="button"
          onClick={() => toggle("datos")}
          className="w-full flex items-center justify-between px-4 py-3 sm:px-6 border-b border-slate-200 hover:bg-slate-50 transition"
        >
          <span className="font-semibold text-slate-800">
            Datos del paciente
          </span>
          <span className="text-sm text-slate-500">
            {open.datos ? "Ocultar" : "Mostrar"}
          </span>
        </button>

        {open.datos && (
          <div className="px-4 py-4 sm:px-6 sm:py-5 text-sm text-slate-700 space-y-3">
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="font-medium text-slate-800">Datos básicos</p>
              {!editingPatient && (
                <button
                  type="button"
                  onClick={startEditPatient}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  Editar datos
                </button>
              )}
            </div>

            {editingPatient ? (
              <form className="space-y-3" onSubmit={savePatient}>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Alias
                  </label>
                  <input
                    type="text"
                    value={editAlias}
                    onChange={(e) => setEditAlias(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Edad
                    </label>
                    <input
                      type="number"
                      value={editAge}
                      onChange={(e) => setEditAge(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Sexo
                    </label>
                    <input
                      type="text"
                      value={editGender}
                      onChange={(e) => setEditGender(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="H / M / Otro"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Notas generales
                  </label>
                  <textarea
                    value={editNotesPatient}
                    onChange={(e) => setEditNotesPatient(e.target.value)}
                    rows={3}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={cancelEditPatient}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-300 text-slate-600 hover:bg-slate-50"
                    disabled={savingPatient}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingPatient}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {savingPatient ? "Guardando..." : "Guardar datos"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Alias: </span>
                  {patient.alias || "-"}
                </p>
                <p>
                  <span className="font-medium">Edad (si disponible): </span>
                  {patient.age != null ? patient.age : "-"}
                </p>
                <p>
                  <span className="font-medium">Sexo: </span>
                  {patient.gender || "-"}
                </p>
                <p>
                  <span className="font-medium">Notas generales: </span>
                  {patient.notes || "Sin notas generales registradas."}
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* BLOQUE: ANALÍTICAS */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200">
        <button
          type="button"
          onClick={() => toggle("analiticas")}
          className="w-full flex items-center justify-between px-4 py-3 sm:px-6 border-b border-slate-200 hover:bg-slate-50 transition"
        >
          <span className="font-semibold text-slate-800">
            Analíticas de laboratorio
          </span>
          <span className="text-sm text-slate-500">
            {open.analiticas ? "Ocultar" : "Mostrar"}
          </span>
        </button>

        {open.analiticas && (
          <div className="px-4 py-4 sm:px-6 sm:py-5">
            {analytics.length === 0 ? (
              <p className="text-sm text-slate-500">
                No hay analíticas registradas para este paciente.
              </p>
            ) : (
              <div className="space-y-3 text-sm">
                {analytics.map((a) => (
                  <div
                    key={a.id}
                    className="border border-slate-200 rounded-lg px-3 py-2"
                  >
                    <p className="font-medium text-slate-800">Analítica</p>
                    <p className="text-slate-500">
                      Fecha: {formatDate(a.created_at)}
                    </p>
                    {a.summary && (
                      <p className="mt-1 text-slate-700 text-sm">
                        {a.summary}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* BLOQUE: IMÁGENES */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200">
        <button
          type="button"
          onClick={() => toggle("imagenes")}
          className="w-full flex items-center justify-between px-4 py-3 sm:px-6 border-b border-slate-200 hover:bg-slate-50 transition"
        >
          <span className="font-semibold text-slate-800">
            Imágenes médicas
          </span>
          <span className="text-sm text-slate-500">
            {open.imagenes ? "Ocultar" : "Mostrar"}
          </span>
        </button>

        {open.imagenes && (
          <div className="px-4 py-4 sm:px-6 sm:py-5">
            {imaging.length === 0 ? (
              <p className="text-sm text-slate-500">
                No hay estudios de imagen registrados para este paciente.
              </p>
            ) : (
              <div className="space-y-3 text-sm">
                {imaging.map((img) => (
                  <div
                    key={img.id}
                    className="border border-slate-200 rounded-lg px-3 py-2"
                  >
                    <p className="font-medium text-slate-800">
                      {img.type || "Estudio de imagen"}
                    </p>
                    <p className="text-slate-500">
                      Fecha: {formatDate(img.created_at)}
                    </p>
                    {img.summary && (
                      <p className="mt-1 text-slate-700 text-sm">
                        {img.summary}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* BLOQUE: NOTAS CLÍNICAS */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200">
        <button
          type="button"
          onClick={() => toggle("notas")}
          className="w-full flex items-center justify-between px-4 py-3 sm:px-6 border-b border-slate-200 hover:bg-slate-50 transition"
        >
          <span className="font-semibold text-slate-800">Notas clínicas</span>
          <span className="text-sm text-slate-500">
            {open.notas ? "Ocultar" : "Mostrar"}
          </span>
        </button>

        {open.notas && (
          <div className="px-4 py-4 sm:px-6 sm:py-5 space-y-6">
            {/* Formulario nueva nota */}
            <form onSubmit={createNote} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Título de la nota
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Motivo, diagnóstico provisional, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Contenido
                </label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                  placeholder="Detalle clínico, evolución, decisiones..."
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingNote}
                  className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {savingNote ? "Guardando..." : "Guardar nota"}
                </button>
              </div>
            </form>

            {/* Listado de notas */}
            <div className="space-y-3 text-sm">
              {notes.length === 0 ? (
                <p className="text-slate-500">
                  Aún no hay notas clínicas para este paciente.
                </p>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className="border border-slate-200 rounded-lg px-3 py-2"
                  >
                    {editingNoteId === note.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={3}
                          className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                        />
                        <div className="flex gap-2 justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingNoteId(null);
                              setEditTitle("");
                              setEditContent("");
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-300 text-slate-600 hover:bg-slate-50"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => updateNote(note.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700"
                          >
                            Guardar cambios
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-slate-800">
                            {note.title || "Nota clínica"}
                          </p>
                          <button
                            type="button"
                            onClick={() => startEdit(note)}
                            className="text-xs font-medium text-blue-600 hover:text-blue-700"
                          >
                            Editar
                          </button>
                        </div>
                        <p className="text-slate-500 text-xs mt-0.5">
                          {formatDate(note.created_at)}
                        </p>
                        <p className="mt-1 text-slate-700 whitespace-pre-wrap">
                          {note.content}
                        </p>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </section>

      {/* BLOQUE: TIMELINE */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8">
        <button
          type="button"
          onClick={() => toggle("timeline")}
          className="w-full flex items-center justify-between px-4 py-3 sm:px-6 border-b border-slate-200 hover:bg-slate-50 transition"
        >
          <span className="font-semibold text-slate-800">
            Timeline del paciente
          </span>
          <span className="text-sm text-slate-500">
            {open.timeline ? "Ocultar" : "Mostrar"}
          </span>
        </button>

        {open.timeline && (
          <div className="px-4 py-4 sm:px-6 sm:py-5">
            {sortedTimeline.length === 0 ? (
              <p className="text-sm text-slate-500">
                No hay eventos en el timeline para este paciente.
              </p>
            ) : (
              <ol className="relative border-l border-slate-200 text-sm">
                {sortedTimeline.map((item) => (
                  <li key={item.id} className="mb-4 ml-4">
                    <div className="absolute w-2 h-2 bg-blue-600 rounded-full -left-1 mt-2" />
                    <p className="text-xs text-slate-500">
                      {formatDate(item.created_at)} ·{" "}
                      <span className="uppercase tracking-wide">
                        {item.item_type}
                      </span>
                    </p>
                    <p className="mt-0.5 text-slate-700">
                      {timelineLabel(item.item_type)}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
