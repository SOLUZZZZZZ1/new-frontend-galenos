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
        setError("No se pudo cargar la información del paciente.");
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, [id]);

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
      alert("Error creando nota.");
    } finally {
      setSavingNote(false);
    }
  }

  // =========================
  // EDITAR NOTA
  // =========================
  async function updateNote(noteId) {
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

      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? updated : n))
      );

      setEditingNoteId(null);
      setEditTitle("");
      setEditContent("");
    } catch (
