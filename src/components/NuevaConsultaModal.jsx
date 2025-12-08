import React, { useState } from "react";

/**
 * Modal para crear una nueva consulta clínica en De guardia.
 * Ahora permite opcionalmente indicar un ID de paciente
 * para que el backend pueda tomar la última analítica/imagen de apoyo.
 */
export default function NuevaConsultaModal({
  isOpen,
  onClose,
  apiBase,
  token,
  onCreated,
}) {
  const [form, setForm] = useState({
    patient_id: "",          // 👈 nuevo campo opcional
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
      patient_id: "",
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

  function buildPayload() {
    // Convertimos patient_id a número si es válido
    let pid = null;
    if (form.patient_id && String(form.patient_id).trim() !== "") {
      const n = parseInt(String(form.patient_id).trim(), 10);
      if (!Number.isNaN(n) && n > 0) {
        pid = n;
      }
    }

    return {
      patient_id: pid,
      title: form.title,
      age_group: form.age_group,
      sex: form.sex,
      context: form.context,
      main_symptoms: form.main_symptoms,
      key_findings: form.key_findings,
      clinical_question: form.clinical_question,
      free_text: form.free_text,
    };
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
