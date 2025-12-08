
import React, { useState } from "react";

/**
 * Modal para crear una nueva consulta clínica en De guardia.
 * Envía los datos al backend para que la IA anonimice y modere antes de publicar.
 */
export default function NuevaConsultaModal({
  isOpen,
  onClose,
  apiBase,
  token,
  onCreated,
}) {
  const [form, setForm] = useState({
    title: "",
    age_group: "",
    sex: "",
    context: "",
    main_symptoms: "",
    key_findings: "",
    clinical_question: "",
    free_text: "",
  });
  const [preview, setPreview] = useState("");
  const [step, setStep] = useState("form"); // "form" | "preview"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleClose() {
    if (loading) return;
    setForm({
      title: "",
      age_group: "",
      sex: "",
      context: "",
      main_symptoms: "",
      key_findings: "",
      clinical_question: "",
      free_text: "",
    });
    setPreview("");
    setStep("form");
    setError("");
    onClose();
  }

  async function handlePreview(e) {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Añade un título corto para la consulta.");
      return;
    }
    if (!form.main_symptoms.trim()) {
      setError("Describe brevemente los síntomas principales.");
      return;
    }
    if (!form.clinical_question.trim()) {
      setError("Formula una pregunta clínica concreta.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${apiBase}/guard/cases/preview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const raw = await res.text();
      console.log("👉 [DeGuardia] POST /guard/cases/preview (raw):", raw);

      if (!res.ok) {
        let msg = "No se pudo preparar la versión anonimizada de la consulta.";
        try {
          const errData = JSON.parse(raw);
          if (errData.detail) msg = errData.detail;
        } catch {}
        setError(msg);
        return;
      }

      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        data = null;
      }

      setPreview(data?.anonymized_summary || "");
      setStep("preview");
    } catch (err) {
      console.error("❌ [DeGuardia] Error al previsualizar consulta:", err);
      setError("Error de conexión al preparar la consulta.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePublish() {
    setError("");

    try {
      setLoading(true);

      const res = await fetch(`${apiBase}/guard/cases`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const raw = await res.text();
      console.log("👉 [DeGuardia] POST /guard/cases (raw):", raw);

      if (!res.ok) {
        let msg = "No se pudo publicar la consulta en De guardia.";
        try {
          const errData = JSON.parse(raw);
          if (errData.detail) msg = errData.detail;
        } catch {}
        setError(msg);
        return;
      }

      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        data = null;
      }

      if (data) {
        onCreated(data);
        handleClose();
      }
    } catch (err) {
      console.error("❌ [DeGuardia] Error al publicar consulta:", err);
      setError("Error de conexión al publicar la consulta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full p-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-900">
            Nueva consulta de diagnóstico
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            Cerrar
          </button>
        </div>

        {step === "form" && (
          <form onSubmit={handlePreview} className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            <div>
              <label className="sr-label text-xs">Título de la consulta</label>
              <input
                className="sr-input w-full text-sm"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="Ej. Dolor torácico en varón de mediana edad"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="sr-label text-xs">Grupo de edad</label>
                <select
                  className="sr-input w-full text-sm"
                  value={form.age_group}
                  onChange={(e) => updateField("age_group", e.target.value)}
                >
                  <option value="">Seleccionar…</option>
                  <option value="<1 año">&lt; 1 año</option>
                  <option value="1-5 años">1–5 años</option>
                  <option value="6-12 años">6–12 años</option>
                  <option value="13-17 años">13–17 años</option>
                  <option value="18-40 años">18–40 años</option>
                  <option value="41-65 años">41–65 años</option>
                  <option value=">65 años">&gt; 65 años</option>
                </select>
              </div>
              <div>
                <label className="sr-label text-xs">Sexo biológico</label>
                <select
                  className="sr-input w-full text-sm"
                  value={form.sex}
                  onChange={(e) => updateField("sex", e.target.value)}
                >
                  <option value="">No especificar</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro / prefiero no decirlo">
                    Otro / prefiero no decirlo
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className="sr-label text-xs">Contexto clínico</label>
              <select
                className="sr-input w-full text-sm"
                value={form.context}
                onChange={(e) => updateField("context", e.target.value)}
              >
                <option value="">Seleccionar…</option>
                <option value="Urgencias">Urgencias</option>
                <option value="Consulta externa">Consulta externa</option>
                <option value="Ingreso">Ingreso</option>
                <option value="Seguimiento">Seguimiento</option>
              </select>
            </div>

            <div>
              <label className="sr-label text-xs">Síntomas principales</label>
              <textarea
                className="sr-input w-full min-h-[60px] text-sm"
                value={form.main_symptoms}
                onChange={(e) => updateField("main_symptoms", e.target.value)}
                placeholder="Ej. Dolor torácico opresivo, disnea de esfuerzo, diaforesis…"
              />
            </div>

            <div>
              <label className="sr-label text-xs">Hallazgos relevantes</label>
              <textarea
                className="sr-input w-full min-h-[60px] text-sm"
                value={form.key_findings}
                onChange={(e) => updateField("key_findings", e.target.value)}
                placeholder="Exploración, ECG, analíticas o pruebas clave (sin datos identificativos)."
              />
            </div>

            <div>
              <label className="sr-label text-xs">Pregunta clínica</label>
              <textarea
                className="sr-input w-full min-h-[60px] text-sm"
                value={form.clinical_question}
                onChange={(e) => updateField("clinical_question", e.target.value)}
                placeholder="Ej. ¿Plantearíais ingreso para monitorización o alta con prueba de esfuerzo diferida?"
              />
            </div>

            <div>
              <label className="sr-label text-xs">
                Texto libre (opcional, sin datos identificativos)
              </label>
              <textarea
                className="sr-input w-full min-h-[60px] text-sm"
                value={form.free_text}
                onChange={(e) => updateField("free_text", e.target.value)}
                placeholder="Cualquier otro detalle clínico que pueda ayudar (sin nombres, teléfonos, direcciones, etc.)."
              />
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <div className="flex items-center justify-between gap-2 pt-2">
              <p className="text-[11px] text-slate-500 max-w-xs">
                Antes de publicar, la IA anonimizará y revisará la consulta para proteger al paciente.
              </p>
              <button
                type="submit"
                disabled={loading}
                className="sr-btn-primary text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Preparando consulta…" : "Anonimizar y previsualizar"}
              </button>
            </div>
          </form>
        )}

        {step === "preview" && (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            <p className="text-sm text-slate-700">
              Esta es la versión anonimizada que verán otros médicos en De guardia:
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-md p-3">
              <p className="text-sm text-slate-900 whitespace-pre-line">{preview}</p>
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep("form")}
                className="text-xs text-slate-600 hover:text-slate-800"
              >
                Volver a editar
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handlePublish}
                className="sr-btn-primary text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Publicando…" : "Publicar en De guardia"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
