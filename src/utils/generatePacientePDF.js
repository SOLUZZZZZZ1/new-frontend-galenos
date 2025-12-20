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

function pickMostRecentPastKey(row) {
  // Preferimos el periodo más reciente disponible (6m > 12m > 18m > 24m)
  const order = ["6m", "12m", "18m", "24m"];
  for (const k of order) {
    if (row && row[k] != null && row[k] !== "") return k;
  }
  return null;
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

function renderObjectiveSummarySection(doc, summaryObj, { marginX, y, wrapW }) {
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
    `- ${safeText(it.name)} (${safeText(it.pastKey)} → actual): ${formatPct(it.pct)}`;

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
// PDF V1.6 — Resumen global objetivo + leyenda (A)
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

    add(domainForMarkerName(name), cls);
  }

  const scored = Array.from(domainStats.entries())
    .map(([domain, s]) => {
      const change = s.improve + s.worsen;
      const balance = s.worsen - s.improve; // + => peor
      const score = change * 10 + s.total;
      return { domain, s, balance, score };
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

  // IMPORTANTE: texto 100% ASCII (sin flechas) para evitar símbolos raros
  const lines = [];
  lines.push(
    `Tendencia global: ${globalTrend} (mejoran ${global.improve}, empeoran ${global.worsen}, estables ${global.stable}).`
  );

  if (top.length > 0) {
    const parts = top.map(({ domain, s, balance }) => {
      let tag = "estable";
      if (balance >= 2) tag = "desfavorable";
      else if (balance <= -2) tag = "favorable";
      return `${prettyDomain(domain)}: ${tag} (+${s.improve} -${s.worsen} =${s.stable})`;
    });
    lines.push(`Dominios principales: ${parts.join(" | ")}.`);
  }

  if (globalTrend === "desfavorable") {
    lines.push(
      "Seguimiento clínico continuado y revisión de los dominios con tendencia desfavorable."
    );
  } else if (globalTrend === "favorable") {
    lines.push(
      "La evolución global sugiere mejoría en varios dominios; mantener seguimiento según criterio clínico."
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

  // Render por líneas, con wrap y salto de página si hace falta
  for (const part of lines) {
    const wrapped = doc.splitTextToSize(String(part), wrapW);
    doc.text(wrapped, marginX, y);
    y += wrapped.length * 12 + 6;

    if (y > 740) {
      doc.addPage();
      y = 60;
    }
  }

  return y + 4;
}

// ========================
// PDF V1 — (IA + comparativa + notas)
// ========================

export async function generatePacientePDFV1({ patient, compare, analytics, notes }) {
  const doc = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });

  // Logo corporativo (no bloqueante)
  await addGalenosLogo(doc);

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

  // Resumen global + leyenda (V1.6)
  const globalSummary = computeGlobalObjectiveSummary(compare, 2);
  y = renderGlobalObjectiveSummary(doc, globalSummary, marginX, y);
  y = renderLegend(doc, marginX, y);

  // V2 longitudinal (determinista)
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

  doc.save(fileName);
}
