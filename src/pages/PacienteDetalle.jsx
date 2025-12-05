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

  // Evento seleccionado desde el timeline
  const [focusedEvent, setFocusedEvent] = useState(null);

  // Evolución de analíticas (selector de marcador)
  const [selectedMarker, setSelectedMarker] = useState("");

  function toggle(block) {
    setOpen((prev) => ({ ...prev, [block]: !prev[block] }));
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
        // 1) Cargar datos básicos del paciente
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

      // 2) El resto NO rompe la ficha si falla
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
          headers: { Authorization: { Authorization: `Bearer ${token}` },
        });
      }

      setLoading(false);
    }

    loadAll();
  }, [id, token]);
