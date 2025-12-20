import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ========================
// Utilidades
// ========================

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
  const iso =
    typeof value === "string" && value.endsWith("Z") ? value : `${value}Z`;
  try {
    return new Date(iso).toLocaleString("es-ES", {
      timeZone: "Europe/Madrid",
    });
  } catch {
    return String(value);
  }
}

function pickLatestAnalytic(analyticsArr) {
  if (!Array.isArray(analyticsArr) || analyticsArr.length === 0) return null;

  const sorted = [...analyticsArr].sort((a, b) => {
    const da = new Date(`${a.exam_date || a.created_at || ""}Z`).getTime();
    const db = new Date(`${b.exam_date || b.created_at || ""}Z`).getTime();
    return db - da;
  });

  return sorted[0] || analyticsArr[0] || null;
}

function topNotes(notesArr, n = 3) {
  if (!Array.isArray(notesArr) || notesArr.length === 0) return [];
  const sorted = [...notesArr].sort((a, b) => {
    const da = new Date(`${a.created_at || ""}Z`).getTime();
    const db = new Date(`${b.created_at || ""}Z`).getTime();
    return db - da;
  });
  return sorted.slice(0, n);
}

function buildCompareTable(compareObj) {
  const markersObj = compareObj?.markers || {};

  const has18 = Object.values(markersObj).some(
    (row) => row && row["18m"] != null
  );
  const has24 = Object.values(markersObj).some(
    (row) => row && row["24m"] != null
  );

  const head = ["Marcador", "Actual", "6m", "12m"];
  if (has18) head.push("18m");
  if (has24) head.push("24m");

  const body = Object.entries(markersObj).map(([name, row]) => {
    const tr = row?.trend || {};
    const b = row?.baseline;

    const cell = (k) => {
      const vPast = row?.[k];
      const sym = tr[k] || "";
      const delta = vPast == null || b == null ? null : b - vPast;
      const deltaTxt =
        delta == null ? "" : ` (Δ ${delta >= 0 ? "+" : ""}${delta.toFixed(2)})`;
      return `${vPast ?? "—"} ${sym}${deltaTxt}`.trim();
    };

    const r = [safeText(name), safeText(b ?? "—"), cell("6m"), cell("12m")];
    if (has18) r.push(cell("18m"));
    if (has24) r.push(cell("24m"));
    return r;
  });

  return { head, body };
}


// ========================
// PDF V1.6 — Resumen global objetivo + leyenda
// ========================
function computeGlobalObjectiveSummary(compareObj, stablePct = 2) {
  const markersObj = compareObj?.markers || {};
  let improve = 0,
    worsen = 0,
    stable = 0;

  for (const row of Object.values(markersObj)) {
    const baseline = row?.baseline;
    if (baseline == null) continue;

    // Usamos el pasado más reciente disponible (6m > 12m > 18m > 24m)
    const order = ["6m", "12m", "18m", "24m"];
    let past = null;
    for (const k of order) {
      if (row?.[k] != null && row?.[k] !== "") {
        past = row[k];
        break;
      }
    }
    if (past == null) continue;

    const p = Number(past);
    const b = Number(baseline);
    if (!Number.isFinite(p) || !Number.isFinite(b) || p === 0) continue;

    const pct = ((b - p) / p) * 100;

    if (Math.abs(pct) < stablePct) stable++;
    else if (pct > 0) improve++;
    else worsen++;
  }

  return { improve, worsen, stable, total: improve + worsen + stable, stablePct };
}

function renderGlobalObjectiveSummary(doc, summary, marginX, y) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Resumen de evolución (objetivo)", marginX, y);
  y += 14;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const lines = [
    `• Marcadores evaluados: ${summary.total}`,
    `• Marcadores que mejoran: ${summary.improve}`,
    `• Marcadores que empeoran: ${summary.worsen}`,
    `• Sin cambios relevantes (±${summary.stablePct}%): ${summary.stable}`,
  ];
  doc.text(lines, marginX, y);
  y += lines.length * 12 + 10;
  return y;
}

function renderLegend(doc, marginX, y) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("🟢 Mejora     🔴 Empeora     ⬜ Sin cambios", marginX, y);
  return y + 12;
}


// ========================
// PDF V1 (AJUSTE A incluido)
// ========================

export function generatePacientePDFV1({ patient, compare, analytics, notes }) {
  const doc = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });

  const marginX = 40;
  let y = 48;
  const wrapW = 515;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Galenos.pro — Comparativa temporal + Resumen IA", marginX, y);
  y += 18;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    `Paciente: ${safeText(patient?.alias || "—")} · Nº ${safeText(
      patient?.patient_number ?? "—"
    )}`,
    marginX,
    y
  );
  y += 14;

  doc.text(`Generado: ${nowMadridString()}`, marginX, y);
  y += 18;


  // Resumen global objetivo + leyenda (V1.6)
  const globalSummary = computeGlobalObjectiveSummary(compare, 2);
  y = renderGlobalObjectiveSummary(doc, globalSummary, marginX, y);
  y = renderLegend(doc, marginX, y);

  // Resumen IA (última analítica)
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

  if (summary) {
    const lines = doc.splitTextToSize(summary, wrapW);
    doc.text(lines, marginX, y);
    y += lines.length * 12 + 8;
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
    y += lines.length * 12 + 10;
  }

  // Comparativa (AJUSTE A)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Comparativa temporal de marcadores", marginX, y);
  y += 10;

  const hasComparableData =
    compare && compare.markers && Object.keys(compare.markers).length > 0;

  if (hasComparableData) {
    const table = buildCompareTable(compare);

    autoTable(doc, {
      startY: y,
      head: [table.head],
      body: table.body,
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 3,
        overflow: "linebreak",
      },
      headStyles: { fontStyle: "bold" },
      didParseCell: function (data) {
        // Colores por DELTA numérico: usa el valor dentro del paréntesis.
        // Soporta formatos como: ( +3.30 ), (” +0.00), (Δ +0.10), etc.
        try {
          if (data.section === "body" && data.column && data.column.index >= 2) {
            const raw = data.cell && data.cell.text != null ? data.cell.text : "";
            const txt = Array.isArray(raw) ? raw.join(" ") : String(raw);

            // Captura el número permitiendo basura tipográfica tras el "("
            const m = txt.match(/\(\s*[^0-9+\-]*([+\-]?\d+(?:\.\d+)?)\s*\)/);
            if (!m) return;

            const delta = parseFloat(m[1]);
            if (Number.isNaN(delta)) return;

            if (delta > 0) {
              data.cell.styles.textColor = [0, 128, 0];   // verde
              data.cell.styles.fillColor = [232, 245, 233]; // fondo verde suave
            } else if (delta < 0) {
              data.cell.styles.textColor = [200, 0, 0];   // rojo
              data.cell.styles.fillColor = [255, 235, 238]; // fondo rojo suave
            }
          }
        } catch (e) {
          // no-op
        }
      },
      margin: { left: marginX, right: marginX },
    });

    y = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 16 : y + 220;
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      "La comparativa temporal completa de marcadores está disponible en la plataforma web de Galenos.pro.",
      marginX,
      y
    );
    y += 24;
  }

  // Notas
  const recentNotes = topNotes(notes, 3);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Notas clínicas (recientes)", marginX, y);
  y += 14;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  if (recentNotes.length === 0) {
    doc.text("—", marginX, y);
    y += 14;
  } else {
    for (const n of recentNotes) {
      const title = safeText(n.title || "Nota");
      const when = n.created_at ? toMadridInline(n.created_at) : "";
      const content = safeText(n.content || "");

      doc.setFont("helvetica", "bold");
      doc.text(`${title}${when ? " · " + when : ""}`, marginX, y);
      y += 12;

      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(content, wrapW);
      doc.text(lines.slice(0, 10), marginX, y);
      y += Math.min(lines.length, 10) * 12 + 8;

      if (y > 740) {
        doc.addPage();
        y = 60;
      }
    }
  }

  // Disclaimer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    "Nota: Galenos.pro no diagnostica ni prescribe. Documento de apoyo a la deliberación clínica. La decisión final corresponde al médico responsable.",
    marginX,
    Math.min(800, y + 12)
  );

  const fileName = `Galenos_${safeText(patient?.alias || "paciente")}_comparativa.pdf`
    .replace(/[^a-zA-Z0-9._-]+/g, "_");

  doc.save(fileName);
}
