import jsPDF from "jspdf";
import "jspdf-autotable";

function nowMadridString() {
  try {
    return new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" });
  } catch {
    return new Date().toLocaleString("es-ES");
  }
}

function safeText(v) {
  return (v == null ? "" : String(v)).replace(/\s+/g, " ").trim();
}

function toMadridInline(value) {
  if (!value) return "";
  const iso = typeof value === "string" && value.endsWith("Z") ? value : `${value}Z`;
  try {
    return new Date(iso).toLocaleString("es-ES", { timeZone: "Europe/Madrid" });
  } catch {
    return String(value);
  }
}

function pickLatestAnalytic(analyticsArr) {
  if (!Array.isArray(analyticsArr) || analyticsArr.length === 0) return null;
  const sorted = [...analyticsArr].sort((a, b) => {
    const da = new Date(`${(a.exam_date || a.created_at || "")}Z`).getTime();
    const db = new Date(`${(b.exam_date || b.created_at || "")}Z`).getTime();
    return (Number.isFinite(db) ? db : 0) - (Number.isFinite(da) ? da : 0);
  });
  return sorted[0] || analyticsArr[0] || null;
}

function topNotes(notesArr, n = 3) {
  if (!Array.isArray(notesArr) || notesArr.length === 0) return [];
  const sorted = [...notesArr].sort((a, b) => {
    const da = new Date(`${(a.created_at || "")}Z`).getTime();
    const db = new Date(`${(b.created_at || "")}Z`).getTime();
    return (Number.isFinite(db) ? db : 0) - (Number.isFinite(da) ? da : 0);
  });
  return sorted.slice(0, n);
}

export function generatePacientePDFV1({ patient, compare, analytics, notes }) {
  const doc = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
  const marginX = 40;
  let y = 48;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Galenos.pro — Comparativa temporal + Resumen IA", marginX, y);
  y += 18;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    `Paciente: ${safeText(patient?.alias || "—")} · Nº ${safeText(patient?.patient_number ?? "—")}`,
    marginX,
    y
  );
  y += 14;

  doc.text(`Generado: ${nowMadridString()}`, marginX, y);
  y += 18;

  const lastA = pickLatestAnalytic(analytics);
  const summary = safeText(lastA?.summary || "");
  const differential = safeText(lastA?.differential || "");
  const examDate = lastA?.exam_date || lastA?.created_at || null;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Resumen IA (orientativo) — última analítica", marginX, y);
  y += 14;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  if (examDate) {
    doc.text(`Fecha: ${toMadridInline(examDate)}`, marginX, y);
    y += 12;
  }

  const wrapW = 515;
  if (summary) {
    const lines = doc.splitTextToSize(summary, wrapW);
    doc.text(lines, marginX, y);
    y += 12 * lines.length + 8;
  } else {
    doc.text("—", marginX, y);
    y += 16;
  }

  if (differential) {
    doc.setFont("helvetica", "bold");
    doc.text("Diagnóstico diferencial (orientativo)", marginX, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(differential, wrapW);
    doc.text(lines, marginX, y);
    y += 12 * lines.length + 10;
  }

  const recent = topNotes(notes, 3);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Notas clínicas (recientes)", marginX, y);
  y += 14;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  if (recent.length === 0) {
    doc.text("—", marginX, y);
  } else {
    for (const n of recent) {
      const title = safeText(n.title || "Nota");
      const when = n.created_at ? toMadridInline(n.created_at) : "";
      const content = safeText(n.content || "");
      doc.setFont("helvetica", "bold");
      doc.text(`${title}${when ? " · " + when : ""}`, marginX, y);
      y += 12;
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(content, wrapW);
      doc.text(lines.slice(0, 10), marginX, y);
      y += 12 * Math.min(lines.length, 10) + 8;
    }
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    "Nota: Galenos.pro no diagnostica ni prescribe. Documento de apoyo a la deliberación clínica.",
    marginX,
    800
  );

  const fileName = `Galenos_${safeText(patient?.alias || "paciente")}_comparativa.pdf`
    .replace(/[^a-zA-Z0-9._-]+/g, "_");

  doc.save(fileName);
}
