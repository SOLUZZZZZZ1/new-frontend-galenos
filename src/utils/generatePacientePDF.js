import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const GALENOS_LOGO_URL = "/galenos-logo.png";

function nowMadridString() {
  try { return new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" }); }
  catch { return new Date().toLocaleString("es-ES"); }
}

function safeText(v) {
  return (v == null ? "" : String(v)).replace(/\s+/g, " ").trim();
}

function toMadridInline(value) {
  if (!value) return "";
  const iso = typeof value === "string" && value.endsWith("Z") ? value : `${value}Z`;
  try { return new Date(iso).toLocaleString("es-ES", { timeZone: "Europe/Madrid" }); }
  catch { return String(value); }
}

async function fetchAsDataUrl(url) {
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
  try {
    const dataUrl = await fetchAsDataUrl(GALENOS_LOGO_URL);
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 40;
    const size = 44;
    const x = pageW - margin - size;
    const y = 28;
    doc.addImage(dataUrl, "PNG", x, y, size, size);
  } catch {
    // no-op
  }
}

function addFooterDisclaimer(doc, text, { marginX = 40, wrapW = 515, fontSize = 9, bottom = 34 } = {}) {
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(fontSize);
  const lines = doc.splitTextToSize(String(text || ""), wrapW);
  const lineH = 11;
  const blockH = lines.length * lineH;
  const y = pageH - bottom - blockH;
  doc.text(lines, marginX, Math.max(60, y));
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

  const has18 = Object.values(markersObj).some((row) => row && row["18m"] != null);
  const has24 = Object.values(markersObj).some((row) => row && row["24m"] != null);

  const head = ["Marcador", "Actual", "6m", "12m"];
  if (has18) head.push("18m");
  if (has24) head.push("24m");

  const body = Object.entries(markersObj).map(([name, row]) => {
    const tr = row?.trend || {};
    const b = row?.baseline;

    const classify = (sym, delta) => {
      const s = safeText(sym || "");
      if (s.includes("↑")) return "IMPROVE";
      if (s.includes("↓")) return "WORSEN";
      if (s === "=") return "STABLE";
      if (delta == null) return "STABLE";
      if (delta > 0) return "IMPROVE";
      if (delta < 0) return "WORSEN";
      return "STABLE";
    };

    const cell = (k) => {
      const vPast = row?.[k];
      const sym = tr[k] || "";
      const delta = vPast == null || b == null ? null : b - vPast;
      const deltaTxt =
        delta == null
          ? ""
          : ` (Δ ${delta >= 0 ? "+" : ""}${Number(delta).toFixed(2)})`;

      const status = classify(sym, delta);
      const token = ` [[SR:${status}]]`;

      // Deja espacio para el círculo
      return `   ${vPast ?? "—"}${deltaTxt}${token}`.trimEnd();
    };

    const r = [safeText(name), safeText(b ?? "—"), cell("6m"), cell("12m")];
    if (has18) r.push(cell("18m"));
    if (has24) r.push(cell("24m"));
    return r;
  });

  return { head, body };
}


function pickMostRecentPastKey(row) {
  const order = ["6m", "12m", "18m", "24m"];
  for (const k of order) if (row && row[k] != null && row[k] !== "") return k;
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
    if (!Number.isFinite(pNum) || !Number.isFinite(bNum) || pNum == 0) continue;

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
    items.push({ name: safeText(name), pastKey, pct, absPct, cls });
  }

  const improve = items.filter((x) => x.cls === "improve").sort((a, b) => b.absPct - a.absPct);
  const worsen = items.filter((x) => x.cls === "worsen").sort((a, b) => b.absPct - a.absPct);
  const stable = items.filter((x) => x.cls === "stable");

  const avgPctArr = items.map((x) => x.pct).filter((v) => Number.isFinite(v));
  const avgPct = avgPctArr.length ? avgPctArr.reduce((acc, v) => acc + v, 0) / avgPctArr.length : null;

  return {
    counts: { improve: improve.length, worsen: worsen.length, stable: stable.length, total: items.length },
    topImprove: improve.slice(0, 3),
    topWorsen: worsen.slice(0, 3),
    avgPct: Number.isFinite(avgPct) ? avgPct : null,
    stablePct,
    hasData: items.length > 0,
  };
}

function computeGlobalObjectiveSummary(compareObj, stablePct = 2) {
  const markersObj = compareObj?.markers || {};
  let improve = 0, worsen = 0, stable = 0;

  for (const row of Object.values(markersObj)) {
    const baseline = row?.baseline;
    if (baseline == null) continue;
    const pastKey = pickMostRecentPastKey(row);
    if (!pastKey) continue;

    const past = row?.[pastKey];
    const p = Number(past);
    const b = Number(baseline);
    if (!Number.isFinite(p) || !Number.isFinite(b) || p == 0) continue;

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
  y += lines.length * 12 + 8;
  return y;
}

function renderLegend(doc, marginX, y) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Mejora | Empeora | Sin cambios", marginX, y);
  return y + 14;
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
  if (summaryObj.avgPct != null) lines.push(`Variación media (orientativa): ${formatPct(summaryObj.avgPct)}`);
  doc.text(lines, marginX, y);
  y += lines.length * 12 + 10;

  const fmtItem = (it) => `- ${safeText(it.name)} (${safeText(it.pastKey)} → actual): ${formatPct(it.pct)}`;

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

// ===== Portada (FASE 2) =====
function shortIdFromParts(patient, compare) {
  try {
    const base = safeText(patient?.id || "") + "|" + safeText(compare?.baseline?.analytic_id || "") + "|" + safeText(compare?.baseline?.date || "");
    if (!base.trim()) return "";
    let h = 0;
    for (let i = 0; i < base.length; i++) h = (h * 31 + base.charCodeAt(i)) >>> 0;
    return `G-${h.toString(16).toUpperCase().padStart(8, "0")}`;
  } catch { return ""; }
}

function renderCoverPage(doc, { patient, compare, analytics }) {
  const marginX = 40;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  let y = 88;

  doc.setFont("helvetica", "bold"); doc.setFontSize(22);
  doc.text("GALENOS.PRO", marginX, y); y += 18;
  doc.setFontSize(14);
  doc.text("INFORME CLÍNICO (APOYO A LA DECISIÓN)", marginX, y); y += 14;

  doc.setFont("helvetica", "normal"); doc.setFontSize(10);
  doc.text("Documento generado automáticamente a partir de datos registrados en la plataforma.", marginX, y);
  y += 22;

  const idCorto = shortIdFromParts(patient, compare);
  doc.setFont("helvetica", "bold"); doc.setFontSize(11);
  doc.text("Identificación del informe", marginX, y); y += 12;

  doc.setFont("helvetica", "normal"); doc.setFontSize(10);
  const lastA = pickLatestAnalytic(analytics);
  const lastDate = lastA?.exam_date || lastA?.created_at || null;

  const markersObj = compare?.markers || {};
  const has18 = Object.values(markersObj).some((row) => row && row["18m"] != null);
  const has24 = Object.values(markersObj).some((row) => row && row["24m"] != null);
  const windows = ["6/12 meses", (has18 || has24) ? "18/24 meses (si aplica)" : null].filter(Boolean).join(" + ");

  const lines1 = [
    `Fecha y hora (Madrid): ${nowMadridString()}`,
    idCorto ? `ID informe: ${idCorto}` : null,
    "Tipo: V2.0 (Prioridades clínicas + Sistemas) + Comparativa + Resumen IA + Notas",
  ].filter(Boolean);
  doc.text(lines1, marginX, y); y += lines1.length * 12 + 10;

  doc.setFont("helvetica", "bold"); doc.setFontSize(11);
  doc.text("Paciente", marginX, y); y += 12;
  doc.setFont("helvetica", "normal"); doc.setFontSize(10);
  const lines2 = [
    `Alias: ${safeText(patient?.alias || "—")}`,
    `Nº paciente: ${safeText(patient?.patient_number ?? "—")}`,
    patient?.id != null ? `ID interno: ${safeText(patient.id)}` : null,
  ].filter(Boolean);
  doc.text(lines2, marginX, y); y += lines2.length * 12 + 10;

  doc.setFont("helvetica", "bold"); doc.setFontSize(11);
  doc.text("Periodo analizado", marginX, y); y += 12;
  doc.setFont("helvetica", "normal"); doc.setFontSize(10);
  const baselineLine = compare?.baseline
    ? `Baseline: ${safeText(compare.baseline.date || "—")} · Analítica ID ${safeText(compare.baseline.analytic_id || "—")}`
    : "Baseline: —";
  const lines3 = [
    baselineLine,
    `Ventanas: ${windows}`,
    lastDate ? `Última analítica disponible: ${toMadridInline(lastDate)}` : "Última analítica disponible: —",
  ];
  doc.text(lines3, marginX, y); y += lines3.length * 12 + 14;

  doc.setFont("helvetica", "bold"); doc.setFontSize(11);
  doc.text("Contenido del informe", marginX, y); y += 12;
  doc.setFont("helvetica", "normal"); doc.setFontSize(10);
  doc.text([
    "• Prioridades clínicas (determinista)",
    "• Resumen por sistemas (determinista)",
    "• Resumen global + resumen IA (orientativo)",
    "• Tabla comparativa temporal de marcadores",
    "• Notas clínicas recientes (2–3)",
  ], marginX, y);
  y += 18 + 5*12;

  const boxX = marginX;
  const boxW = pageW - marginX * 2;
  const boxH = 92;
  const boxY = Math.min(y, pageH - 170);

  doc.setDrawColor(210);
  doc.setFillColor(245, 246, 248);
  doc.roundedRect(boxX, boxY, boxW, boxH, 6, 6, "FD");

  doc.setFont("helvetica", "bold"); doc.setFontSize(10);
  doc.text("AVISO IMPORTANTE", boxX + 12, boxY + 18);

  doc.setFont("helvetica", "normal"); doc.setFontSize(9);
  const legal =
    "Este documento es un apoyo a la deliberación clínica. Galenos.pro no diagnostica ni prescribe. " +
    "Las secciones generadas por IA son orientativas y pueden contener errores o imprecisiones. " +
    "La interpretación y la decisión final corresponden al profesional sanitario responsable.";
  const legalLines = doc.splitTextToSize(legal, boxW - 24);
  doc.text(legalLines, boxX + 12, boxY + 34);

  doc.setFont("helvetica", "normal"); doc.setFontSize(9);
  doc.text("Galenos.pro · Documento clínico interno · Hora Madrid", marginX, pageH - 38);
}

// ===== V2.0 Prioridades + Sistemas =====
function normalizeKey(s) { return (s || "").toString().toLowerCase(); }

function classifySystem(markerName) {
  const n = normalizeKey(markerName);
  const renal = ["creatinina","urea","filtrat glomerular","filtrado glomerular","aclarament de creatinina","aclarament d'urea","proteinúria","proteinuria","proteïnúria","proteïnùria","quocient prote","densitat","ph orina","volum orina","creatinina orina","urea orina"];
  const metab = ["glucosa","hemoglobina glicada","hba1c","colesterol","triglic","ldl","hdl","uric","àcid úric","sodi","potassi","calci","fòsfor","fosfor","vitamina d"];
  const hema = ["hemoglobina","hematòcrit","hematocrit","hematies","leuc","neutr","limf","mon","eosin","basòf","basof","plaquet","ferritina","ferro","transferrina","reticul","índex dispersió","index dispersio"];
  const acid = ["co2","bicarbonat","bicarbonato","pressió parcial co2","presión parcial co2","exces de base","excés de base","ph "];
  if (renal.some((k) => n.includes(k))) return "Renal / Orina";
  if (acid.some((k) => n.includes(k))) return "Ácido–Base / Respiratorio";
  if (metab.some((k) => n.includes(k))) return "Metabólico / Cardiovascular";
  if (hema.some((k) => n.includes(k))) return "Hematológico / Hierro";
  return "Otros";
}

function computeSystemBuckets(compareObj, stablePct = 2) {
  const markersObj = compareObj?.markers || {};
  const buckets = {};
  for (const [name, row] of Object.entries(markersObj)) {
    const baseline = row?.baseline;
    const pastKey = pickMostRecentPastKey(row);
    if (baseline == null || !pastKey) continue;
    const past = row?.[pastKey];
    const p = Number(past);
    const b = Number(baseline);
    if (!Number.isFinite(p) || !Number.isFinite(b) || p === 0) continue;
    const pct = ((b - p) / p) * 100;
    const sys = classifySystem(name);
    if (!buckets[sys]) buckets[sys] = { improve: 0, worsen: 0, stable: 0, total: 0 };
    buckets[sys].total += 1;
    if (Math.abs(pct) < stablePct) buckets[sys].stable += 1;
    else if (pct > 0) buckets[sys].improve += 1;
    else buckets[sys].worsen += 1;
  }
  return buckets;
}

function systemStatusLine(sysName, s, stablePct) {
  if (!s || !s.total) return `${sysName}: sin datos comparables.`;

  let label = "sin cambios relevantes";
  if (s.improve >= 1 && s.worsen >= 1) label = "mixto / a vigilar";
  else if (s.worsen >= 2 && s.worsen > s.improve) label = "cambios relevantes detectados";
  else if (s.improve >= 2 && s.improve > s.worsen) label = "mejoría global";
  else if (s.worsen === 1 && s.improve === 0) label = "cambio puntual a vigilar";

  return `${sysName}: ${label} (Mejoran: ${s.improve} · Empeoran: ${s.worsen} · Estables: ${s.stable} · n=${s.total} · ±${stablePct}%).`;
}

function renderV2PrioritiesAndSystems(doc, { compare, marginX, y, wrapW, stablePct = 2 }) {
  const obj = buildObjectiveDeltaSummary(compare, { stablePct });

  doc.setFont("helvetica", "bold"); doc.setFontSize(12);
  doc.text("Prioridades clínicas", marginX, y); y += 14;
  doc.setFont("helvetica", "normal"); doc.setFontSize(10);

  if (!obj?.hasData) {
    doc.text("No hay suficientes datos comparables para priorizar marcadores.", marginX, y);
    y += 16;
  } else {
    const worsenNames = (obj.topWorsen || []).map((x) => safeText(x.name)).filter(Boolean).slice(0, 5);
    const improveNames = (obj.topImprove || []).map((x) => safeText(x.name)).filter(Boolean).slice(0, 5);

    const priText = worsenNames.length ? `Empeoramientos relevantes (top): ${worsenNames.join(", ")}.` : "No se detectan empeoramientos relevantes según el umbral configurado.";
    const priLines = doc.splitTextToSize(priText, wrapW);
    doc.text(priLines, marginX, y); y += priLines.length * 12 + 6;

    if (improveNames.length) {
      const impText = `Mejoras relevantes (top): ${improveNames.join(", ")}.`;
      const impLines = doc.splitTextToSize(impText, wrapW);
      doc.text(impLines, marginX, y); y += impLines.length * 12 + 8;
    } else y += 6;
  }

  doc.setFont("helvetica", "bold"); doc.setFontSize(12);
  doc.text("Resumen por sistemas", marginX, y); y += 14;
  doc.setFont("helvetica", "normal"); doc.setFontSize(10);

  const buckets = computeSystemBuckets(compare, stablePct);
  const order = ["Renal / Orina","Ácido–Base / Respiratorio","Metabólico / Cardiovascular","Hematológico / Hierro","Otros"];
  const lines = order.filter((k) => buckets[k]).map((k) => systemStatusLine(k, buckets[k], stablePct));

  if (!lines.length) {
    doc.text("No hay suficientes datos comparables para generar el resumen por sistemas.", marginX, y);
    y += 16;
  } else {
    doc.text(lines, marginX, y);
    y += lines.length * 12 + 10;
  }
  return y;
}

// ===== Differential normalization =====
function normalizeDifferential(d) {
  if (!d) return [];
  if (Array.isArray(d)) return d.map((x) => safeText(String(x)));
  if (typeof d === "string") {
    const s = d.trim();
    if ((s.startsWith("[") && s.endsWith("]")) || (s.startsWith("{") && s.endsWith("}"))) {
      try {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed)) return parsed.map((x) => safeText(String(x)));
      } catch {}
    }
    return [safeText(s)];
  }
  return [safeText(String(d))];
}

// ========================
// PDF V2.0 — Generador (descarga directa)
// ========================
export async function generatePacientePDFV1({ patient, compare, analytics, notes }) {
  const doc = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
  const marginX = 40;
  const wrapW = 515;

  // Página 1 — Portada SIEMPRE
  await addGalenosLogo(doc);
  renderCoverPage(doc, { patient, compare, analytics });

  // Página 2 — Contenido V2.0
  doc.addPage();
  await addGalenosLogo(doc);

  let y = 60;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Informe clínico — Evolución y detalle", marginX, y);
  y += 18;

  y = renderV2PrioritiesAndSystems(doc, { compare, marginX, y, wrapW, stablePct: 2 });

  const globalSummary = computeGlobalObjectiveSummary(compare, 2);
  y = renderGlobalObjectiveSummary(doc, globalSummary, marginX, y);
  y = renderLegend(doc, marginX, y);

  const lastA = pickLatestAnalytic(analytics);
  const summary = safeText(lastA?.summary || "");
  const differentialRaw = lastA?.differential ?? "";
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

  const diffs = normalizeDifferential(differentialRaw).filter(Boolean);
  if (diffs.length) {
    doc.setFont("helvetica", "bold");
    doc.text("Diagnóstico diferencial (orientativo)", marginX, y);
    y += 14;

    doc.setFont("helvetica", "normal");
    const bulletLines = diffs.map((d) => `• ${d}`);
    doc.text(bulletLines, marginX, y);
    y += bulletLines.length * 12 + 10;
  }

  const objSummary = buildObjectiveDeltaSummary(compare, { stablePct: 2 });
  y = renderObjectiveSummarySection(doc, objSummary, { marginX, y, wrapW });

  if (y > 720) {
    doc.addPage();
    await addGalenosLogo(doc);
    y = 60;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Comparativa temporal de marcadores", marginX, y);
  y += 12;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("● mejora · ● empeora · ● a vigilar · ● estable", marginX, y);
  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  const hasComparableData = compare && compare.markers && Object.keys(compare.markers).length > 0;

  if (hasComparableData) {
    const table = buildCompareTable(compare);
    autoTable(doc, {
      startY: y,
      head: [table.head],
      body: table.body,
      theme: "grid",
      styles: { font: "helvetica", fontSize: 8, cellPadding: 3, overflow: "linebreak" },
      headStyles: { fontStyle: "bold" },
      didParseCell: function (data) {
  try {
    if (data.section !== "body") return;

    const raw = data.cell && data.cell.text != null ? data.cell.text : "";
    const txt = Array.isArray(raw) ? raw.join(" ") : String(raw);

    const m = txt.match(/\[\[SR:(IMPROVE|WORSEN|STABLE|UNCERTAIN)\]\]/);
    if (m) {
      data.cell._srStatus = m[1];
      const clean = txt.replace(/\s*\[\[SR:(?:IMPROVE|WORSEN|STABLE|UNCERTAIN)\]\]\s*/g, "");
      data.cell.text = [clean];
    } else {
      data.cell._srStatus = "STABLE";
    }

    if (data.column && data.column.index >= 2) {
      const t = Array.isArray(data.cell.text) ? data.cell.text.join(" ") : String(data.cell.text || "");
      if (!t.startsWith("   ")) data.cell.text = ["   " + t];
    }
  } catch {
    // no-op
  }
},
didDrawCell: function (data) {
  try {
    if (data.section !== "body") return;
    if (!data.column || data.column.index < 2) return;

    const status = data.cell && data.cell._srStatus ? String(data.cell._srStatus) : "STABLE";

    const x = data.cell.x;
    const y = data.cell.y;
    const h = data.cell.height;

    const cx = x + 7.5;
    const cy = y + h / 2;
    const r = 3.2;

    if (status === "IMPROVE") doc.setFillColor(34, 197, 94);
    else if (status === "WORSEN") doc.setFillColor(239, 68, 68);
    else if (status === "UNCERTAIN") doc.setFillColor(245, 158, 11);
    else doc.setFillColor(148, 163, 184);

    doc.circle(cx, cy, r, "F");
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
    doc.text("La comparativa temporal completa de marcadores está disponible en la plataforma web de Galenos.pro.", marginX, y);
    y += 24;
  }

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
        await addGalenosLogo(doc);
        y = 60;
      }
    }
  }

  const footerDisclaimer =
    "Documento de apoyo a la deliberación clínica. " +
    "La decisión final corresponde al profesional sanitario responsable.";

  const pageH = doc.internal.pageSize.getHeight();
  if (y > pageH - 120) {
    doc.addPage();
    await addGalenosLogo(doc);
    y = 60;
  }
  addFooterDisclaimer(doc, footerDisclaimer, { marginX, wrapW, fontSize: 9 });

  const fileName = `Galenos_${safeText(patient?.alias || "paciente")}_comparativa.pdf`.replace(/[^a-zA-Z0-9._-]+/g, "_");
  doc.save(fileName);
  return { fileName };
}