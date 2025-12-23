// src/pages/PacienteDetalle.jsx — FULL (estable) + Comparativas (auto + manual) + UX marcadores
// ✅ Mantiene: Datos paciente (con edición), Analíticas (resumen/diferencial + marcadores), Imágenes, Notas, Timeline
// ✅ Comparativa automática 6/12/18/24 (backend): flechas rojas + delta (Actual − Histórico) + toggle 18/24
// ✅ Comparativa manual (frontend): selecciona baseline + hasta 3 analíticas, delta por celda + Δ máx
// ✅ UX: botón "↑ Ocultar marcadores" al final (cierra y hace scroll suave a la analítica)
// ✅ Fechas: Europe/Madrid (corrige 1h invierno)

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { generatePacientePDFV1 } from "../utils/generatePacientePDF";

const API = import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

function toMadrid(value) {
  if (!value) return "-";
  const iso = typeof value === "string" && value.endsWith("Z") ? value : `${value}Z`;
  try {
    return new Date(iso).toLocaleString("es-ES", { timeZone: "Europe/Madrid" });
  } catch {
    return String(value);
  }
}

function clipText(text, max = 420) {
  const t = (text || "").toString();
  if (t.length <= max) return { short: t, clipped: false };
  return { short: t.slice(0, max) + "…", clipped: true };
}

function fmtDelta(d) {
  if (d == null || Number.isNaN(d)) return null;
  const s = d >= 0 ? `+${d.toFixed(2)}` : d.toFixed(2);
  return s.replace(".", ",");
}

function isCosmeticType(t) {
  return String(t || "").toUpperCase().startsWith("COSMETIC");
}

function cosmeticLabel(t) {
  const u = String(t || "").toUpperCase();
  if (u === "COSMETIC_PRE") return "Antes";
  if (u === "COSMETIC_POST") return "Después";
  if (u === "COSMETIC_FOLLOWUP") return "Seguimiento";
  return u.replace("COSMETIC_", "");
}

function fmtShortDate(v) {
  if (!v) return "—";
  try {
    const d = new Date(String(v));
    if (!isNaN(d.getTime())) return d.toLocaleString("es-ES");
  } catch {}
  return String(v);
}

function normName(s) {
  

async function handleCosDetCompare() {
  setCosDetCompareError("");
  setCosDetCompareResult("");

  if (!token) {
    setCosDetCompareError("Sesión caducada. Vuelve a iniciar sesión.");
    return;
  }
  if (!cosDetPreId || !cosDetPostId) {
    setCosDetCompareError("Selecciona una imagen 'Antes' y una 'Después/Seguimiento'.");
    return;
  }

  try {
    setCosDetCompareLoading(true);
    const formData = new FormData();
    formData.append("pre_image_id", String(cosDetPreId));
    formData.append("post_image_id", String(cosDetPostId));

    const res = await fetch(`${API}/imaging/cosmetic/compare`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const raw = await res.text();
    if (!res.ok) {
      let msg = "No se pudo comparar Antes/Después.";
      try {
        const errData = JSON.parse(raw);
        if (errData.detail) msg = errData.detail;
      } catch {}
      setCosDetCompareError(msg);
      return;
    }

    const data = JSON.parse(raw || "{}");
    setCosDetCompareResult(data.compare_text || "");
  } catch (err) {
    console.error(err);
    setCosDetCompareError("Error de conexión al comparar imágenes.");
  } finally {
    setCosDetCompareLoading(false);
  }
}

async function handleCosDetPdf() {
  setCosDetPdfError("");

  if (!token) {
    setCosDetPdfError("Sesión caducada. Vuelve a iniciar sesión.");
    return;
  }
  if (!cosDetPreId || !cosDetPostId) {
    setCosDetPdfError("Selecciona una imagen 'Antes' y una 'Después/Seguimiento'.");
    return;
  }
  if (!cosDetCompareResult || !cosDetCompareResult.trim()) {
    setCosDetPdfError("Primero genera la comparativa.");
    return;
  }

  try {
    setCosDetPdfLoading(true);
    const payload = {
      pre_image_id: parseInt(cosDetPreId, 10),
      post_image_id: parseInt(cosDetPostId, 10),
      compare_text: cosDetCompareResult,
      note: cosDetNote && cosDetNote.trim() ? cosDetNote.trim() : null,
    };

    const res = await fetch(`${API}/pdf/cosmetic-compare`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const raw = await res.text();
      let msg = "No se pudo generar el PDF.";
      try {
        const errData = JSON.parse(raw);
        if (errData.detail) msg = errData.detail;
      } catch {}
      setCosDetPdfError(msg);
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Galenos_Comparativa_${cosDetPreId}_${cosDetPostId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    setCosDetPdfError("Error de conexión al generar el PDF.");
  } finally {
    setCosDetPdfLoading(false);
  }
}

return (s || "").toString().toLowerCase();
}

// Reglas simples "clínicas" (Capa 1):
// rojo = empeora, verde = mejora, ámbar = cambio incierto, gris = estable
function isWorseDirection(marker, sym) {
  const n = normName(marker);

  // ↓ peor
  const downBad = [
    "filtrat glomerular",
    "estimació filtrat glomerular",
    "aclarament de creatinina",
    "aclarament d'urea",
    "hemoglobina",
    "albúmina",
    "albumina",
    "transferrina",
  ];

  // ↑ peor
  const upBad = [
    "creatinina",
    "urea",
    "colesterol",
    "triglic",
    "hba1c",
    "hemoglobina glicada",
    "parathormona",
    "proteïna c reactiva",
    "proteina c reactiva",
    "pressió parcial co2",
    "co2 total",
    "exces de base",
    "excés de base",
    "sodi",
    "potassi",
    "protein",
    "proteinúria",
    "proteinuria",
    "quocient prote",
    "ldl",
  ];

  const isDownBad = downBad.some((k) => n.includes(k));
  const isUpBad = upBad.some((k) => n.includes(k));

  if (sym === "=") return false;

  if (isDownBad && sym === "↓") return true;
  if (isUpBad && sym === "↑") return true;

  if (isDownBad && sym === "↑") return false;
  if (isUpBad && sym === "↓") return false;

  return null; // incierto
}

function trendClass(marker, sym) {
  if (!sym) return "text-slate-400";
  if (sym === "=") return "text-slate-400 font-medium";

  const worse = isWorseDirection(marker, sym);
  if (worse === true) return "text-red-600 font-semibold";
  if (worse === false) return "text-emerald-700 font-semibold";
  return "text-amber-600 font-semibold";
}

// ========================
// Resumen V2.0 (frontend) + Última revisión (review-state)
// ========================
function pickMostRecentPastKeyFrontend(row) {
  const order = ["6m", "12m", "18m", "24m"];
  for (const k of order) {
    if (row && row[k] != null && row[k] !== "") return k;
  }
  return null;
}

function classifySystemFrontend(markerName) {
  const n = normName(markerName);

  const renal = ["creatinina","urea","filtrat glomerular","filtrado glomerular","aclarament de creatinina","aclarament d'urea","protein","proteinúria","proteinuria","proteïnúria","proteïnùria","quocient prote","densitat","orina"];
  const acid = ["co2","bicarbon","exces de base","excés de base","pressió parcial co2","presión parcial co2","ph "];
  const metab = ["glucosa","hba1c","hemoglobina glicada","colesterol","triglic","ldl","hdl","sodi","potassi","calci","vitamina d","àcid úric","acido uric"];
  const hema = ["hemoglobina","hematòcrit","hematocrit","hematies","leuc","neutr","limf","mon","eosin","basof","basòf","plaquet","ferritina","ferro","transferrina","reticul"];

  if (renal.some((k) => n.includes(k))) return "Renal / Orina";
  if (acid.some((k) => n.includes(k))) return "Ácido–Base / Resp.";
  if (metab.some((k) => n.includes(k))) return "Metabólico / Cardio.";
  if (hema.some((k) => n.includes(k))) return "Hematológico / Hierro";
  return "Otros";
}

function buildResumenV2Frontend(compareObj, stablePct = 2) {
  const markersObj = compareObj?.markers || {};
  const items = [];
  const systems = {};
  let improve = 0, worsen = 0, stable = 0;

  for (const [name, row] of Object.entries(markersObj)) {
    const baseline = row?.baseline;
    const pastKey = pickMostRecentPastKeyFrontend(row);
    if (baseline == null || !pastKey) continue;

    const past = Number(row?.[pastKey]);
    const b = Number(baseline);
    if (!Number.isFinite(past) || !Number.isFinite(b) || past === 0) continue;

    const pct = ((b - past) / past) * 100;
    let cls = "stable";
    if (Math.abs(pct) >= stablePct) cls = pct > 0 ? "improve" : "worsen";

    if (cls === "improve") improve++;
    else if (cls === "worsen") worsen++;
    else stable++;

    items.push({ name, absPct: Math.abs(pct), cls });

    const sys = classifySystemFrontend(name);
    if (!systems[sys]) systems[sys] = { improve: 0, worsen: 0, stable: 0, total: 0 };
    systems[sys].total++;
    systems[sys][cls]++;
  }

  const topWorsen = items.filter((x) => x.cls === "worsen").sort((a,b)=>b.absPct-a.absPct).slice(0,3).map((x)=>x.name);
  const topImprove = items.filter((x) => x.cls === "improve").sort((a,b)=>b.absPct-a.absPct).slice(0,3).map((x)=>x.name);

  const systemRows = Object.entries(systems).map(([sys, s]) => {
    let label = "sin cambios";
    if (s.improve >= 1 && s.worsen >= 1) label = "mixto / a vigilar";
    else if (s.worsen >= 2 && s.worsen > s.improve) label = "cambios relevantes";
    else if (s.improve >= 2 && s.improve > s.worsen) label = "mejoría global";
    return { sys, label, ...s };
  });

  const order = ["Renal / Orina", "Ácido–Base / Resp.", "Metabólico / Cardio.", "Hematológico / Hierro", "Otros"];
  systemRows.sort((a, b) => order.indexOf(a.sys) - order.indexOf(b.sys));

  return { hasData: items.length > 0, totals: { total: items.length, improve, worsen, stable, stablePct }, topWorsen, topImprove, systemRows };
}

function badgeClass(label) {
  if (label.includes("cambios")) return "bg-rose-50 text-rose-700 border-rose-200";
  if (label.includes("mejoría")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (label.includes("mixto")) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
}

function computeSinceReviewChanges(baseMarkers = [], refMarkers = []) {
  const toMap = (arr) => {
    const out = {};
    for (const m of (arr || [])) {
      const name = (m?.name || "").toString().trim();
      const v = Number(m?.value);
      if (!name || !Number.isFinite(v)) continue;
      out[name] = v;
    }
    return out;
  };

  const base = toMap(baseMarkers);
  const ref = toMap(refMarkers);

  const rows = [];
  for (const [name, vBase] of Object.entries(base)) {
    if (!(name in ref)) continue;
    const vRef = ref[name];
    const delta = vBase - vRef;
    rows.push({ name, delta, abs: Math.abs(delta) });
  }

  rows.sort((a, b) => b.abs - a.abs);
  return rows.slice(0, 5);
}

function changeLabel(delta, eps = 0.000001) {
  if (delta > eps) return "mejora";
  if (delta < -eps) return "empeora";
  return "estable";
}

function changeBadgeClass(label) {
  if (label === "empeora") return "bg-rose-50 text-rose-700 border-rose-200";
  if (label === "mejora") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
}


export default function PacienteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("galenos_token");

  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState("");

  const [analytics, setAnalytics] = useState([]);
  const [analyticsError, setAnalyticsError] = useState("");

  const [imaging, setImaging] = useState([]);

// ========================
// PacienteDetalle — Comparativa quirúrgica + PDF (solo consulta)
// ========================
const [cosDetPreId, setCosDetPreId] = useState("");
const [cosDetPostId, setCosDetPostId] = useState("");
const [cosDetCompareLoading, setCosDetCompareLoading] = useState(false);
const [cosDetCompareError, setCosDetCompareError] = useState("");
const [cosDetCompareResult, setCosDetCompareResult] = useState("");
const [cosDetPdfLoading, setCosDetPdfLoading] = useState(false);
const [cosDetPdfError, setCosDetPdfError] = useState("");
const [cosDetNote, setCosDetNote] = useState("");

  const [imagingError, setImagingError] = useState("");

  const [notes, setNotes] = useState([]);
  const [timeline, setTimeline] = useState([]);

  const [open, setOpen] = useState({
    datos: true,
    analiticas: true,
    imagenes: true,
    notas: true,
    timeline: true,
  });

  // Editar paciente
  const [editing, setEditing] = useState(false);
  const [editAlias, setEditAlias] = useState("");
  const [editAge, setEditAge] = useState("");
  const [editGender, setEditGender] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [savingPatient, setSavingPatient] = useState(false);
  const [patientSaveError, setPatientSaveError] = useState("");

  // Notas
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteError, setNoteError] = useState("");

  // Marcadores por analítica
  const [markersLoading, setMarkersLoading] = useState({});
  const [markersError, setMarkersError] = useState({});
  const [markersCache, setMarkersCache] = useState({});
  const [markersOpen, setMarkersOpen] = useState({});

  // Expandir textos
  const [expandedText, setExpandedText] = useState({});

  // Imágenes preview
  const [showImagePreview, setShowImagePreview] = useState({});

  // Comparativa automática
  const [compare, setCompare] = useState(null);
const [reviewState, setReviewState] = useState(null);
const [reviewStateError, setReviewStateError] = useState("");
const [reviewSaving, setReviewSaving] = useState(false);
const [sinceChanges, setSinceChanges] = useState([]);
const [sinceChangesError, setSinceChangesError] = useState("");
  const [compareError, setCompareError] = useState("");
  const [showLongWindows, setShowLongWindows] = useState(false);
  const [showCompareHelp, setShowCompareHelp] = useState(false);

  // Comparativa manual
  const [manualMode, setManualMode] = useState(false);
  const [manualBaselineId, setManualBaselineId] = useState(null);
  const [manualCompareIds, setManualCompareIds] = useState([]);

  function toggleBlock(block) {
    setOpen((prev) => ({ ...prev, [block]: !prev[block] }));
  }

  function toggleExpanded(key) {
    setExpandedText((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function loadAll() {
    setLoading(true);
    setError("");
    setAnalyticsError("");
    setImagingError("");
    setCompareError("");

    if (!id || !token) {
      setLoading(false);
      setError("Falta identificador de paciente o token.");
      return;
    }

    try {
      // Paciente
      const resP = await fetch(`${API}/patients/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const rawP = await resP.text();
      if (!resP.ok) throw new Error("patient");
      const p = JSON.parse(rawP);
      setPatient(p);
      setEditAlias(p.alias || "");
      setEditAge(p.age != null ? String(p.age) : "");
      setEditGender(p.gender || "");
      setEditNotes(p.notes || "");

      // Analíticas
      const resA = await fetch(`${API}/analytics/by-patient/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const rawA = await resA.text();
      if (resA.ok) {
        const arr = JSON.parse(rawA || "[]") || [];
        setAnalytics(arr);
        if (manualBaselineId == null && arr.length > 0) setManualBaselineId(arr[0].id);
      } else {
        setAnalyticsError("No se pudieron cargar las analíticas.");
      }

      // Comparativa automática
      const resC = await fetch(`${API}/analytics/compare/by-patient/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const rawC = await resC.text();
      if (resC.ok) setCompare(JSON.parse(rawC));
      else setCompareError("No se pudo cargar la comparativa de analíticas.");

      // Imágenes
      const resI = await fetch(`${API}/imaging/by-patient/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const rawI = await resI.text();
      if (resI.ok) setImaging(JSON.parse(rawI || "[]") || []);
      else setImagingError("No se pudieron cargar las imágenes.");

      // Notas
      const resN = await fetch(`${API}/notes/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const rawN = await resN.text();
      if (resN.ok) setNotes(JSON.parse(rawN || "[]") || []);

      // Timeline
      const resT = await fetch(`${API}/timeline/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const rawT = await resT.text();
      if (resT.ok) setTimeline(JSON.parse(rawT || "[]") || []);
    } catch (e) {
      setError("Error cargando la ficha del paciente.");
    } finally {
      setLoading(false);
    }
  }

async function loadReviewState() {
  setReviewStateError("");
  if (!id || !token) return;
  try {
    const res = await fetch(`${API}/patients/${id}/review-state`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const raw = await res.text();
    if (!res.ok) throw new Error(raw);
    setReviewState(JSON.parse(raw));
  } catch {
    setReviewStateError("No se pudo cargar el estado de revisión.");
    setReviewState(null);
  }
}

async function markAsReviewed() {
  if (!id || !token) return;
  setReviewSaving(true);
  setReviewStateError("");
  try {
    const latest = (analytics || [])
      .slice()
      .sort((a, b) => String(b.exam_date || b.created_at || "").localeCompare(String(a.exam_date || a.created_at || "")))[0];

    const latestId = latest?.id ?? null;

    const res = await fetch(`${API}/patients/${id}/review-state`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ last_reviewed_analytic_id: latestId }),
    });
    const raw = await res.text();
    if (!res.ok) throw new Error(raw);
    setReviewState(JSON.parse(raw));
    setSinceChanges([]);
  } catch {
    setReviewStateError("No se pudo marcar como revisado.");
  } finally {
    setReviewSaving(false);
  }
}

async function computeChangesSinceReview() {
  setSinceChangesError("");
  setSinceChanges([]);

  try {
    if (!reviewState?.last_reviewed_analytic_id) return;
    const reviewedId = Number(reviewState.last_reviewed_analytic_id);
    if (!reviewedId) return;

    const latest = (analytics || [])
      .slice()
      .sort((a, b) => String(b.exam_date || b.created_at || "").localeCompare(String(a.exam_date || a.created_at || "")))[0];

    const latestId = latest?.id ?? null;
    if (!latestId || latestId === reviewedId) return;

    const ensureMarkers = async (aid) => {
      const cached = Array.isArray(markersCache[aid]) ? markersCache[aid] : null;
      if (cached) return cached;

      const res = await fetch(`${API}/analytics/markers/${aid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const raw = await res.text();
      if (!res.ok) throw new Error(raw);
      const data = JSON.parse(raw);
      const markers = Array.isArray(data.markers) ? data.markers : [];
      setMarkersCache((prev) => ({ ...prev, [aid]: markers }));
      return markers;
    };

    const baseMarkers = await ensureMarkers(latestId);
    const refMarkers = await ensureMarkers(reviewedId);

    setSinceChanges(computeSinceReviewChanges(baseMarkers, refMarkers));
  } catch {
    setSinceChangesError("No se pudieron calcular los cambios desde la última revisión.");
  }
}


  useEffect(() => {
    loadAll();
    loadReviewState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);



// Preselección automática (quirúrgicas): más antiguo PRE + más reciente POST/FOLLOWUP
useEffect(() => {
  try {
    const cos = (imaging || []).filter((x) => isCosmeticType(x.type));
    const pre = cos.filter((x) => String(x.type || "").toUpperCase() === "COSMETIC_PRE");
    const post = cos.filter((x) => {
      const t = String(x.type || "").toUpperCase();
      return t === "COSMETIC_POST" || t === "COSMETIC_FOLLOWUP";
    });

    const key = (it) => String(it.exam_date || it.created_at || "");
    pre.sort((a, b) => key(a).localeCompare(key(b)));
    post.sort((a, b) => key(b).localeCompare(key(a)));

    if (!cosDetPreId && pre[0]?.id) setCosDetPreId(String(pre[0].id));
    if (!cosDetPostId && post[0]?.id) setCosDetPostId(String(post[0].id));
  } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [imaging]);
useEffect(() => {
  computeChangesSinceReview();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [reviewState, analytics]);

  useEffect(() => {
    if (manualBaselineId == null) {
      const autoId = compare?.baseline?.analytic_id ?? null;
      if (autoId) setManualBaselineId(autoId);
    }
  }, [compare, manualBaselineId]);

  async function handleSavePatient(e) {
    e.preventDefault();
    setPatientSaveError("");

    const ageNumber = editAge.trim() === "" ? null : Number.parseInt(editAge.trim(), 10);
    if (editAge.trim() !== "" && Number.isNaN(ageNumber)) {
      setPatientSaveError("La edad debe ser un número.");
      return;
    }

    const payload = { alias: editAlias.trim() || null, age: ageNumber, gender: editGender.trim() || null, notes: editNotes.trim() || null };

    try {
      setSavingPatient(true);
      const res = await fetch(`${API}/patients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const raw = await res.text();
      if (!res.ok) throw new Error(raw);
      const data = JSON.parse(raw);
      setPatient(data);
      setEditing(false);
    } catch {
      setPatientSaveError("No se han podido guardar los cambios.");
    } finally {
      setSavingPatient(false);
    }
  }

  async function handleCreateNote(e) {
    e.preventDefault();
    setNoteError("");
    if (!newNoteTitle.trim()) return setNoteError("Escribe un título.");
    if (!newNoteContent.trim()) return setNoteError("Escribe el contenido.");

    try {
      setNoteSaving(true);
      const res = await fetch(`${API}/notes/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: newNoteTitle.trim(), content: newNoteContent.trim() }),
      });
      const raw = await res.text();
      if (!res.ok) throw new Error(raw);
      const data = JSON.parse(raw);
      setNotes((prev) => [data, ...prev]);
      setNewNoteTitle("");
      setNewNoteContent("");
    } catch {
      setNoteError("No se pudo guardar la nota.");
    } finally {
      setNoteSaving(false);
    }
  }

  async function fetchMarkersForAnalytic(analyticId) {
    const aid = Number(analyticId);
    if (!aid || Number.isNaN(aid)) return;

    setMarkersOpen((prev) => ({ ...prev, [aid]: !prev[aid] }));
    if (Array.isArray(markersCache[aid])) return;

    setMarkersError((prev) => ({ ...prev, [aid]: "" }));
    setMarkersLoading((prev) => ({ ...prev, [aid]: true }));

    try {
      const res = await fetch(`${API}/analytics/markers/${aid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const raw = await res.text();
      if (!res.ok) throw new Error(raw);
      const data = JSON.parse(raw);
      const markers = Array.isArray(data.markers) ? data.markers : [];
      setMarkersCache((prev) => ({ ...prev, [aid]: markers }));
    } catch {
      setMarkersError((prev) => ({ ...prev, [aid]: "Error cargando marcadores." }));
    } finally {
      setMarkersLoading((prev) => ({ ...prev, [aid]: false }));
    }
  }

  const manualComparison = useMemo(() => {
    if (!manualMode || !manualBaselineId) return null;
    const base = (analytics || []).find((a) => a.id === manualBaselineId);
    if (!base) return null;

    const picks = (manualCompareIds || [])
      .map((pid) => (analytics || []).find((a) => a.id === pid))
      .filter(Boolean)
      .slice(0, 3);

    const mapFromAnalytic = (a) => {
      const out = {};
      const ms = Array.isArray(a?.markers) ? a.markers : [];
      for (const m of ms) {
        const name = (m?.name || "").toString().trim();
        const val = m?.value;
        if (!name || val == null) continue;
        const fv = Number(val);
        if (Number.isNaN(fv)) continue;
        out[name] = fv;
      }
      return out;
    };

    const baseMarkers = mapFromAnalytic(base);
    const pickMarkers = picks.map(mapFromAnalytic);

    const allNames = new Set(Object.keys(baseMarkers));
    for (const pm of pickMarkers) Object.keys(pm).forEach((k) => allNames.add(k));

    const threshold = 0.05;

    const rows = Array.from(allNames).sort().map((name) => {
      const b = baseMarkers[name];
      const comps = pickMarkers.map((pm) => pm[name]);
      const deltas = comps.map((v) => (b == null || v == null ? null : (v - b)));
      const trend = comps.map((v) => {
        if (b == null || v == null) return null;
        if (v === 0) return "=";
        const pct = (b - v) / Math.abs(v);
        if (Math.abs(pct) < threshold) return "=";
        return pct > 0 ? "↑" : "↓";
      });
      const nonNull = deltas.filter((d) => d != null);
      const maxAbs = nonNull.length ? nonNull.reduce((acc, d) => (Math.abs(d) > Math.abs(acc) ? d : acc), nonNull[0]) : null;
      return { name, baseline: b, comps, deltas, trend, maxAbs };
    });

    return { baseline: base, picks, rows };
  }, [manualMode, manualBaselineId, manualCompareIds, analytics]);

  const timelineLabel = (itemType) => {
    if (itemType === "imaging") return "imagen médica";
    if (itemType === "analytic") return "analítica";
    if (itemType === "note") return "nota clínica";
    if (itemType === "patient") return "alta de paciente";
    return "evento";
  };

  const sortedTimeline = useMemo(() => {
    return [...timeline].sort((a, b) => new Date(`${b.created_at}Z`).getTime() - new Date(`${a.created_at}Z`).getTime());
  }, [timeline]);

  if (loading) return <div className="sr-container py-8"><p className="text-slate-600">Cargando ficha del paciente...</p></div>;
  if (error) return <div className="sr-container py-8"><p className="text-red-600">{error}</p></div>;
  if (!patient) return <div className="sr-container py-8"><p className="text-slate-600">Paciente no encontrado.</p></div>;

  return (
    <div className="sr-container py-6 space-y-6">
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Paciente: {patient.alias}</h1>
            <p className="text-sm text-slate-500 mt-1">
              Nº Paciente: <span className="font-mono">{patient.patient_number ?? "—"}</span> · ID interno:{" "}
              <span className="font-mono">{patient.id}</span> · Alta: {patient.created_at ? toMadrid(patient.created_at) : "-"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-end">
            <button
              type="button"
              onClick={() => generatePacientePDFV1({ patient, compare, analytics, notes })}
              disabled={!compare || !analytics || analytics.length === 0}
              className="sr-btn-primary text-xs sm:text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              title={!compare ? "Cargando comparativa..." : "Descargar PDF con comparativa, resumen IA y notas"}
            >
              Descargar PDF
            </button>

            <button type="button" onClick={() => navigate("/dashboard")} className="sr-btn-secondary text-xs sm:text-sm">Volver al dashboard</button>
            <button type="button" onClick={() => navigate("/pacientes")} className="sr-btn-secondary text-xs sm:text-sm">Volver a pacientes</button>
          </div>

<div className="mt-3 w-full sm:w-[380px] border border-slate-200 rounded-lg bg-slate-50/60 p-3">
  <div className="flex items-center justify-between gap-2">
    <h3 className="text-sm font-semibold text-slate-900">🩺 Resumen clínico rápido</h3>
    <span className="text-[10px] px-2 py-0.5 rounded-full border border-slate-200 bg-white text-slate-600">V2.0</span>
  </div>

  {(() => {
    const v2 = buildResumenV2Frontend(compare, 2);
    if (!compare || !v2.hasData) {
      return <p className="text-xs text-slate-600 mt-2">Cargando comparativa…</p>;
    }

    return (
      <div className="mt-2 space-y-3 text-xs text-slate-800">
        <div>
          <p className="font-semibold text-slate-700">🔴 Prioridades clínicas</p>
          <p className="mt-1">
            {v2.topWorsen.length ? v2.topWorsen.join(" · ") : "Sin prioridades detectadas"}
          </p>
        </div>

        <div>
          <p className="font-semibold text-slate-700">🧠 Sistemas</p>
          <div className="mt-1 space-y-1">
            {v2.systemRows.slice(0, 4).map((r) => (
              <div key={r.sys} className="flex items-center justify-between gap-2">
                <span className="text-slate-700">{r.sys}</span>
                <span className={`px-2 py-0.5 rounded-full border ${badgeClass(r.label)}`}>{r.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="font-semibold text-slate-700">🔁 Cambios desde tu última revisión</p>

          {!reviewState?.last_reviewed_analytic_id ? (
            <p className="mt-1 text-slate-600">Sin revisión previa registrada.</p>
          ) : sinceChangesError ? (
            <p className="mt-1 text-rose-700">{sinceChangesError}</p>
          ) : sinceChanges.length === 0 ? (
            <p className="mt-1 text-slate-600">Sin cambios destacados desde la última revisión.</p>
          ) : (
            <div className="mt-1 space-y-1">
              {sinceChanges.map((c) => {
                const lbl = changeLabel(c.delta);
                return (
                  <div key={c.name} className="flex items-center justify-between gap-2">
                    <span className="text-slate-700 truncate" title={c.name}>{c.name}</span>
                    <span className={`px-2 py-0.5 rounded-full border ${changeBadgeClass(lbl)}`}>
                      {lbl} ({fmtDelta(c.delta)})
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {reviewStateError && <p className="mt-1 text-rose-700">{reviewStateError}</p>}

          <button
            type="button"
            onClick={markAsReviewed}
            disabled={reviewSaving || !analytics || analytics.length === 0}
            className="sr-btn-secondary text-xs mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            title="Guarda la analítica más reciente como tu punto de revisión"
          >
            {reviewSaving ? "Marcando..." : "Marcar como revisado"}
          </button>
        </div>

        <div>
          <p className="font-semibold text-slate-700">📈 Tendencia global</p>
          <p className="mt-1 text-slate-700">
            <span className="font-medium">{v2.totals.total}</span> eval ·{" "}
            <span className="text-emerald-700 font-medium">{v2.totals.improve}</span> mejoran ·{" "}
            <span className="text-rose-700 font-medium">{v2.totals.worsen}</span> empeoran ·{" "}
            <span className="text-slate-600 font-medium">{v2.totals.stable}</span> estables
          </p>
        </div>

        <p className="text-[10px] text-slate-500">
          Documento de apoyo a la deliberación clínica. La decisión final corresponde al profesional sanitario responsable.
        </p>
      </div>
    );
  })()}
</div>

        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
        <button type="button" onClick={() => toggleBlock("datos")} className="flex items-center justify-between w-full text-left">
          <h2 className="text-lg font-semibold">Datos del paciente</h2>
          <span className="text-xs text-slate-500">{open.datos ? "Ocultar" : "Mostrar"}</span>
        </button>

        {open.datos && (
          <div className="mt-3 space-y-3 text-sm text-slate-700">
            {!editing ? (
              <>
                <p><strong>Alias:</strong> {patient.alias}</p>
                <p><strong>Edad:</strong> {patient.age != null ? `${patient.age} años` : "—"}</p>
                <p><strong>Sexo:</strong> {patient.gender || "—"}</p>
                <p><strong>Notas internas:</strong> {patient.notes || "—"}</p>
                <button type="button" onClick={() => setEditing(true)} className="sr-btn-secondary text-xs mt-2">Editar datos</button>
              </>
            ) : (
              <form onSubmit={handleSavePatient} className="space-y-2">
                <div>
                  <label className="sr-label">Alias</label>
                  <input type="text" className="sr-input w-full" value={editAlias} onChange={(e) => setEditAlias(e.target.value)} />
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  <div>
                    <label className="sr-label">Edad</label>
                    <input type="number" className="sr-input w-full" value={editAge} onChange={(e) => setEditAge(e.target.value)} min={0} />
                  </div>
                  <div>
                    <label className="sr-label">Sexo</label>
                    <input type="text" className="sr-input w-full" value={editGender} onChange={(e) => setEditGender(e.target.value)} placeholder="Ej. Mujer / Varón" />
                  </div>
                </div>
                <div>
                  <label className="sr-label">Notas internas</label>
                  <textarea className="sr-input w-full min-h-[80px]" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
                </div>
                {patientSaveError && <p className="text-xs text-red-600">{patientSaveError}</p>}
                <div className="flex gap-2 mt-2">
                  <button type="submit" disabled={savingPatient} className="sr-btn-primary text-xs disabled:opacity-60">
                    {savingPatient ? "Guardando..." : "Guardar cambios"}
                  </button>
                  <button type="button" onClick={() => setEditing(false)} className="sr-btn-secondary text-xs">Cancelar</button>
                </div>
              </form>
            )}
          </div>
        )}
      </section>

      {/* Interpretación de comparativas (UX visible entre Datos y Analíticas) */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
        <button
          type="button"
          onClick={() => setShowCompareHelp((v) => !v)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2">
            <span className="text-slate-500">{showCompareHelp ? "▾" : "▸"}</span>
            <h2 className="text-lg font-semibold">
              {showCompareHelp ? "Ocultar interpretación" : "Cómo interpretar la comparativa"}
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            {showCompareHelp ? "Clic para cerrar" : "Clic para abrir"}
          </span>
        </button>

        {showCompareHelp && (
          <div className="mt-3 border border-slate-200 rounded-lg bg-sky-50 p-4 space-y-2 text-sm text-slate-800 border-l-4 border-sky-400">
            <p className="font-semibold text-slate-900">
              Esta explicación se aplica a la tabla de comparativas que aparece justo debajo.
            </p>

            <p>
              <strong>Baseline</strong> es la analítica de referencia (automática o la que elijas en modo manual).
              Las columnas muestran valores históricos cercanos a esas fechas.
            </p>

            <ul className="list-disc list-inside space-y-1">
              <li><span className="text-red-600 font-semibold">Rojo</span>: cambio desfavorable (empeora) según reglas clínicas básicas.</li>
              <li><span className="text-emerald-700 font-semibold">Verde</span>: cambio favorable (mejora).</li>
              <li><span className="text-amber-600 font-semibold">Ámbar</span>: cambio detectado, pero interpretación incierta o marcador no reconocido.</li>
              <li><span className="text-slate-400 font-medium">Gris</span>: estable (sin cambio relevante).</li>
            </ul>

            <p>
              <strong>Δ</strong> (entre paréntesis) indica la variación numérica. En automático: Δ = (Actual − Histórico).
              En manual: Δ = (Comparado − Baseline).
            </p>

            <p className="text-xs text-slate-600">
              Nota: Galenos.pro no diagnostica ni prescribe. Esta comparativa es una ayuda visual; la interpretación final corresponde al médico.
            </p>
          </div>
        )}
      </section>

      {/* RESTO DEL ARCHIVO: se mantiene exactamente como lo tenías (Analíticas, Imágenes, Notas, Timeline) */}
      {/* ------------------------------------------------------------------------ */}
      {/* Desde aquí en adelante tu archivo original sigue igual. */}
      {/* ------------------------------------------------------------------------ */}

      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
        <button type="button" onClick={() => toggleBlock("analiticas")} className="flex items-center justify-between w-full text-left">
          <h2 className="text-lg font-semibold">Analíticas</h2>
          <span className="text-xs text-slate-500">{open.analiticas ? "Ocultar" : "Mostrar"}</span>
        </button>

        {open.analiticas && (
          <div className="mt-3 space-y-3">
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/60 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h3 className="text-sm font-semibold">Comparativa de marcadores</h3>
                <div className="flex gap-2 flex-wrap">
                  <button type="button" onClick={() => setShowLongWindows((v) => !v)} className="sr-btn-secondary text-xs">
                    {showLongWindows ? "Ver solo 6/12" : "Ver 18/24"}
                  </button>
                  <button type="button" onClick={() => setManualMode((v) => !v)} className="sr-btn-secondary text-xs">
                    {manualMode ? "Modo automático" : "Modo manual"}
                  </button>
                </div>
              </div>

              {manualMode ? (
                <>
                  <div className="border border-slate-200 rounded-md bg-white p-2 space-y-2">
                    <p className="text-[11px] text-slate-600">Selecciona baseline y hasta 3 analíticas para comparar.</p>
                    <div className="grid md:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-slate-600 font-medium">Baseline</label>
                        <select
                          className="sr-input w-full text-xs"
                          value={manualBaselineId ?? ""}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            setManualBaselineId(Number.isNaN(v) ? null : v);
                            setManualCompareIds((prev) => prev.filter((x) => x !== v));
                          }}
                        >
                          {(analytics || [])
                            .slice()
                            .sort((a, b) => String(b.exam_date || b.created_at || "").localeCompare(String(a.exam_date || a.created_at || "")))
                            .map((a) => (
                              <option key={a.id} value={a.id}>ID {a.id} · {toMadrid(a.exam_date || a.created_at)}</option>
                            ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-600 font-medium">Comparar con (máx 3)</label>
                        <div className="max-h-[140px] overflow-y-auto border border-slate-200 rounded-md p-2 space-y-1">
                          {(analytics || [])
                            .filter((a) => a.id !== manualBaselineId)
                            .slice()
                            .sort((a, b) => String(b.exam_date || b.created_at || "").localeCompare(String(a.exam_date || a.created_at || "")))
                            .map((a) => {
                              const checked = manualCompareIds.includes(a.id);
                              const disabled = !checked && manualCompareIds.length >= 3;
                              return (
                                <label key={a.id} className={`flex items-center gap-2 text-[11px] ${disabled ? "opacity-50" : ""}`}>
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    disabled={disabled}
                                    onChange={() => {
                                      setManualCompareIds((prev) => {
                                        if (prev.includes(a.id)) return prev.filter((x) => x !== a.id);
                                        if (prev.length >= 3) return prev;
                                        return [...prev, a.id];
                                      });
                                    }}
                                  />
                                  <span>ID {a.id} · {toMadrid(a.exam_date || a.created_at)}</span>
                                </label>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {manualComparison && (
                    <>
                      <p className="text-[11px] text-slate-600">
                        Baseline manual: {toMadrid(manualComparison.baseline.exam_date || manualComparison.baseline.created_at)} · Analítica ID {manualComparison.baseline.id}
                      </p>

                      <div className="overflow-x-auto">
                        <table className="min-w-full text-xs border border-slate-200 rounded-md overflow-hidden bg-white">
                          <thead className="bg-slate-100">
                            <tr>
                              <th className="px-2 py-1 text-left">Marcador</th>
                              <th className="px-2 py-1 text-left">Baseline</th>
                              {manualComparison.picks.map((p, idx) => (
                                <th key={idx} className="px-2 py-1 text-left">{idx + 1} · {toMadrid(p.exam_date || p.created_at)}</th>
                              ))}
                              <th className="px-2 py-1 text-left">Δ máx</th>
                            </tr>
                          </thead>
                          <tbody>
                            {manualComparison.rows.map((r) => (
                              <tr key={r.name} className="border-t border-slate-200">
                                <td className="px-2 py-1 font-medium text-slate-900">{r.name}</td>
                                <td className="px-2 py-1">{r.baseline ?? "—"}</td>
                                {r.comps.map((v, idx) => {
                                  const sym = r.trend[idx];
                                  const d = r.deltas[idx];
                                  const cls = trendClass(r.name, sym);
                                  return (
                                    <td key={idx} className="px-2 py-1">
                                      {v ?? "—"} {sym ? <span className={`ml-1 ${cls}`}>{sym}</span> : null}
                                      {d != null ? <span className={`ml-2 ${cls}`}>({fmtDelta(d)})</span> : null}
                                    </td>
                                  );
                                })}
                                <td className="px-2 py-1">
                                  {r.maxAbs == null ? <span className="text-slate-400">—</span> : <span className="text-red-600 font-semibold">{fmtDelta(r.maxAbs)}</span>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <p className="text-[11px] text-slate-500">Modo manual: Δ = (comparado − baseline). Δ máx = mayor cambio absoluto.</p>
                    </>
                  )}
                </>
              ) : (
                <>
                  {compareError && <p className="text-xs text-red-600">{compareError}</p>}

                  {compare && compare.baseline && (
                    <>
                      <p className="text-[11px] text-slate-600">Baseline: {compare.baseline.date} · Analítica ID {compare.baseline.analytic_id}</p>

                      <div className="overflow-x-auto">
                        <table className="min-w-full text-xs border border-slate-200 rounded-md overflow-hidden bg-white">
                          <thead className="bg-slate-100">
                            <tr>
                              <th className="px-2 py-1 text-left">Marcador</th>
                              <th className="px-2 py-1 text-left">Actual</th>
                              <th className="px-2 py-1 text-left">6m</th>
                              <th className="px-2 py-1 text-left">12m</th>
                              {showLongWindows && (
                                <>
                                  <th className="px-2 py-1 text-left">18m</th>
                                  <th className="px-2 py-1 text-left">24m</th>
                                </>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(compare.markers || {}).map(([name, row]) => {
                              const tr = row?.trend || {};
                              const b = row?.baseline;

                              const cell = (k) => {
                                const vPast = row?.[k];
                                const sym = tr[k];
                                const cls = trendClass(name, sym);
                                const delta = (vPast == null || b == null) ? null : (b - vPast); // Actual − Hist
                                return (
                                  <span>
                                    {vPast ?? "—"} {sym ? <span className={`ml-1 ${cls}`}>{sym}</span> : null}
                                    {delta != null ? <span className={`ml-2 ${cls}`}>({fmtDelta(delta)})</span> : null}
                                  </span>
                                );
                              };

                              return (
                                <tr key={name} className="border-t border-slate-200">
                                  <td className="px-2 py-1 font-medium text-slate-900">{name}</td>
                                  <td className="px-2 py-1">{b ?? "—"}</td>
                                  <td className="px-2 py-1">{cell("6m")}</td>
                                  <td className="px-2 py-1">{cell("12m")}</td>
                                  {showLongWindows && (
                                    <>
                                      <td className="px-2 py-1">{cell("18m")}</td>
                                      <td className="px-2 py-1">{cell("24m")}</td>
                                    </>
                                  )}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <p className="text-[11px] text-slate-500">Δ en paréntesis = (Actual − Histórico). Colores: rojo=empeora, verde=mejora, ámbar=incierto, gris=estable.</p>
                    </>
                  )}
                </>
              )}
            </div>

            {analyticsError && <p className="text-sm text-red-600">{analyticsError}</p>}

            {!analyticsError && analytics.length === 0 ? (
              <p className="text-sm text-slate-500">No hay analíticas registradas para este paciente.</p>
            ) : (
              analytics.map((a) => {
                const sum = (a.summary || "").toString();
                const diff = (a.differential || "").toString();
                const sumClip = clipText(sum, 420);
                const diffClip = clipText(diff, 420);

                const directMarkers = Array.isArray(a.markers) ? a.markers : [];
                const cachedMarkers = Array.isArray(markersCache[a.id]) ? markersCache[a.id] : [];
                const markersToShow = directMarkers.length > 0 ? directMarkers : cachedMarkers;

                return (
                  <article id={`analytic-${a.id}`} key={a.id} className="border border-slate-200 rounded-lg p-3 space-y-2">
                    <p className="text-xs text-slate-500">Fecha: {toMadrid(a.exam_date || a.created_at)} · ID {a.id}</p>

                    {sum && (
                      <div>
                        <h3 className="text-sm font-semibold mb-1">Resumen</h3>
                        <p className="text-sm whitespace-pre-line">{expandedText[`a_sum_${a.id}`] ? sum : sumClip.short}</p>
                        {sumClip.clipped && (
                          <button type="button" onClick={() => toggleExpanded(`a_sum_${a.id}`)} className="text-xs text-sky-700 hover:underline mt-1">
                            {expandedText[`a_sum_${a.id}`] ? "Ver menos" : "Ver más"}
                          </button>
                        )}
                      </div>
                    )}

                    {diff && (
                      <div>
                        <h3 className="text-sm font-semibold mb-1">Diagnóstico diferencial</h3>
                        <p className="text-sm whitespace-pre-line">{expandedText[`a_diff_${a.id}`] ? diff : diffClip.short}</p>
                        {diffClip.clipped && (
                          <button type="button" onClick={() => toggleExpanded(`a_diff_${a.id}`)} className="text-xs text-sky-700 hover:underline mt-1">
                            {expandedText[`a_diff_${a.id}`] ? "Ver menos" : "Ver más"}
                          </button>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button type="button" onClick={() => fetchMarkersForAnalytic(a.id)} className="sr-btn-secondary text-xs">
                        {markersOpen[a.id] ? "Ocultar marcadores" : "Ver marcadores"}
                      </button>
                      {directMarkers.length === 0 && <span className="text-[11px] text-slate-500">(Si no venían, se cargan bajo demanda.)</span>}
                    </div>

                    {markersOpen[a.id] && (
                      <div className="mt-2 border-t border-slate-200 pt-2 space-y-2">
                        {markersLoading[a.id] && <p className="text-xs text-slate-500">Cargando marcadores…</p>}
                        {markersError[a.id] && <p className="text-xs text-red-600">{markersError[a.id]}</p>}

                        {markersToShow.length > 0 && (
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
                                {markersToShow.map((m, idx) => (
                                  <tr key={idx} className="border-t border-slate-200">
                                    <td className="px-2 py-1">{m.name || ""}</td>
                                    <td className="px-2 py-1">{m.value != null ? String(m.value) : ""}</td>
                                    <td className="px-2 py-1">{m.range || ""}</td>
                                    <td className="px-2 py-1">
                                      {m.status === "elevado" && <span className="text-red-600 font-medium">Alto</span>}
                                      {m.status === "bajo" && <span className="text-amber-600 font-medium">Bajo</span>}
                                      {m.status === "normal" && <span className="text-emerald-700 font-medium">Normal</span>}
                                      {!m.status && <span className="text-slate-500">—</span>}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {markersToShow.length === 0 && !markersLoading[a.id] && !markersError[a.id] && (
                          <p className="text-xs text-slate-500">No hay marcadores guardados para esta analítica.</p>
                        )}

                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setMarkersOpen((prev) => ({ ...prev, [a.id]: false }));
                              setTimeout(() => {
                                const el = document.getElementById(`analytic-${a.id}`);
                                if (el && el.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "start" });
                              }, 60);
                            }}
                            className="sr-btn-secondary text-xs"
                          >
                            ↑ Ocultar marcadores
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        )}
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
        <button type="button" onClick={() => toggleBlock("imagenes")} className="flex items-center justify-between w-full text-left">
          <h2 className="text-lg font-semibold">Imágenes médicas</h2>
          <span className="text-xs text-slate-500">{open.imagenes ? "Ocultar" : "Mostrar"}</span>
        </button>

        {open.imagenes && (
          <div className="mt-3 space-y-3">
            {imagingError && <p className="text-sm text-red-600">{imagingError}</p>}
            {!imagingError && imaging.length === 0 ? (
              <p className="text-sm text-slate-500">No hay imágenes registradas para este paciente.</p>
            ) : (
              imaging.map((img) => {
                const sum = (img.summary || "").toString();
                const diff = (img.differential || "").toString();
                const patterns = Array.isArray(img.patterns) ? img.patterns : [];
                const show = Boolean(showImagePreview[img.id]);
                const sumClip = clipText(sum, 420);
                const diffClip = clipText(diff, 420);

                return (
                  <article key={img.id} className="border border-slate-200 rounded-lg p-3 space-y-2">
                    <p className="text-xs text-slate-500">{img.type || "IMAGEN"} · Fecha: {toMadrid(img.exam_date || img.created_at)} · ID {img.id}</p>

                    {sum && (
                      <div>
                        <h3 className="text-sm font-semibold mb-1">Resumen radiológico</h3>
                        <p className="text-sm whitespace-pre-line">{expandedText[`i_sum_${img.id}`] ? sum : sumClip.short}</p>
                        {sumClip.clipped && (
                          <button type="button" onClick={() => toggleExpanded(`i_sum_${img.id}`)} className="text-xs text-sky-700 hover:underline mt-1">
                            {expandedText[`i_sum_${img.id}`] ? "Ver menos" : "Ver más"}
                          </button>
                        )}
                      </div>
                    )}

                    {diff && (
                      <div>
                        <h3 className="text-sm font-semibold mb-1">Diagnóstico diferencial</h3>
                        <p className="text-sm whitespace-pre-line">{expandedText[`i_diff_${img.id}`] ? diff : diffClip.short}</p>
                        {diffClip.clipped && (
                          <button type="button" onClick={() => toggleExpanded(`i_diff_${img.id}`)} className="text-xs text-sky-700 hover:underline mt-1">
                            {expandedText[`i_diff_${img.id}`] ? "Ver menos" : "Ver más"}
                          </button>
                        )}
                      </div>
                    )}

                    {patterns.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold mb-1">Patrones / hallazgos</h3>
                        <ul className="list-disc list-inside text-sm text-slate-800 space-y-1">
                          {patterns.slice(0, 10).map((p, idx) => (
                            <li key={idx}>{p.pattern_text || String(p)}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {img.file_path && (
                      <div className="pt-1">
                        <button type="button" onClick={() => setShowImagePreview((prev) => ({ ...prev, [img.id]: !prev[img.id] }))} className="sr-btn-secondary text-xs">
                          {show ? "Ocultar imagen" : "Ver imagen"}
                        </button>
                        {show && <img src={img.file_path} alt="Imagen médica" className="mt-2 max-w-sm w-full rounded-lg border border-slate-200" />}
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        )}
      </section>
<section className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
  <div className="flex items-center justify-between gap-4">
    <h2 className="text-lg font-semibold">Imágenes quirúrgicas</h2>
    <p className="text-xs text-slate-500">
      Antes / Después / Seguimiento (solo lectura). La subida y comparativa avanzada están en Panel médico.
    </p>
  </div>

  {(() => {
    const cos = (imaging || []).filter((x) => isCosmeticType(x.type));
    const pre = cos.filter((x) => String(x.type || "").toUpperCase() === "COSMETIC_PRE");
    const post = cos.filter((x) => String(x.type || "").toUpperCase() === "COSMETIC_POST");
    const follow = cos.filter((x) => String(x.type || "").toUpperCase() === "COSMETIC_FOLLOWUP");

    const renderRow = (arr) => (
      <div className="flex gap-2 overflow-x-auto pb-2">
        {arr.map((img) => (
          <a
            key={img.id}
            href={img.file_path}
            target="_blank"
            rel="noreferrer"
            className="flex-shrink-0 w-[120px] rounded-lg border border-slate-200 hover:border-slate-300 bg-white"
            title={`ID ${img.id} · ${cosmeticLabel(img.type)} · ${fmtShortDate(img.exam_date || img.created_at)}`}
          >
            <img
              src={img.file_path}
              alt={`Cosmetic ${img.id}`}
              className="w-full h-[86px] object-cover rounded-t-lg"
            />
            <div className="px-2 py-1">
              <p className="text-[10px] text-slate-600">ID {img.id} · {cosmeticLabel(img.type)}</p>
              <p className="text-[10px] text-slate-500">{fmtShortDate(img.exam_date || img.created_at)}</p>
            </div>
          </a>
        ))}
      </div>
    );

    if (cos.length === 0) {
      return <p className="text-sm text-slate-600">Aún no hay imágenes quirúrgicas para este paciente.</p>;
    }

    return (
      <div className="space-y-4">
        {pre.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-slate-800 mb-1">Antes</p>
            {renderRow(pre)}
          </div>
        )}
        {post.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-slate-800 mb-1">Después</p>
            {renderRow(post)}
          </div>
        )}
        {follow.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-slate-800 mb-1">Seguimiento</p>
            {renderRow(follow)}
          </div>
        )}
      </div>
    );
  })()}


<div className="border-t border-slate-200 pt-4">
  <h3 className="text-base font-semibold">🔁 Comparativa quirúrgica y PDF</h3>
  <p className="text-sm text-slate-600">
    Consulta la evolución quirúrgica y genera PDF desde el expediente (sin subir imágenes aquí).
  </p>

  {(() => {
    const cos = (imaging || []).filter((x) => isCosmeticType(x.type));
    const pre = cos.filter((x) => String(x.type || "").toUpperCase() === "COSMETIC_PRE");
    const post = cos.filter((x) => {
      const t = String(x.type || "").toUpperCase();
      return t === "COSMETIC_POST" || t === "COSMETIC_FOLLOWUP";
    });

    if (cos.length === 0) {
      return <p className="text-sm text-slate-600 mt-2">Añade imágenes quirúrgicas en Panel médico para poder comparar.</p>;
    }

    return (
      <div className="mt-3 space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="sr-label">Antes</label>
            <select className="sr-input w-full text-sm" value={cosDetPreId} onChange={(e) => setCosDetPreId(e.target.value)}>
              <option value="">Selecciona “Antes”…</option>
              {pre.map((x) => (
                <option key={x.id} value={x.id}>
                  ID {x.id} · {fmtShortDate(x.exam_date || x.created_at)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="sr-label">Después / Seguimiento</label>
            <select className="sr-input w-full text-sm" value={cosDetPostId} onChange={(e) => setCosDetPostId(e.target.value)}>
              <option value="">Selecciona “Después”…</option>
              {post.map((x) => (
                <option key={x.id} value={x.id}>
                  ID {x.id} · {fmtShortDate(x.exam_date || x.created_at)} · {cosmeticLabel(x.type)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {cosDetCompareError && <p className="text-sm text-red-600">{cosDetCompareError}</p>}

        <button
          type="button"
          onClick={handleCosDetCompare}
          disabled={cosDetCompareLoading || !cosDetPreId || !cosDetPostId}
          className="sr-btn-secondary disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {cosDetCompareLoading ? "Comparando..." : "Comparar"}
        </button>

        {cosDetCompareResult && (
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60">
            <p className="text-xs text-slate-500 mb-1">Comparativa descriptiva (IA) — borrador</p>
            <p className="text-sm text-slate-800 whitespace-pre-wrap">{cosDetCompareResult}</p>
          </div>
        )}

        <div className="border-t border-slate-200 pt-3">
          <h4 className="text-sm font-semibold">📄 PDF quirúrgico (Antes / Después)</h4>
          <p className="text-xs text-slate-600 mt-1">Requiere comparativa generada.</p>

          <label className="sr-label mt-2">Nota del cirujano (opcional)</label>
          <textarea
            className="sr-input w-full min-h-[70px]"
            value={cosDetNote}
            onChange={(e) => setCosDetNote(e.target.value)}
            placeholder="Ej. Seguimiento a 6 semanas. Edema esperado. Revisión en 3 meses..."
          />

          {cosDetPdfError && <p className="text-sm text-red-600 mt-2">{cosDetPdfError}</p>}

          <button
            type="button"
            onClick={handleCosDetPdf}
            disabled={cosDetPdfLoading || !cosDetCompareResult}
            className="sr-btn-secondary mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {cosDetPdfLoading ? "Generando PDF..." : "📄 Generar PDF"}
          </button>
        </div>
      </div>
    );
  })()}
</div>
</section>


      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
        <button type="button" onClick={() => toggleBlock("notas")} className="flex items-center justify-between w-full text-left">
          <h2 className="text-lg font-semibold">Notas clínicas</h2>
          <span className="text-xs text-slate-500">{open.notas ? "Ocultar" : "Mostrar"}</span>
        </button>

        {open.notas && (
          <div className="mt-3 space-y-4">
            <div className="border border-slate-200 rounded-lg p-3 space-y-2 bg-slate-50/60">
              <h3 className="text-sm font-semibold">Añadir nota clínica</h3>
              <form onSubmit={handleCreateNote} className="space-y-2">
                <div>
                  <label className="sr-label">Título</label>
                  <input type="text" className="sr-input w-full" value={newNoteTitle} onChange={(e) => setNewNoteTitle(e.target.value)} />
                </div>
                <div>
                  <label className="sr-label">Contenido</label>
                  <textarea className="sr-input w-full min-h-[80px]" value={newNoteContent} onChange={(e) => setNewNoteContent(e.target.value)} />
                </div>
                {noteError && <p className="text-sm text-red-600">{noteError}</p>}
                <button type="submit" disabled={noteSaving} className="sr-btn-secondary text-xs disabled:opacity-60">
                  {noteSaving ? "Guardando..." : "Guardar nota"}
                </button>
              </form>
            </div>

            {notes.length === 0 ? (
              <p className="text-sm text-slate-500">No hay notas clínicas registradas.</p>
            ) : (
              notes.map((n) => (
                <article key={n.id} className="border border-slate-200 rounded-lg p-3 space-y-1">
                  <p className="text-xs text-slate-500">{toMadrid(n.created_at)}</p>
                  <h3 className="text-sm font-semibold">{n.title}</h3>
                  <p className="text-sm whitespace-pre-line">{n.content}</p>
                </article>
              ))
            )}
          </div>
        )}
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
        <button type="button" onClick={() => toggleBlock("timeline")} className="flex items-center justify-between w-full text-left">
          <h2 className="text-lg font-semibold">Timeline</h2>
          <span className="text-xs text-slate-500">{open.timeline ? "Ocultar" : "Mostrar"}</span>
        </button>

        {open.timeline && (
          <div className="mt-3 space-y-2">
            {sortedTimeline.length === 0 ? (
              <p className="text-sm text-slate-500">Aún no hay eventos en el timeline.</p>
            ) : (
              sortedTimeline.map((item) => (
                <div key={item.id} className="border border-slate-200 rounded-lg p-2 text-sm flex items-center justify-between">
                  <div>
                    <p className="font-medium">{timelineLabel(item.item_type)}</p>
                    <p className="text-xs text-slate-500">{toMadrid(item.created_at)}</p>
                  </div>
                  <div className="text-xs text-slate-400">ID evento: {item.item_id}</div>
                </div>
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
}
