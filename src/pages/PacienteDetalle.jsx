// src/pages/PacienteDetalle.jsx — Ficha de paciente completa · Galenos.pro
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API =
  import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

export default function PacienteDetalle() {
  const { id } = useParams(); // ID del paciente
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState("");

  const token = localVariableOrLocalStorageToken();

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

  // Evento seleccionado desde el timeline
  const [focusedEvent, setFocusedEvent] = useState(null);

  // Evolución de analíticas (selector de marcador)
  const [selectedMarker, setSelectedMarker] = useState("");

  function toggle(block) {
    setOpen((prev) => ({ ...prev, [block]: !prev[block] }));
  }

  function localVariableOrLocalStorageToken() {
    return localStorage.getItem("galenos_token");
  }

  // =========================
  // CARGA DE DATOS DEL PACIENTE (ROBUSTA)
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

      try {
        // 1) Datos básicos del paciente
        const p = await fetch(`${API}/patients/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!p.ok) {
          console.error("Error HTTP en /patients:", p.status, await p.text());
          setError("No se pudieron cargar los datos básicos del paciente.");
          setLoading(false);
          return;
        }

        const patientData = await p.json();
        setPatient(patientData);
      } catch (err) {
        console.error("Error cargando /patients:", err);
        setError("No se pudieron cargar los datos básicos del paciente.");
        setLoading(false);
        return;
      }

      // 2) El resto no rompe la ficha si falla algo
      try {
        const a = await fetch(`${API}/analytics/by-patient/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (a.ok) {
          setAnalytics(await a.json());
        } else {
          console.error(
            "Error HTTP en /analytics/by-patient:",
            a.status,
            await a.text()
          );
        }
      } catch (err) {
        console.error("Error cargando analytics:", err);
      }

      try {
        const i = await fetch(`${API}/imaging/by-patient/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (i.ok) {
          setImaging(await i.json());
        } else {
          console.error(
            "Error HTTP en /imaging/by-patient:",
            i.status,
            await i.text()
          );
        }
      } catch (err) {
        console.error("Error cargando imaging:", err);
      }

      try {
        const n = await fetch(`${API}/notes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (n.ok) {
          setNotes(await n.json());
        } else {
          console.error("Error HTTP en /notes:", n.status, await n.text());
        }
      } catch (err) {
        console.error("Error cargando notes:", err);
      }

      try {
        const t = await fetch(`${API}/timeline/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (t.ok) {
          setTimeline(await t.json());
        } else {
          console.error("Error cargando timeline:", t.status, await t.text());
        }
      } catch (err) {
        console.error("Error cargando timeline:", err);
      }

      setLoading(false);
    }

    loadAll();
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

  const handleTimelineClick = (item) => {
    setFocusedEvent(item);
    setOpen((prev) => ({
      ...prev,
      timeline: true,
    }));
  };

  const focusedImaging =
    focusedEvent && focusedEvent.item_type === "imaging"
      ? imaging.find((img) => img.id === focusedEvent.item_id)
      : null;

  const focusedAnalytic =
    focusedEvent && focusedEvent.item_type === "analytic"
      ? analytics.find((a) => a.id === focusedEvent.item_id)
      : null;

  const focusedNote =
    focusedEvent && focusedEvent.item_type === "note"
      ? notes.find((n) => n.id === focusedEvent.item_id)
      : null;

  const hasFocusedDetail = focusedImaging || focusedAnalytic || focusedNote;

  // =========================
  // ÍNDICE DE MARCADORES PARA EVOLUCIÓN
  // =========================
  const markerIndex = {};
  analytics.forEach((a) => {
    if (!a || !Array.isArray(a.markers)) return;
    a.markers.forEach((m) => {
      if (!m || !m.name) return;
      const name = m.name;
      if (!markerIndex[name]) {
        markerIndex[name] = [];
      }
      markerIndex[name].push({
        date: a.exam_date || a.created_at,
        value: m.value,
        range: m.range,
        status: m.status,
      });
    });
  });

  const markerNames = Object.keys(markerIndex).sort((a, b) =>
    a.localeCompare(b, "es", { sensitivity: "base" })
  );

  const selectedMarkerSeries = selectedMarker
    ? [...(markerIndex[selectedMarker] || [])].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )
    : [];

  // 👇 Usar patient_number si viene del backend, si no, fallback al id global
  const displayId = patient.patient_number || patient.id;

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
              ID interno: <span className="font-mono">{displayId}</span>
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

      {/* ... EL RESTO DEL FICHERO SE QUEDA IGUAL QUE LO TENÍAS ... */}
      {/* No toco nada más para no alargar aún más el mensaje */}
      
      {/* Aquí seguirían exactamente tus secciones de Datos del paciente, Analíticas,
          Imágenes, Notas clínicas y Timeline tal como las tenías. */}
    </div>
  );
}
