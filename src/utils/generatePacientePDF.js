import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Logo (ligero): se carga desde /public/galenos-logo.png
const GALENOS_LOGO_URL = "/galenos-logo.png";

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

async function fetchAsDataUrl(url) {
  // Carga una imagen del /public (Vite) y la convierte a dataURL para jsPDF.
  // Mantiene este archivo ligero (sin base64 embebido).
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`No se pudo cargar logo: ${res.status}`);
  const blob = await res.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function addGalenosLogo(doc) {
  // Logo corporativo en cabecera (cargado desde /public). No bloquea el PDF si falla.
  try {
    const dataUrl = await fetchAsDataUrl(GALENOS_LOGO_URL);

    const pageW = doc.internal.pageSize.getWidth();
    const margin = 40;
    const size = 44; // pt
    const x = pageW - margin - size;
    const y = 28;

    doc.addImage(dataUrl, "PNG", x, y, size, size);
  } catch {
    // no-op
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
        delta == null
          ? ""
          : ` (Δ ${delta >= 0 ? "+" : ""}${Number(delta).toFixed(2)})`;
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
// PDF V1.5 — Resumen determinista (top deltas)
// ========================

function pickMostRecentPastKey(row) {
  // Preferimos el periodo más reciente disponible (6m > 12m > 18m > 24m)
  const order = ["6m", "12m", "18m", "24m"];
  for (const k of order) {
    if (row && row[k] != null && row[k] !== "") return k;
  }
  return null;
}

function formatPct(p) {
  if (p == null || Number.isNaN(p)) return "";
  const s = p >= 0 ? "+" : "";
  return `${s}${p.toFixed(1)}%`;
}

function buildObjectiveDeltaSummary(compareObj, opts = {}) {
  const markersObj = compareObj?.markers || {};
  const stablePct = Number.isFinite(opts.stablePct) ? opts.stablePct : 2;

  const items = [];

  for (const [name, row] of Object.entries(markersObj)) {
    const baseline = row?.baseline;
    const pastKey = pickMostRecentPastKey(row);
    if (baseline == null || pastKey == null) continue;

    const past = row?.[pastKey];
    const pNum = Number(past);
    const bNum = Number(baseline);
    if (!Number.isFinite(pNum) || !Number.isFinite(bNum) || pNum === 0) continue;

    const pct = ((bNum - pNum) / pNum) * 100;
    const absPct = Math.abs(pct);

    // Clasificación (si hay símbolos, los respetamos; si no, por signo)
    const tr = row?.trend || {};
    const sym = safeText(tr[pastKey] || "");
    let cls = "stable";
    if (absPct >= stablePct) {
      if (sym.includes("↑")) cls = "improve";
      else if (sym.includes("↓")) cls = "worsen";
      else cls = bNum - pNum >= 0 ? "improve" : "worsen";
    }

    items.push({
      name: safeText(name),
      pastKey,
      pct,
      absPct,
      cls,
    });
  }

  const improve = items
    .filter((x) => x.cls === "improve")
    .sort((a, b) => b.absPct - a.absPct);
  const worsen = items
    .filter((x) => x.cls === "worsen")
    .sort((a, b) => b.absPct - a.absPct);
  const stable = items.filter((x) => x.cls === "stable");

  const avgPctArr = items.map((x) => x.pct).filter((v) => Number.isFinite(v));
  const avgPct =
    avgPctArr.length > 0
      ? avgPctArr.reduce((acc, v) => acc + v, 0) / avgPctArr.length
      : null;

  return {
    counts: {
      improve: improve.length,
      worsen: worsen.length,
      stable: stable.length,
      total: items.length,
    },
    topImprove: improve.slice(0, 3),
    topWorsen: worsen.slice(0, 3),
    avgPct: Number.isFinite(avgPct) ? avgPct : null,
    stablePct,
    hasData: items.length > 0,
  };
}

function renderObjectiveSummarySection(doc, summaryObj, { marginX, y }) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Resumen objetivo de evolución (determinista)", marginX, y);
  y += 14;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  if (!summaryObj?.hasData) {
    doc.text("—", marginX, y);
    return y + 16;
  }

  const c = summaryObj.counts || {};
  const lines = [
    `Marcadores evaluados: ${c.total ?? 0}`,
    `• Mejoran: ${c.improve ?? 0}`,
    `• Empeoran: ${c.worsen ?? 0}`,
    `• Estables (±${summaryObj.stablePct}%): ${c.stable ?? 0}`,
  ];
  if (summaryObj.avgPct != null) {
    lines.push(`Variación media (orientativa): ${formatPct(summaryObj.avgPct)}`);
  }

  doc.text(lines, marginX, y);
  y += lines.length * 12 + 10;

  const fmtItem = (it) =>
    `- ${safeText(it.name)} (${safeText(it.pastKey)} → actual): ${formatPct(
      it.pct
    )}`;

  if (summaryObj.topImprove?.length) {
    doc.setFont("helvetica", "bold");
    doc.text("Mejoras destacadas", marginX, y);
    y += 12;
    doc.setFont("helvetica", "normal");
    const l = summaryObj.topImprove.map(fmtItem);
    doc.text(l, marginX, y);
    y += l.length * 12 + 10;
  }

  if (summaryObj.topWorsen?.length) {
    doc.setFont("helvetica", "bold");
    doc.text("Empeoramientos destacados", marginX, y);
    y += 12;
    doc.setFont("helvetica", "normal");
    const l = summaryObj.topWorsen.map(fmtItem);
    doc.text(l, marginX, y);
    y += l.length * 12 + 10;
  }

  return y;
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

    const pastKey = pickMostRecentPastKey(row);
    if (!pastKey) continue;

    const past = row?.[pastKey];
    const p = Number(past);
    const b = Number(baseline);
    if (!Number.isFinite(p) || !Number.isFinite(b) || p === 0) continue;

    const pct = ((b - p) / p) * 100;
    if (Math.abs(pct) < stablePct) stable++;
    else if (pct > 0) improve++;
    else worsen++;
  }

  return {
    improve,
    worsen,
    stable,
    total: improve + worsen + stable,
    stablePct,
  };
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
  y += lines.length * 12 + 8;
  return y;
}

function renderLegend(doc, marginX, y) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Mejora | Empeora | Sin cambios", marginX, y);
  return y + 14;
}

// ========================
// PDF V2-lite — Portada clínica (FASE 2) + Resumen global determinista (Opción 1)
// ========================

function shortIdFromParts(patient, compare) {
  // ID corto NO criptográfico: suficiente para trazabilidad visual en PDF sin backend.
  // Si no hay datos, devuelve vacío.
  try {
    const base =
      safeText(patient?.id || "") +
      "|" +
      safeText(compare?.baseline?.analytic_id || "") +
      "|" +
      safeText(compare?.baseline?.date || "");
    if (!base.trim()) return "";
    let h = 0;
    for (let i = 0; i < base.length; i++) h = (h * 31 + base.charCodeAt(i)) >>> 0;
    return `G-${h.toString(16).toUpperCase().padStart(8, "0")}`;
  } catch {
    return "";
  }
}

function renderCoverPage(doc, { patient, compare, analytics }) {
  const marginX = 40;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  let y = 88;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("GALENOS.PRO", marginX, y);
  y += 18;

  doc.setFontSize(14);
  doc.text("INFORME CLÍNICO (APOYO A LA DECISIÓN)", marginX, y);
  y += 14;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    "Documento generado automáticamente a partir de datos registrados en la plataforma.",
    marginX,
    y
  );
  y += 22;

  // Identificación
  const idCorto = shortIdFromParts(patient, compare);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Identificación del informe", marginX, y);
  y += 12;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  const lastA = pickLatestAnalytic(analytics);
  const lastDate = lastA?.exam_date || lastA?.created_at || null;

  const windows = (() => {
    const markersObj = compare?.markers || {};
    const has18 = Object.values(markersObj).some((row) => row && row["18m"] != null);
    const has24 = Object.values(markersObj).some((row) => row && row["24m"] != null);
    const arr = ["6/12 meses"];
    if (has18 || has24) arr.push("18/24 meses (si aplica)");
    return arr.join(" + ");
  })();

  const lines1 = [
    `Fecha y hora (Madrid): ${nowMadridString()}`,
    idCorto ? `ID informe: ${idCorto}` : null,
    "Tipo: Comparativa temporal + Resumen IA + Notas clínicas",
  ].filter(Boolean);

  doc.text(lines1, marginX, y);
  y += lines1.length * 12 + 10;

  // Paciente
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Paciente", marginX, y);
  y += 12;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  const lines2 = [
    `Alias: ${safeText(patient?.alias || "—")}`,
    `Nº paciente: ${safeText(patient?.patient_number ?? "—")}`,
    patient?.id != null ? `ID interno: ${safeText(patient.id)}` : null,
  ].filter(Boolean);

  doc.text(lines2, marginX, y);
  y += lines2.length * 12 + 10;

  // Periodo
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Periodo analizado", marginX, y);
  y += 12;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  const baselineLine = compare?.baseline
    ? `Baseline: ${safeText(compare.baseline.date || "—")} · Analítica ID ${safeText(
        compare.baseline.analytic_id || "—"
      )}`
    : "Baseline: —";

  const lines3 = [
    baselineLine,
    `Ventanas: ${windows}`,
    lastDate
      ? `Última analítica disponible: ${toMadridInline(lastDate)}`
      : "Última analítica disponible: —",
  ];

  doc.text(lines3, marginX, y);
  y += lines3.length * 12 + 14;

  // Contenido
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Contenido del informe", marginX, y);
  y += 12;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const contentLines = [
    "• Resumen global de evolución (objetivo, determinista)",
    "• Resumen IA (orientativo) — última analítica",
    "• Comparativa temporal de marcadores (tabla)",
    "• Notas clínicas recientes (2–3)",
  ];
  doc.text(contentLines, marginX, y);
  y += contentLines.length * 12 + 18;

  // Aviso legal (caja)
  const boxX = marginX;
  const boxW = pageW - marginX * 2;
  const boxH = 92;
  const boxY = Math.min(y, pageH - 170);

  doc.setDrawColor(210);
  doc.setFillColor(245, 246, 248);
  doc.roundedRect(boxX, boxY, boxW, boxH, 6, 6, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("AVISO IMPORTANTE", boxX + 12, boxY + 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  const legal =
    "Este documento es un apoyo a la deliberación clínica. Galenos.pro no diagnostica ni prescribe. " +
    "Las secciones generadas por IA son orientativas y pueden contener errores o imprecisiones. " +
    "La interpretación y la decisión final corresponden al profesional sanitario responsable.";

  const legalLines = doc.splitTextToSize(legal, boxW - 24);
  doc.text(legalLines, boxX + 12, boxY + 34);

  // Pie
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Galenos.pro · Documento clínico interno · Hora Madrid", marginX, pageH - 38);
}

function renderNarrativeGlobalSummary(doc, { compare, stablePct = 2, marginX, y, wrapW }) {
  const global = computeGlobalObjectiveSummary(compare, stablePct);
  const obj = buildObjectiveDeltaSummary(compare, { stablePct });

  const topImprove = (obj?.topImprove || [])
    .map((x) => safeText(x.name))
    .filter(Boolean);
  const topWorsen = (obj?.topWorsen || [])
    .map((x) => safeText(x.name))
    .filter(Boolean);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Resumen global de evolución (objetivo)", marginX, y);
  y += 14;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  if (!global?.total || global.total === 0) {
    doc.text("No hay suficientes datos comparables para generar un resumen global.", marginX, y);
    return y + 16;
  }

  const line1 = `Se han evaluado ${global.total} marcadores: ${global.improve} mejoran, ${global.worsen} empeoran y ${global.stable} se mantienen estables (±${global.stablePct}%).`;
  const line2 = topImprove.length ? `Mejoras destacadas: ${topImprove.slice(0, 3).join(", ")}.` : "";
  const line3 = topWorsen.length ? `Empeoramientos destacados: ${topWorsen.slice(0, 3).join(", ")}.` : "";
  const line4 = obj?.avgPct != null ? `Variación media (orientativa): ${formatPct(obj.avgPct)}.` : "";

  const narrative = [line1, line2, line3, line4]
    .filter((s) => safeText(s))
    .join(" ");

  const lines = doc.splitTextToSize(narrative, wrapW);
  doc.text(lines, marginX, y);
  y += lines.length * 12 + 10;

  doc.setFontSize(9);
  doc.text("Nota: resumen calculado de forma determinista a partir de marcadores comparables.", marginX, y);
  return y + 14;
}

// ========================
// PDF — Generador (descarga)
// ========================

export async function generatePacientePDFV1({
  patient,
  compare,
  analytics,
  notes,
  mode = "download",
}) {
  const doc = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });

  const marginX = 40;
  const wrapW = 515;

  // ========================
  // Página 1 — Portada clínica (FASE 2)
  // ========================
  await addGalenosLogo(doc); // no bloqueante
  renderCoverPage(doc, { patient, compare, analytics });

  // ========================
  // Página 2 — Resumen global determinista + Resumen IA
  // ========================
  doc.addPage();
  await addGalenosLogo(doc); // no bloqueante

  let y = 60;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Informe clínico — Evolución y detalle", marginX, y);
  y += 18;

  // Resumen global narrativo (Opción 1, determinista)
  y = renderNarrativeGlobalSummary(doc, { compare, stablePct: 2, marginX, y, wrapW });

  // Resumen global numérico + leyenda (V1.6)
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

  // Resumen objetivo (V1.5) — determinista, sin IA
  const objSummary = buildObjectiveDeltaSummary(compare, { stablePct: 2 });
  y = renderObjectiveSummarySection(doc, objSummary, { marginX, y, wrapW });

  if (y > 720) {
    doc.addPage();
    y = 60;
  }

  // Comparativa
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
        // Colores por DELTA numérico: tolera basura tipográfica dentro del paréntesis.
        try {
          if (data.section === "body" && data.column && data.column.index >= 2) {
            const raw = data.cell && data.cell.text != null ? data.cell.text : "";
            const txt = Array.isArray(raw) ? raw.join(" ") : String(raw);

            // Ejemplos: (” +3.30), ( Δ -1.70 ), ( +0.10 )
            const m = txt.match(/\(\s*[^0-9+\-]*([+\-]?\d+(?:\.\d+)?)\s*\)/);
            if (!m) return;
            const delta = parseFloat(m[1]);
            if (Number.isNaN(delta)) return;

            if (delta > 0) {
              data.cell.styles.textColor = [0, 128, 0];
              data.cell.styles.fillColor = [232, 245, 233];
            } else if (delta < 0) {
              data.cell.styles.textColor = [200, 0, 0];
              data.cell.styles.fillColor = [255, 235, 238];
            }
          }
        } catch {
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

  const blob = doc.output("blob");

  // Descarga directa (se elimina la complejidad de "compartir" dentro de la app).
  // Si el usuario quiere compartir, puede hacerlo desde su dispositivo tras la descarga.
  doc.save(fileName);

  return { blob, fileName };
}
