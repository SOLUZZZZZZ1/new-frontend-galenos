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

function addFooterDisclaimer(doc, text, { marginX = 40, wrapW = 515, fontSize = 9, bottom = 34 } = {}) {

// Disclaimer final (corto y envuelto)
// Nota: el aviso largo ya está en portada; aquí repetimos versión corta, siempre visible.
const footerDisclaimer =
  "Documento de apoyo a la deliberación clínica. " +
  "La decisión final corresponde al profesional sanitario responsable.";

// Si estamos muy abajo, saltamos de página antes de imprimir el pie.
const pageH = doc.internal.pageSize.getHeight();
if (y > pageH - 120) {
  doc.addPage();
  y = 60;
  await addGalenosLogo(doc); // OK: estamos dentro de una función async
}

addFooterDisclaimer(doc, footerDisclaimer, { marginX, wrapW, fontSize: 9 });

const fileName = `Galenos_${safeText(patient?.alias || "paciente")}_comparativa.pdf`
    .replace(/[^a-zA-Z0-9._-]+/g, "_");

  const blob = doc.output("blob");

  // Descarga directa (se elimina la complejidad de "compartir" dentro de la app).
  // Si el usuario quiere compartir, puede hacerlo desde su dispositivo tras la descarga.
  doc.save(fileName);

  return { blob, fileName };
}
