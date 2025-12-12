// src/pages/PacienteDetalle.jsx — Ficha de paciente completa · Galenos.pro
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API =
  import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

export default function PacienteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("galenos_token");

  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState("");

  const [analytics, setAnalytics] = useState([]);
  const [imaging, setImaging] = useState([]);
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

  // Comparativa
  const [compareMonths, setCompareMonths] = useState(6);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState("");
  const [compareData, setCompareData] = useState(null);

  // Resumen IA comparativa
  const [compareSummary, setCompareSummary] = useState("");
  const [compareSummaryDisclaimer, setCompareSummaryDisclaimer] = useState("");
  const [compareSummaryLoading, setCompareSummaryLoading] = useState(false);
  const [compareSummaryError, setCompareSummaryError] = useState("");

  // UI comparativa mejorada
  const [onlyWithTrend, setOnlyWithTrend] = useState(true);

  function toggle(block) {
    setOpen((prev) => ({ ...prev, [block]: !prev[block] }));
  }

  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString("es-ES");
  };

  const normalizeMarkerName = (nameRaw) => {
    const name = (nameRaw || "").trim();
    const map = {
      "Leucòcits": "Leucocitos",
      "Hematies": "Hematíes",
      "Hematòcrit": "Hematocrito",
      "Volum corpuscular mig": "Volumen corpuscular medio",
      "Hemoglobina corpuscular mitja": "Hemoglobina corpuscular media",
      "Conc. Hemog. Corpuscular Media": "Concentración hb corpuscular media",
      "Índex dispersió hematies": "Índice dispersión hematíes",
      "Plaquetes": "Plaquetas",
      "Volum plaquetar mig": "Volumen plaquetario medio",
      "Índex dispersió de plaquetes": "Índice dispersión plaquetas",
      "Plaquetòcrit": "Plaquetocrito",
      "Neutròfils": "Neutrófilos",
      "Limfòcits": "Linfocitos",
      "Eosinòfils": "Eosinófilos",
      "Basòfils": "Basófilos",
      "Monòcits": "Monocitos",
      "Pressió parcial CO2": "Presión parcial CO2",
      "Bicarbonat actual": "Bicarbonato actual",
      "CO2 total": "CO2 total",
      "Excés de base": "Exceso de base",
      "Sodi": "Sodio",
      "Potassi": "Potasio",
      "Fòsfor": "Fósforo",
      "Àcid úric": "Ácido úrico",
      "Estimació filtrat glomerular": "Estimación filtrado glomerular",
      "Albúmina sèric": "Albúmina sérica",
      "Triglicèrids": "Triglicéridos",
      "Proteïnùria orina 24 h": "Proteinuria orina 24 horas",
      "Concentració proteïnùria": "Concentración proteinuria",
      "Concentració proteïnúria": "Concentración proteinuria",
      "Quocient proteïnes/creatinina": "Cociente proteínas/creatinina",
      "Volum orina 24 hores": "Volumen orina 24 horas",
      "Aclarament d'urea": "Aclaramiento de urea",
      "Aclarament de creatinina": "Aclaramiento de creatinina",
      "Densitat": "Densidad orina",
      "pH (orina)": "pH orina",
    };
    return map[name] || name;
  };

  const groupMarker = (name) => {
    const n = (name || "").toLowerCase();

    if (
      n.includes("creatinina") ||
      n.includes("urea") ||
      n.includes("filtrado") ||
      n.includes("aclaramiento")
    )
      return "Función renal";

    if (
      n.includes("colesterol") ||
      n.includes("triglic") ||
      n.includes("hba1c") ||
      n.includes("glicada") ||
      n.includes("glucosa") ||
      n.includes("ácido úrico") ||
      n.includes("urico")
    )
      return "Metabolismo / lípidos";

    if (
      n.includes("leucoc") ||
      n.includes("hemat") ||
      n.includes("hemo") ||
      n.includes("plaquet") ||
      n.includes("reticul")
    )
      return "Hematología";

    if (n.includes("orina") || n.includes("proteinuria") || n.includes("densidad") || n.includes("ph orina"))
      return "Orina";

    return "Otros";
  };

  // =========================
  // CARGA FICHA
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
        const res = await fetch(`${API}/patients/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const raw = await res.text();
        if (!res.ok) {
          setError("No se pudieron cargar los datos básicos del paciente.");
          setLoading(false);
          return;
        }
        const data = JSON.parse(raw);
        setPatient(data);

        setEditAlias(data.alias || "");
        setEditAge(data.age != null ? String(data.age) : "");
        setEditGender(data.gender || "");
        setEditNotes(data.notes || "");
      } catch (err) {
        console.error("❌ Error /patients:", err);
        setError("No se pudieron cargar los datos básicos del paciente.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API}/analytics/by-patient/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const raw = await res.text();
        if (res.ok) setAnalytics(JSON.parse(raw || "[]") || []);
      } catch {}

      try {
        const res = await fetch(`${API}/imaging/by-patient/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const raw = await res.text();
        if (res.ok) setImaging(JSON.parse(raw || "[]") || []);
      } catch {}

      try {
        const res = await fetch(`${API}/notes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const raw = await res.text();
        if (res.ok) setNotes(JSON.parse(raw || "[]") || []);
      } catch {}

      try {
        const res = await fetch(`${API}/timeline/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const raw = await res.text();
        if (res.ok) setTimeline(JSON.parse(raw || "[]") || []);
      } catch {}

      setLoading(false);
    }

    loadAll();
  }, [id, token]);

  // =========================
  // GUARDAR PACIENTE
  // =========================
  async function handleSavePatient(e) {
    e.preventDefault();
    setPatientSaveError("");

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
      if (!res.ok) {
        let msg = "No se han podido guardar los datos del paciente.";
        try {
          const errData = JSON.parse(raw);
          if (errData.detail) msg = errData.detail;
        } catch {}
        setPatientSaveError(msg);
        return;
      }

      const data = JSON.parse(raw);
      setPatient(data);
      setEditing(false);
    } catch (err) {
      setPatientSaveError("Error de conexión al guardar el paciente.");
    } finally {
      setSavingPatient(false);
    }
  }

  // =========================
  // CREAR NOTA
  // =========================
  async function handleCreateNote(e) {
    e.preventDefault();
    setNoteError("");

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
      if (!res.ok) {
        setNoteError("No se ha podido guardar la nota clínica.");
        return;
      }

      const data = JSON.parse(raw);
      setNotes((prev) => [data, ...prev]);
      setNewNoteTitle("");
      setNewNoteContent("");
    } catch {
      setNoteError("Error de conexión al guardar la nota clínica.");
    } finally {
      setNoteSaving(false);
    }
  }

  // =========================
  // COMPARATIVA
  // =========================
  async function handleLoadComparativa(e) {
    e.preventDefault();
    setCompareError("");
    setCompareData(null);
    setCompareSummary("");
    setCompareSummaryError("");
    setCompareSummaryDisclaimer("");

    try {
      setCompareLoading(true);
      const res = await fetch(
        `${API}/analytics/compare/${id}?months=${compareMonths}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const raw = await res.text();
      if (!res.ok) {
        setCompareError("No se ha podido cargar la comparativa.");
        return;
      }
      const data = JSON.parse(raw);
      setCompareData(data);
    } catch (err) {
      setCompareError("Error de conexión al cargar la comparativa.");
    } finally {
      setCompareLoading(false);
    }
  }

  async function handleLoadCompareSummary() {
    setCompareSummaryError("");
    setCompareSummary("");
    setCompareSummaryDisclaimer("");

    try {
      setCompareSummaryLoading(true);
      const res = await fetch(
        `${API}/analytics/compare-summary/${id}?months=${compareMonths}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const raw = await res.text();
      if (!res.ok) {
        setCompareSummaryError("No se ha podido generar el resumen.");
        return;
      }
      const data = JSON.parse(raw);
      setCompareSummary(data.summary || "");
      setCompareSummaryDisclaimer(data.disclaimer || "");
    } catch {
      setCompareSummaryError("Error de conexión al generar el resumen.");
    } finally {
      setCompareSummaryLoading(false);
    }
  }

  // =========================
  // COMPARATIVA — TRANSFORMACIÓN UI
  // =========================
  const compareCards = useMemo(() => {
    if (!compareData?.markers) return [];

    // 1) Normalizar nombres y fusionar series duplicadas
    const merged = new Map(); // name -> array of points
    for (const [rawName, points] of Object.entries(compareData.markers)) {
      const name = normalizeMarkerName(rawName);
      const pts = Array.isArray(points) ? points : [];
      const prev = merged.get(name) || [];
      merged.set(name, [...prev, ...pts]);
    }

    // 2) Limpiar, ordenar, deduplicar por fecha (si hay duplicadas nos quedamos con la última)
    const result = [];
    for (const [name, pts] of merged.entries()) {
      const cleaned = pts
        .filter((p) => p && p.date && p.value != null && !Number.isNaN(Number(p.value)))
        .map((p) => ({ date: p.date, value: Number(p.value) }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // dedupe por fecha
      const byDate = new Map();
      for (const p of cleaned) byDate.set(p.date, p);
      const ordered = Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));

      if (onlyWithTrend && ordered.length < 2) continue;

      const first = ordered[0];
      const last = ordered[ordered.length - 1];
      const delta = last.value - first.value;

      result.push({
        name,
        group: groupMarker(name),
        ordered,
        first,
        last,
        delta,
        absDelta: Math.abs(delta),
      });
    }

    // 3) Ordenar: mayores cambios arriba
    result.sort((a, b) => b.absDelta - a.absDelta);
    return result;
  }, [compareData, onlyWithTrend]);

  const groupedCompare = useMemo(() => {
    const groups = {
      "Función renal": [],
      "Metabolismo / lípidos": [],
      "Hematología": [],
      "Orina": [],
      "Otros": [],
    };
    for (const c of compareCards) {
      if (!groups[c.group]) groups["Otros"].push(c);
      else groups[c.group].push(c);
    }
    return groups;
  }, [compareCards]);

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
      {/* Cabecera */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
              Paciente: {patient.alias}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Nº Paciente: <span className="font-mono">{patient.patient_number ?? "—"}</span> ·
              ID interno: <span className="font-mono">{patient.id}</span> · Alta:{" "}
              {patient.created_at ? formatDate(patient.created_at) : "-"}
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

      {/* Datos paciente */}
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
                <p><strong>Alias:</strong> {patient.alias}</p>
                <p><strong>Edad:</strong> {patient.age != null ? `${patient.age} años` : "—"}</p>
                <p><strong>Sexo:</strong> {patient.gender || "—"}</p>
                <p><strong>Notas internas:</strong> {patient.notes || "—"}</p>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="sr-btn-secondary text-xs mt-2"
                >
                  Editar datos
                </button>
                {patientSaveError && (
                  <p className="text-xs text-red-600 mt-1">{patientSaveError}</p>
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
                  />
                </div>
                {patientSaveError && (
                  <p className="text-xs text-red-600 mt-1">{patientSaveError}</p>
                )}
                <div className="flex gap-2 mt-2">
                  <button
                    type="submit"
                    disabled={savingPatient}
                    className="sr-btn-primary text-xs disabled:opacity-60"
                  >
                    {savingPatient ? "Guardando..." : "Guardar cambios"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
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

      {/* Analíticas + Comparativa */}
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
            {analytics.length === 0 ? (
              <p className="text-sm text-slate-500">
                No hay analíticas registradas para este paciente.
              </p>
            ) : (
              analytics.map((a) => (
                <article
                  key={a.id}
                  className="border border-slate-200 rounded-lg p-3 space-y-2"
                >
                  <p className="text-xs text-slate-500">
                    Fecha: {formatDate(a.exam_date || a.created_at)}
                  </p>
                  {a.summary && (
                    <div>
                      <h3 className="text-sm font-semibold mb-1">Resumen</h3>
                      <p className="text-sm whitespace-pre-line">{a.summary}</p>
                    </div>
                  )}
                </article>
              ))
            )}

            <div className="mt-4 border-t border-slate-200 pt-3 space-y-2">
              <h4 className="text-sm font-semibold">
                Comparativa de analíticas (más fácil de leer)
              </h4>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <form
                  onSubmit={handleLoadComparativa}
                  className="flex flex-wrap items-center gap-2 text-xs"
                >
                  <span>Últimos</span>
                  <select
                    className="sr-input w-20"
                    value={compareMonths}
                    onChange={(e) =>
                      setCompareMonths(Number.parseInt(e.target.value, 10))
                    }
                  >
                    <option value={3}>3 meses</option>
                    <option value={6}>6 meses</option>
                    <option value={12}>12 meses</option>
                  </select>
                  <button
                    type="submit"
                    disabled={compareLoading}
                    className="sr-btn-secondary disabled:opacity-60"
                  >
                    {compareLoading ? "Cargando..." : "Ver comparativa"}
                  </button>
                </form>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={onlyWithTrend}
                    onChange={(e) => setOnlyWithTrend(e.target.checked)}
                  />
                  Solo marcadores con evolución (≥2 fechas)
                </label>

                <button
                  type="button"
                  onClick={handleLoadCompareSummary}
                  disabled={compareSummaryLoading}
                  className="sr-btn-secondary disabled:opacity-60"
                >
                  {compareSummaryLoading ? "Generando..." : "Resumen IA"}
                </button>
              </div>

              {compareError && (
                <p className="text-xs text-red-600 mt-1">{compareError}</p>
              )}

              {compareData && (
                <div className="mt-2 space-y-4">
                  {compareCards.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      No hay marcadores con suficiente evolución en este periodo.
                      (Prueba a desmarcar el filtro o aumentar meses.)
                    </p>
                  ) : (
                    <>
                      {Object.entries(groupedCompare).map(([group, items]) => {
                        if (!items || items.length === 0) return null;
                        return (
                          <div key={group} className="space-y-2">
                            <h5 className="text-sm font-semibold">{group}</h5>
                            <div className="space-y-2">
                              {items.map((it) => {
                                const arrow = `${it.first.value} → ${it.last.value}`;
                                const deltaTxt =
                                  it.delta > 0
                                    ? `+${it.delta.toFixed(2)}`
                                    : it.delta.toFixed(2);

                                const deltaClass =
                                  it.delta > 0
                                    ? "text-red-600"
                                    : it.delta < 0
                                    ? "text-emerald-700"
                                    : "text-slate-600";

                                return (
                                  <div
                                    key={it.name}
                                    className="border border-slate-200 rounded-lg p-2 text-xs"
                                  >
                                    <div className="flex justify-between items-center">
                                      <span className="font-semibold">{it.name}</span>
                                      <span className={deltaClass}>
                                        {arrow} · Δ {deltaTxt}
                                      </span>
                                    </div>
                                    <div className="mt-1 text-[11px] text-slate-600">
                                      {it.first.date} → {it.last.date} ({it.ordered.length} puntos)
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}

                  {compareSummaryError && (
                    <p className="text-xs text-red-600">{compareSummaryError}</p>
                  )}

                  {compareSummary && (
                    <div className="mt-2 border border-slate-200 rounded-lg p-2 bg-slate-50">
                      <h5 className="text-xs font-semibold mb-1">
                        Resumen IA de la evolución (no vinculante)
                      </h5>
                      <p className="text-sm text-slate-800 whitespace-pre-line">
                        {compareSummary}
                      </p>
                      {compareSummaryDisclaimer && (
                        <p className="text-[11px] text-slate-500 mt-2">
                          {compareSummaryDisclaimer}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Notas */}
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
            <div className="border border-slate-200 rounded-lg p-3 space-y-2 bg-slate-50/60">
              <h3 className="text-sm font-semibold">Añadir nota clínica</h3>
              <form onSubmit={handleCreateNote} className="space-y-2">
                <div>
                  <label className="sr-label">Título</label>
                  <input
                    type="text"
                    className="sr-input w-full"
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="sr-label">Contenido</label>
                  <textarea
                    className="sr-input w-full min-h-[80px]"
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                  />
                </div>
                {noteError && <p className="text-sm text-red-600">{noteError}</p>}
                <button
                  type="submit"
                  disabled={noteSaving}
                  className="sr-btn-secondary text-xs disabled:opacity-60"
                >
                  {noteSaving ? "Guardando..." : "Guardar nota"}
                </button>
              </form>
            </div>

            {notes.length === 0 ? (
              <p className="text-sm text-slate-500">No hay notas clínicas registradas.</p>
            ) : (
              notes.map((n) => (
                <article key={n.id} className="border border-slate-200 rounded-lg p-3 space-y-1">
                  <p className="text-xs text-slate-500">{formatDate(n.created_at)}</p>
                  <h3 className="text-sm font-semibold">{n.title}</h3>
                  <p className="text-sm whitespace-pre-line">{n.content}</p>
                </article>
              ))
            )}
          </div>
        )}
      </section>

      {/* Timeline */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
        <button
          type="button"
          onClick={() => toggle("timeline")}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold">Timeline</h2>
          <span className="text-xs text-slate-500">
            {open.timeline ? "Ocultar" : "Mostrar"}
          </span>
        </button>

        {open.timeline && (
          <div className="mt-3 space-y-2">
            {sortedTimeline.length === 0 ? (
              <p className="text-sm text-slate-500">Aún no hay eventos en el timeline.</p>
            ) : (
              sortedTimeline.map((item) => (
                <div
                  key={item.id}
                  className="border border-slate-200 rounded-lg p-2 text-sm flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{timelineLabel(item.item_type)}</p>
                    <p className="text-xs text-slate-500">{formatDate(item.created_at)}</p>
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
