// src/pages/PacienteDetalle.jsx — Ficha de paciente completa · Galenos.pro
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API =
  import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

export default function PacienteDetalle() {
  const { id } = useParams(); // ID interno del paciente (PK)
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState("");

  const [analytics, setAnalytics] = useState([]);
  const [imaging, setImaging] = useState([]);
  const [notes, setNotes] = useState([]);
  const [timeline, setTimeline] = useState([]);

  // Bloques plegables
  const [open, setOpen] = useState({
    datos: true,
    analiticas: true,
    imagenes: true,
    notas: true,
    timeline: true,
  });

  const token = localStorage.getItem("galenos_token");

  // Estado para editar datos del paciente
  const [editing, setEditing] = useState(false);
  const [editAlias, setEditAlias] = useState("");
  const [editAge, setEditAge] = useState("");
  const [editGender, setEditGender] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [savingPatient, setSavingPatient] = useState(false);
  const [patientSaveError, setPatientSaveError] = useState("");

  // Estado para crear nota clínica
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteError, setNoteError] = useState("");

  function toggle(block) {
    setOpen((prev) => ({ ...prev, [block]: !prev[block] }));
  }

  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString("es-ES");
  };

  // =========================
  // CARGA DE TODOS LOS DATOS DEL PACIENTE
  // =========================
  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      setError("");

      if (!id || !token) {
        setLoading(false);
        setError("Falta identificador de paciente o token.");
        return;
      }

      // 1) Datos básicos
      try {
        const res = await fetch(`${API}/patients/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const raw = await res.text();
        console.log("👉 [Ficha] /patients/", id, "(raw):", raw);

        if (!res.ok) {
          console.error("Error HTTP en /patients:", res.status, raw);
          setError("No se pudieron cargar los datos básicos del paciente.");
          setLoading(false);
          return;
        }

        const data = JSON.parse(raw);
        setPatient(data);
        // Inicializamos campos de edición
        setEditAlias(data.alias || "");
        setEditAge(data.age != null ? String(data.age) : "");
        setEditGender(data.gender || "");
        setEditNotes(data.notes || "");
      } catch (err) {
        console.error("❌ Error cargando /patients:", err);
        setError("No se pudieron cargar los datos básicos del paciente.");
        setLoading(false);
        return;
      }

      // 2) Analíticas
      try {
        const res = await fetch(`${API}/analytics/by-patient/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const raw = await res.text();
        console.log("👉 [Ficha] /analytics/by-patient/", id, "(raw):", raw);
        if (res.ok) {
          const data = JSON.parse(raw || "[]");
          setAnalytics(Array.isArray(data) ? data : []);
        } else {
          console.error("Error HTTP en /analytics/by-patient:", res.status, raw);
        }
      } catch (err) {
        console.error("❌ Error cargando analytics:", err);
      }

      // 3) Imágenes
      try {
        const res = await fetch(`${API}/imaging/by-patient/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const raw = await res.text();
        console.log("👉 [Ficha] /imaging/by-patient/", id, "(raw):", raw);
        if (res.ok) {
          const data = JSON.parse(raw || "[]");
          setImaging(Array.isArray(data) ? data : []);
        } else {
          console.error("Error HTTP en /imaging/by-patient:", res.status, raw);
        }
      } catch (err) {
        console.error("❌ Error cargando imaging:", err);
      }

      // 4) Notas clínicas
      try {
        const res = await fetch(`${API}/notes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const raw = await res.text();
        console.log("👉 [Ficha] /notes/", id, "(raw):", raw);
        if (res.ok) {
          const data = JSON.parse(raw || "[]");
          setNotes(Array.isArray(data) ? data : []);
        } else {
          console.error("Error HTTP en /notes:", res.status, raw);
        }
      } catch (err) {
        console.error("❌ Error cargando notes:", err);
      }

      // 5) Timeline
      try {
        const res = await fetch(`${API}/timeline/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const raw = await res.text();
        console.log("👉 [Ficha] /timeline/", id, "(raw):", raw);
        if (res.ok) {
          const data = JSON.parse(raw || "[]");
          setTimeline(Array.isArray(data) ? data : []);
        } else {
          console.error("Error HTTP en /timeline:", res.status, raw);
        }
      } catch (err) {
        console.error("❌ Error cargando timeline:", err);
      }

      setLoading(false);
    }

    loadAll();
  }, [id, token]);

  // =========================
  // EDITAR / GUARDAR DATOS DEL PACIENTE
  // =========================
  async function handleSavePatient(e) {
    e.preventDefault();
    setPatientSaveError("");

    if (!token) {
      setPatientSaveError("No hay sesión activa. Vuelve a iniciar sesión.");
      return;
    }

    const ageNumber =
      editAge.trim() === "" ? null : Number.parseInt(editAge.trim(), 10);
    if (editAge.trim() !== "" && Number.isNaN(ageNumber)) {
      setPatientSaveError("La edad debe ser un número.");
      return;
    }

    const payload = {
      alias: editAlias.trim() || null,
      age: ageNumber,
      gender: editGender.trim() || null,
      notes: editNotes.trim() || null,
    };

    try {
      setSavingPatient(true);
      const res = await fetch(`${API}/patients/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const raw = await res.text();
      console.log("👉 [Ficha] PUT /patients/", id, "(raw):", raw);

      if (!res.ok) {
        let msg = "No se han podido guardar los datos del paciente.";
        try {
          const errData = JSON.parse(raw);
          if (errData.detail) msg = errData.detail;
        } catch {}
        setPatientSaveError(msg);
        return;
      }

      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        setPatientSaveError("Respuesta inesperada al guardar el paciente.");
        return;
      }

      setPatient(data);
      setEditAlias(data.alias || "");
      setEditAge(data.age != null ? String(data.age) : "");
      setEditGender(data.gender || "");
      setEditNotes(data.notes || "");
      setEditing(false);
    } catch (err) {
      console.error("❌ Error guardando paciente:", err);
      setPatientSaveError("Error de conexión al guardar el paciente.");
    } finally {
      setSavingPatient(false);
    }
  }

  // =========================
  // CREAR NOTA CLÍNICA
  // =========================
  async function handleCreateNote(e) {
    e.preventDefault();
    setNoteError("");

    if (!token) {
      setNoteError("No hay sesión activa. Vuelve a iniciar sesión.");
      return;
    }

    if (!newNoteTitle.trim()) {
      setNoteError("Escribe un título para la nota clínica.");
      return;
    }
    if (!newNoteContent.trim()) {
      setNoteError("Escribe el contenido de la nota clínica.");
      return;
    }

    const payload = {
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
    };

    try {
      setNoteSaving(true);
      const res = await fetch(`${API}/notes/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const raw = await res.text();
      console.log("👉 [Ficha] POST /notes/", id, "(raw):", raw);

      if (!res.ok) {
        let msg = "No se ha podido guardar la nota clínica.";
        try {
          const errData = JSON.parse(raw);
          if (errData.detail) msg = errData.detail;
        } catch {}
        setNoteError(msg);
        return;
      }

      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        setNoteError("Respuesta inesperada al guardar la nota clínica.");
        return;
      }

      // Añadimos la nota al principio de la lista
      setNotes((prev) => [data, ...prev]);
      setNewNoteTitle("");
      setNewNoteContent("");
    } catch (err) {
      console.error("❌ Error guardando nota clínica:", err);
      setNoteError("Error de conexión al guardar la nota clínica.");
    } finally {
      setNoteSaving(false);
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

  const displayId = patient.patient_number || patient.id;

  // Timeline ordenado
  const sortedTimeline = [...timeline].sort((a, b) => {
    const da = new Date(a.created_at || 0).getTime();
    const db = new Date(b.created_at || 0).getTime();
    return db - da;
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
      {/* CABECERA PACIENTE + Navegación */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
              Paciente: {patient.alias || `ID ${displayId}`}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Nº Paciente:{" "}
              <span className="font-mono">{patient.patient_number ?? "—"}</span>{" "}
              · ID interno: <span className="font-mono">{patient.id}</span>
              {patient.created_at && (
                <>
                  {" "}
                  · Alta: <span>{formatDate(patient.created_at)}</span>
                </>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="sr-btn-secondary text-xs sm:text-sm"
            >
              Volver al dashboard
            </button>
            <button
              type="button"
              onClick={() => navigate("/pacientes")}
              className="sr-btn-secondary text-xs sm:text-sm"
            >
              Volver a pacientes
            </button>
          </div>
        </div>
      </section>

      {/* DATOS DEL PACIENTE (con edición) */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
        <button
          type="button"
          onClick={() => toggle("datos")}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold">Datos del paciente</h2>
          <span className="text-xs text-slate-500">
            {open.datos ? "Ocultar" : "Mostrar"}
          </span>
        </button>

        {open.datos && (
          <div className="mt-3 space-y-3 text-sm text-slate-700">
            {!editing ? (
              <>
                <p>
                  <strong>Alias:</strong> {patient.alias}
                </p>
                <p>
                  <strong>Edad:</strong>{" "}
                  {patient.age != null ? `${patient.age} años` : "—"}
                </p>
                <p>
                  <strong>Sexo:</strong> {patient.gender || "—"}
                </p>
                <p>
                  <strong>Notas internas:</strong>{" "}
                  {patient.notes ? (
                    <span className="whitespace-pre-line">
                      {patient.notes}
                    </span>
                  ) : (
                    "—"
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="sr-btn-secondary text-xs mt-2"
                >
                  Editar datos
                </button>
                {patientSaveError && (
                  <p className="text-xs text-red-600 mt-1">
                    {patientSaveError}
                  </p>
                )}
              </>
            ) : (
              <form onSubmit={handleSavePatient} className="space-y-2">
                <div>
                  <label className="sr-label">Alias</label>
                  <input
                    type="text"
                    className="sr-input w-full"
                    value={editAlias}
                    onChange={(e) => setEditAlias(e.target.value)}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  <div>
                    <label className="sr-label">Edad</label>
                    <input
                      type="number"
                      className="sr-input w-full"
                      value={editAge}
                      onChange={(e) => setEditAge(e.target.value)}
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="sr-label">Sexo</label>
                    <input
                      type="text"
                      className="sr-input w-full"
                      value={editGender}
                      onChange={(e) => setEditGender(e.target.value)}
                      placeholder="Ej. Mujer / Varón"
                    />
                  </div>
                </div>
                <div>
                  <label className="sr-label">Notas internas</label>
                  <textarea
                    className="sr-input w-full min-h-[80px]"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Notas internas para tu propio uso clínico."
                  />
                </div>
                {patientSaveError && (
                  <p className="text-xs text-red-600 mt-1">
                    {patientSaveError}
                  </p>
                )}
                <div className="flex gap-2 mt-2">
                  <button
                    type="submit"
                    disabled={savingPatient}
                    className="sr-btn-primary text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {savingPatient ? "Guardando..." : "Guardar cambios"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // cancelar edición → restaurar valores actuales
                      setEditAlias(patient.alias || "");
                      setEditAge(
                        patient.age != null ? String(patient.age) : ""
                      );
                      setEditGender(patient.gender || "");
                      setEditNotes(patient.notes || "");
                      setEditing(false);
                      setPatientSaveError("");
                    }}
                    className="sr-btn-secondary text-xs"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </section>

      {/* ANALÍTICAS */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
        <button
          type="button"
          onClick={() => toggle("analiticas")}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold">Analíticas</h2>
          <span className="text-xs text-slate-500">
            {open.analiticas ? "Ocultar" : "Mostrar"}
          </span>
        </button>

        {open.analiticas && (
          <div className="mt-3 space-y-3">
            {analytics.length === 0 && (
              <p className="text-sm text-slate-500">
                No hay analíticas registradas para este paciente.
              </p>
            )}

            {analytics.map((a) => (
              <article
                key={a.id}
                className="border border-slate-200 rounded-lg p-3 space-y-2"
              >
                <p className="text-xs text-slate-500">
                  Fecha: {formatDate(a.exam_date || a.created_at)}
                </p>
                {a.summary && (
                  <div>
                    <h3 className="text-sm font-semibold mb-1">
                      Resumen orientativo
                    </h3>
                    <p className="text-sm whitespace-pre-line">{a.summary}</p>
                  </div>
                )}
                {a.differential && (
                  <div>
                    <h3 className="text-sm font-semibold mb-1">
                      Diagnóstico diferencial (orientativo)
                    </h3>
                    <p className="text-sm whitespace-pre-line">
                      {a.differential}
                    </p>
                  </div>
                )}
                {Array.isArray(a.markers) && a.markers.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-1">
                      Marcadores extraídos
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-xs border border-slate-200 rounded-md overflow-hidden">
                        <thead className="bg-slate-100">
                          <tr>
                            <th className="px-2 py-1 text-left">Marcador</th>
                            <th className="px-2 py-1 text-left">Valor</th>
                            <th className="px-2 py-1 text-left">Rango</th>
                            <th className="px-2 py-1 text-left">Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {a.markers.map((m, idx) => (
                            <tr
                              key={idx}
                              className="border-t border-slate-200"
                            >
                              <td className="px-2 py-1">{m.name}</td>
                              <td className="px-2 py-1">
                                {m.value != null ? m.value : ""}
                              </td>
                              <td className="px-2 py-1">{m.range || ""}</td>
                              <td className="px-2 py-1">
                                {m.status === "elevado" && (
                                  <span className="text-red-600 font-medium">
                                    Alto
                                  </span>
                                )}
                                {m.status === "bajo" && (
                                  <span className="text-amber-600 font-medium">
                                    Bajo
                                  </span>
                                )}
                                {m.status === "normal" && (
                                  <span className="text-emerald-700 font-medium">
                                    Normal
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* IMÁGENES MÉDICAS */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
        <button
          type="button"
          onClick={() => toggle("imagenes")}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold">Imágenes médicas</h2>
          <span className="text-xs text-slate-500">
            {open.imagenes ? "Ocultar" : "Mostrar"}
          </span>
        </button>

        {open.imagenes && (
          <div className="mt-3 space-y-3">
            {imaging.length === 0 && (
              <p className="text-sm text-slate-500">
                No hay imágenes médicas registradas para este paciente.
              </p>
            )}

            {imaging.map((img) => (
              <article
                key={img.id}
                className="border border-slate-200 rounded-lg p-3 space-y-2"
              >
                <p className="text-xs text-slate-500">
                  Tipo: {img.type || "—"} · Fecha:{" "}
                  {formatDate(img.exam_date || img.created_at)}
                </p>
                {img.summary && (
                  <div>
                    <h3 className="text-sm font-semibold mb-1">
                      Resumen radiológico orientativo
                    </h3>
                    <p className="text-sm whitespace-pre-line">
                      {img.summary}
                    </p>
                  </div>
                )}
                {img.differential && (
                  <div>
                    <h3 className="text-sm font-semibold mb-1">
                      Diagnóstico diferencial general (orientativo)
                    </h3>
                    <p className="text-sm whitespace-pre-line">
                      {img.differential}
                    </p>
                  </div>
                )}
                {Array.isArray(img.patterns) && img.patterns.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-1">
                      Patrones / hallazgos
                    </h3>
                    <ul className="list-disc list-inside text-sm text-slate-800 space-y-1">
                      {img.patterns.map((p, idx) => (
                        <li key={idx}>{p.pattern_text || String(p)}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {img.file_path && (
                  <div>
                    <h3 className="text-sm font-semibold mb-1">
                      Imagen analizada
                    </h3>
                    <img
                      src={img.file_path}
                      alt="Estudio de imagen médica"
                      className="mt-2 max-w-xs md:max-w-sm w-full rounded-lg border border-slate-200"
                    />
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* NOTAS CLÍNICAS (con creación) */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
        <button
          type="button"
          onClick={() => toggle("notas")}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold">Notas clínicas</h2>
          <span className="text-xs text-slate-500">
            {open.notas ? "Ocultar" : "Mostrar"}
          </span>
        </button>

        {open.notas && (
          <div className="mt-3 space-y-4">
            {/* Formulario de nueva nota */}
            <div className="border border-slate-200 rounded-lg p-3 space-y-2 bg-slate-50/60">
              <h3 className="text-sm font-semibold">
                Añadir nota clínica a este paciente
              </h3>
              <form onSubmit={handleCreateNote} className="space-y-2">
                <div>
                  <label className="sr-label">Título de la nota</label>
                  <input
                    type="text"
                    className="sr-input w-full"
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    placeholder="Ej. Primera valoración en consulta"
                  />
                </div>
                <div>
                  <label className="sr-label">Contenido</label>
                  <textarea
                    className="sr-input w-full min-h-[80px]"
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="Anota aquí la impresión clínica, decisiones tomadas, etc."
                  />
                </div>
                {noteError && (
                  <p className="text-sm text-red-600">{noteError}</p>
                )}
                <button
                  type="submit"
                  disabled={noteSaving}
                  className="sr-btn-secondary text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {noteSaving ? "Guardando nota..." : "Guardar nota clínica"}
                </button>
              </form>
            </div>

            {/* Lista de notas existentes */}
            {notes.length === 0 && (
              <p className="text-sm text-slate-500">
                No hay notas clínicas registradas para este paciente.
              </p>
            )}

            {notes.map((n) => (
              <article
                key={n.id}
                className="border border-slate-200 rounded-lg p-3 space-y-1"
              >
                <p className="text-xs text-slate-500">
                  Fecha: {formatDate(n.created_at)}
                </p>
                <h3 className="text-sm font-semibold">{n.title}</h3>
                <p className="text-sm whitespace-pre-line">{n.content}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* TIMELINE */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
        <button
          type="button"
          onClick={() => toggle("timeline")}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold">Timeline clínico</h2>
          <span className="text-xs text-slate-500">
            {open.timeline ? "Ocultar" : "Mostrar"}
          </span>
        </button>

        {open.timeline && (
          <div className="mt-3 space-y-2">
            {sortedTimeline.length === 0 && (
              <p className="text-sm text-slate-500">
                Aún no hay eventos en el timeline de este paciente.
              </p>
            )}

            {sortedTimeline.map((item) => (
              <div
                key={item.id}
                className="border border-slate-200 rounded-lg p-2 text-sm flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">
                    {timelineLabel(item.item_type)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDate(item.created_at)}
                  </p>
                </div>
                <div className="text-xs text-slate-400">
                  ID evento: {item.item_id}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
