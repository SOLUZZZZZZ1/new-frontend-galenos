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
// PDF V2 — Resumen longitudinal (automático, determinista)
// ========================

function domainForMarkerName(nameRaw) {
  const n = safeText(nameRaw).toLowerCase();
  const hasAny = (arr) => arr.some((k) => n.includes(k));

  if (
    hasAny([
      "creatinina",
      "urea",
      "filtrat",
      "filtrado",
      "aclarament",
      "aclaramiento",
      "protein",
      "albumin",
      "quocient",
      "cocient",
      "cociente",
    ])
  ) {
    return "renal";
  }
  if (hasAny(["colesterol", "ldl", "hdl", "triglic"])) return "lipidos";
  if (hasAny(["glucosa", "glicada", "hba1c", "hemoglobina glicada"]))
    return "glucosa";
  if (hasAny(["c reactiva", "pcr", "proteïna c", "proteina c"]))
    return "inflamacion";
  if (
    hasAny([
      "ph",
      "bicarbon",
      "co2",
      "exces de base",
      "excés de base",
      "pressió parcial",
      "presion parcial",
    ])
  ) {
    return "acido_base";
  }
  if (
    hasAny([
      "hemoglob",
      "hemat",
      "leuc",
      "plaquet",
      "neutr",
      "limf",
      "reticul",
      "monoc",
      "eosin",
      "baso",
    ])
  ) {
    return "hematologia";
  }
  if (
    hasAny([
      "vitamina d",
      "pth",
      "parathormona",
      "calci",
      "calcio",
      "fòsfor",
      "fosfor",
    ])
  ) {
    return "mineral_oseo";
  }
  if (
    hasAny([
      "ferritina",
      "ferro",
      "hierro",
      "transferrina",
      "saturació",
      "saturacion",
    ])
  ) {
    return "hierro";
  }
  return "otros";
}

function prettyDomain(domainKey) {
  switch (domainKey) {
    case "renal":
      return "función renal";
    case "lipidos":
      return "perfil lipídico";
    case "glucosa":
      return "glucosa / HbA1c";
    case "inflamacion":
      return "inflamación";
    case "acido_base":
      return "equilibrio ácido–base / respiratorio";
    case "hematologia":
      return "hemograma";
    case "mineral_oseo":
      return "metabolismo mineral–óseo";
    case "hierro":
      return "metabolismo del hierro";
    default:
      return "otros marcadores";
  }
}

function buildLongitudinalSummaryV2(compareObj, { stablePct = 2 } = {}) {
  const markersObj = compareObj?.markers || {};

  const domainStats = new Map(); // domain -> {improve,worsen,stable,total}
  const add = (domain, cls) => {
    const cur =
      domainStats.get(domain) || { improve: 0, worsen: 0, stable: 0, total: 0 };
    cur.total += 1;
    cur[cls] += 1;
    domainStats.set(domain, cur);
  };

  for (const [name, row] of Object.entries(markersObj)) {
    const baseline = row?.baseline;
    if (baseline == null) continue;

    const pastKey = pickMostRecentPastKey(row);
    if (!pastKey) continue;

    const past = row?.[pastKey];
    const p = Number(past);
    const b = Number(baseline);
    if (!Number.isFinite(p) || !Number.isFinite(b) || p === 0) continue;

    const pct = ((b - p) / p) * 100;
    let cls = "stable";
    if (Math.abs(pct) >= stablePct) cls = pct > 0 ? "improve" : "worsen";

    const domain = domainForMarkerName(name);
    add(domain, cls);
  }

  const scored = Array.from(domainStats.entries())
    .map(([domain, s]) => {
      const change = s.improve + s.worsen;
      const balance = s.worsen - s.improve; // + => peor
      const score = change * 10 + s.total;
      return { domain, s, change, balance, score };
    })
    .sort((a, b) => b.score - a.score);

  const top = scored.slice(0, 3);

  const global = scored.reduce(
    (acc, d) => {
      acc.improve += d.s.improve;
      acc.worsen += d.s.worsen;
      acc.stable += d.s.stable;
      acc.total += d.s.total;
      return acc;
    },
    { improve: 0, worsen: 0, stable: 0, total: 0 }
  );

  let globalTrend = "mixta";
  if (global.total > 0) {
    if (global.improve > global.worsen + 2) globalTrend = "favorable";
    else if (global.worsen > global.improve + 2) globalTrend = "desfavorable";
  }

  const lines = [];
  lines.push(
    `Tendencia global: ${globalTrend} (mejoran ${global.improve}, empeoran ${global.worsen}, estables ${global.stable}).`
  );

  if (top.length > 0) {
    const parts = top.map(({ domain, s, balance }) => {
      let tag = "estable";
      if (balance >= 2) tag = "desfavorable";
      else if (balance <= -2) tag = "favorable";
      return `${prettyDomain(domain)}: ${tag} (↑${s.improve} ↓${s.worsen} =${s.stable})`;
    });
    lines.push(`Dominios principales: ${parts.join(" · ")}.`);
  }

  if (globalTrend === "desfavorable") {
    lines.push(
      "Se recomienda seguimiento clínico continuado y revisión de los dominios con tendencia desfavorable."
    );
  } else if (globalTrend === "favorable") {
    lines.push(
      "La evolución global sugiere mejoría en varios dominios, manteniendo seguimiento según criterio clínico."
    );
  } else {
    lines.push(
      "La evolución global es mixta; mantener seguimiento y contextualizar con clínica y antecedentes."
    );
  }

  lines.push(
    "Nota: Resumen automático basado en variaciones de marcadores. No diagnostica ni prescribe."
  );

  return lines;
}

function renderLongitudinalSummaryV2(doc, lines, { marginX, y, wrapW }) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Resumen longitudinal (automático) — V2", marginX, y);
  y += 14;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  const text = lines.join(" ");
  const wrapped = doc.splitTextToSize(text, wrapW);
  doc.text(wrapped, marginX, y);
  y += wrapped.length * 12 + 10;

  return y;
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

// Resumen longitudinal (automático) — V2 (determinista)
const v2Lines = buildLongitudinalSummaryV2(compare, { stablePct: 2 });
y = renderLongitudinalSummaryV2(doc, v2Lines, { marginX, y, wrapW });

if (y > 720) {
  doc.addPage();
  y = 60;
}


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
