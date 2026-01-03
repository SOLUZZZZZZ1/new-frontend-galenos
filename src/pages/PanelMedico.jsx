// src/pages/PanelMedico.jsx — Panel médico con Analíticas + Imágenes · Galenos.pro
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MskAtlasOverlay from "../components/MskAtlasOverlay";
import VascularOverlayReal from "../components/VascularOverlayReal";



// URL del backend de Galenos (Render)
const API =
  import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

export default function PanelMedico() {
  const navigate = useNavigate();

  const token = localStorage.getItem("galenos_token");

  // ========================
  // ESTADO PLAN PRO / STRIPE (simple, botón siempre visible)
  // ========================
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState("");

  // ========================
  // GATING PRO (trial expirado)
  // El backend decide (402 + detail PRO_REQUIRED_TRIAL_EXPIRED en escrituras)
  // Aquí lo reflejamos en UI para guiar al médico y evitar errores repetidos.
  // ========================
  const [trialExpired, setTrialExpired] = useState(false);
  const [proGateMsg, setProGateMsg] = useState("");

  async function handleStripeCheckout() {
    setBillingError("");

    if (!token) {
      setBillingError("No hay sesión activa. Vuelve a iniciar sesión.");
      navigate("/login");
      return;
    }

    // Compatibilidad:
    // - backend antiguo: /billing/create-checkout-session-auth
    // - backend nuevo (Stripe FINAL): /billing/create-checkout-session
    const endpoints = [
      `${API}/billing/create-checkout-session-auth`,
      `${API}/billing/create-checkout-session`,
    ];

    try {
      setBillingLoading(true);

      let lastRaw = "";
      let lastStatus = 0;

      for (const url of endpoints) {
        const res = await fetch(url, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        lastStatus = res.status;
        lastRaw = await res.text();

        console.log("👉 [Billing] Respuesta checkout (raw):", lastRaw);

        // Si el endpoint no existe (404) probamos el siguiente
        if (res.status === 404) continue;

        if (!res.ok) {
          let msg = "No se ha podido iniciar el pago con Stripe.";
          try {
            const errData = JSON.parse(lastRaw);
            if (errData.detail === "PROFILE_REQUIRED") {
              msg =
                "Antes de activar Galenos PRO, completa tu Perfil médico (nombre, especialidad, colegiado...).";
            } else if (errData.detail) {
              msg = errData.detail;
            }
          } catch {
            // si no es JSON, dejamos el mensaje genérico
          }
          setBillingError(msg);
          return;
        }

        let data;
        try {
          data = JSON.parse(lastRaw);
        } catch {
          setBillingError("Respuesta inesperada del servidor de pagos.");
          return;
        }

        if (data.checkout_url) {
          window.location.href = data.checkout_url;
          return;
        } else {
          setBillingError("No se ha recibido la URL de pago de Stripe.");
          return;
        }
      }

      // Si llegamos aquí, ninguno de los endpoints respondió correctamente
      setBillingError(
        lastStatus === 404
          ? "El backend de pagos no está disponible (endpoint no encontrado)."
          : "No se ha podido iniciar el pago con Stripe."
      );
    } catch (err) {
      console.error("❌ Error iniciando checkout Stripe:", err);
      setBillingError("Error de conexión al iniciar el pago con Stripe.");
    } finally {
      setBillingLoading(false);
    }
  }

  async function handleOpenBillingPortal() {
    setBillingError("");

    if (!token) {
      setBillingError("No hay sesión activa. Vuelve a iniciar sesión.");
      navigate("/login");
      return;
    }

    try {
      setBillingLoading(true);
      const res = await fetch(`${API}/billing/portal`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const raw = await res.text();
      console.log("👉 [Billing] Respuesta portal (raw):", raw);

      if (!res.ok) {
        let msg =
          "No se ha podido abrir la gestión de suscripción. Si aún no has activado PRO, primero completa el pago.";
        try {
          const errData = JSON.parse(raw);
          if (errData.detail) {
            if (Array.isArray(errData.detail)) {
              msg = errData.detail.map((d) => d?.msg || d?.type || "Error").join(" · ");
            } else {
              msg = errData.detail;
            }
          }
        } catch {}
        if (msg === "No hay cliente Stripe asociado") {
          msg = "Aún no hay una suscripción PRO activa para gestionar. Si quieres cancelar o cambiar tarjeta, primero activa Galenos PRO.";
        }
        setBillingError(msg);
        return;
      }

      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        setBillingError("Respuesta inesperada del portal de suscripción.");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        setBillingError("No se ha recibido la URL del portal de Stripe.");
      }
    } catch (err) {
      console.error("❌ Error abriendo portal Stripe:", err);
      setBillingError("Error de conexión al abrir la gestión de suscripción.");
    } finally {
      setBillingLoading(false);
    }
  }

  // ========================
  // ESTADO PACIENTES (para el select)
  // ========================
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientsError, setPatientsError] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [newPatientAlias, setNewPatientAlias] = useState("");
  const [creatingPatient, setCreatingPatient] = useState(false);

  async function loadPatients() {
    setPatientsError("");
    const t = localStorage.getItem("galenos_token");
    if (!t) {
      setPatientsError("No hay sesión activa. Vuelve a iniciar sesión.");
      return;
    }
    try {
      setPatientsLoading(true);
      const res = await fetch(`${API}/patients`, {
        headers: {
          Authorization: `Bearer ${t}`,
        },
      });
      const raw = await res.text();
      console.log("👉 [PanelMedico] /patients (raw):", raw);
      if (!res.ok) {
        let msg = "No se han podido cargar los pacientes.";
        try {
          const errData = JSON.parse(raw);
          if (errData.detail) {
            if (Array.isArray(errData.detail)) {
              msg = errData.detail.map((d) => d?.msg || d?.type || "Error").join(" · ");
            } else {
              msg = errData.detail;
            }
          }
          if (errData.detail === "PRO_REQUIRED_TRIAL_EXPIRED") {
            setTrialExpired(true);
            setProGateMsg("Tu prueba ha finalizado. Activa PRO para seguir creando pacientes y subiendo analíticas/imágenes.");
          }
        } catch {}
        setPatientsError(msg);
        return;
      }
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        setPatientsError("Respuesta inesperada al listar pacientes.");
        return;
      }
      setPatients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Error cargando pacientes en PanelMedico:", err);
      setPatientsError("Error de conexión al cargar pacientes.");
    } finally {
      setPatientsLoading(false);
    }
  }

async function loadCosmeticItemsForPatient(pid) {
  setCosmeticItemsError("");
  setCosmeticItems([]);
  setSelectedPreId("");
  setSelectedPostId("");

  const t = localStorage.getItem("galenos_token");
  if (!t) return;
  if (!pid || Number.isNaN(pid)) return;

  try {
    setCosmeticItemsLoading(true);
    const res = await fetch(`${API}/imaging/by-patient/${pid}`, {
      headers: { Authorization: `Bearer ${t}` },
    });
    const raw = await res.text();
    console.log("👉 [Cosmetic] GET /imaging/by-patient (raw):", raw);

    if (!res.ok) {
      setCosmeticItemsError("No se pudieron cargar las imágenes del paciente.");
      return;
    }

    let data;
    try { data = JSON.parse(raw); } catch { data = []; }
    const arr = Array.isArray(data) ? data : [];

    const cosmetic = arr.filter((x) => String(x.type || "").toUpperCase().startsWith("COSMETIC"));
    setCosmeticItems(cosmetic);

    const pre = cosmetic.filter((x) => String(x.type || "").toUpperCase() === "COSMETIC_PRE");
    const post = cosmetic.filter((x) => {
      const t2 = String(x.type || "").toUpperCase();
      return t2 === "COSMETIC_POST" || t2 === "COSMETIC_FOLLOWUP";
    });

    const sortKey = (it) => String(it.exam_date || it.created_at || "");
    pre.sort((a,b)=> sortKey(a).localeCompare(sortKey(b)));   // más antiguo primero
    post.sort((a,b)=> sortKey(b).localeCompare(sortKey(a)));  // más reciente primero

    if (pre[0]?.id) setSelectedPreId(String(pre[0].id));
    if (post[0]?.id) setSelectedPostId(String(post[0].id));
  } catch (err) {
    console.error("❌ Error cargando imágenes quirúrgicas:", err);
    setCosmeticItemsError("Error de conexión al cargar imágenes del paciente.");
  } finally {
    setCosmeticItemsLoading(false);
  }
}

function fmtDateCompact(v) {
  if (!v) return "";
  try {
    const s = String(v);
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d.toLocaleDateString("es-ES");
    if (s.includes("-") && s.length >= 10) return s.slice(0, 10);
    return s;
  } catch {
    return String(v);
  }
}

  useEffect(() => {
    loadPatients();
  }, []);


useEffect(() => {
  const pid = parseInt(selectedPatientId, 10);
  if (!pid || Number.isNaN(pid)) return;
  loadCosmeticItemsForPatient(pid);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [selectedPatientId]);
  async function handleCreatePatientInPanel(e) {
    e.preventDefault();
    setPatientsError("");

    if (!newPatientAlias.trim()) {
      setPatientsError(
        "Introduce un alias para el paciente (ej. 0001 - Nombre Apellidos)."
      );
      return;
    }
    const t = localStorage.getItem("galenos_token");
    if (!t) {
      setPatientsError("No hay sesión activa. Vuelve a iniciar sesión.");
      return;
    }

    try {
      setCreatingPatient(true);
      const body = { alias: newPatientAlias.trim() };
      const res = await fetch(`${API}/patients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${t}`,
        },
        body: JSON.stringify(body),
      });
      const raw = await res.text();
      console.log("👉 [PanelMedico] POST /patients (raw):", raw);
      if (!res.ok) {
        let msg = "No se ha podido crear el paciente.";
        try {
          const errData = JSON.parse(raw);
          if (errData.detail) {
            if (Array.isArray(errData.detail)) {
              msg = errData.detail.map((d) => d?.msg || d?.type || "Error").join(" · ");
            } else {
              msg = errData.detail;
            }
          }
          if (errData.detail === "PRO_REQUIRED_TRIAL_EXPIRED") {
            setTrialExpired(true);
            setProGateMsg("Tu prueba ha finalizado. Activa PRO para seguir creando pacientes y subiendo analíticas/imágenes.");
          }
        } catch {}
        setPatientsError(msg);
        return;
      }
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        setPatientsError("Respuesta inesperada al crear paciente.");
        return;
      }
      setNewPatientAlias("");
      setPatients((prev) => [data, ...prev]);
      setSelectedPatientId(String(data.id));
    } catch (err) {
      console.error("❌ Error creando paciente desde PanelMedico:", err);
      setPatientsError("Error de conexión al crear paciente.");
    } finally {
      setCreatingPatient(false);
    }
  }

  // ========================
  // ESTADO ANALÍTICAS
  // ========================
  const [alias, setAlias] = useState("Paciente A");
  const [fileAnalitica, setFileAnalitica] = useState(null);
  const [loadingAnalitica, setLoadingAnalitica] = useState(false);
  const [analyticsError, setAnalyticsError] = useState("");
  const [analyticsResult, setAnalyticsResult] = useState(null);

  const [chatQuestion, setChatQuestion] = useState("");
  const [chatAnswer, setChatAnswer] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");

  // Detección de duplicados (analíticas)
  const [lastAnalyticId, setLastAnalyticId] = useState(null);
  const [duplicateAnalytic, setDuplicateAnalytic] = useState(false);

  // ========================
  // ESTADO IMÁGENES
  // ========================
  const [imgType, setImgType] = useState("RX");
  const [imgContext, setImgContext] = useState("");
  const [fileImagen, setFileImagen] = useState(null);
  const [loadingImagen, setLoadingImagen] = useState(false);
  const [imagenError, setImagenError] = useState("");
  const [imagenSummary, setImagenSummary] = useState("");
  const [imagenDifferential, setImagenDifferential] = useState("");
  const [imagenPatterns, setImagenPatterns] = useState([]);
  const [imagenFilePath, setImagenFilePath] = useState("");

  // Orientación visual (overlay) — automático + toggle
  const [showImgOverlay, setShowImgOverlay] = useState(true);
  const [activeOverlays, setActiveOverlays] = useState([]);
  const [overlayMode, setOverlayMode] = useState("auto"); // auto | msk-orient | msk-atlas | vascular | off
  const [imgModalOpen, setImgModalOpen] = useState(false);

  
  // refs para overlay vascular
  const imgInlineRef = useRef(null);
  const imgModalRef = useRef(null);

// Chat radiológico
  const [imgChatQuestion, setImgChatQuestion] = useState("");
  const [imgChatAnswer, setImgChatAnswer] = useState("");
  const [imgChatError, setImgChatError] = useState("");
  const [imgChatLoading, setImgChatLoading] = useState(false);

  // Detección de duplicados (imágenes)
  const [lastImagenId, setLastImagenId] = useState(null);
  const [duplicateImagen, setDuplicateImagen] = useState(false);
  const [imgUiFamily, setImgUiFamily] = useState("");
  const [imgUiConfidence, setImgUiConfidence] = useState(0);

// ========================
// ESTADO IMÁGENES QUIRÚRGICAS (ANTES / DESPUÉS) — sin IA automática
// ========================
const [cosType, setCosType] = useState("COSMETIC_PRE");
const [cosContext, setCosContext] = useState("");
const [fileCosmetic, setFileCosmetic] = useState(null);
const [loadingCosmeticUpload, setLoadingCosmeticUpload] = useState(false);
const [cosmeticError, setCosmeticError] = useState("");
const [cosmeticFilePath, setCosmeticFilePath] = useState("");
const [cosmeticId, setCosmeticId] = useState(null);

const [cosmeticAiDraft, setCosmeticAiDraft] = useState("");
const [cosmeticAiLoading, setCosmeticAiLoading] = useState(false);
const [cosmeticAiError, setCosmeticAiError] = useState("");

// Comparar (dropdowns)
const [cosmeticItems, setCosmeticItems] = useState([]);
const [cosmeticItemsLoading, setCosmeticItemsLoading] = useState(false);
const [cosmeticItemsError, setCosmeticItemsError] = useState("");
const [selectedPreId, setSelectedPreId] = useState("");
const [selectedPostId, setSelectedPostId] = useState("");
const [cosCompareLoading, setCosCompareLoading] = useState(false);
const [cosCompareError, setCosCompareError] = useState("");
const [cosCompareResult, setCosCompareResult] = useState("");
const [cosPdfLoading, setCosPdfLoading] = useState(false);
const [cosPdfError, setCosPdfError] = useState("");
const [cosNote, setCosNote] = useState("");

  // ========================
  // HANDLERS ANALÍTICAS
  // ========================
  async function handleUploadAnalitica(e) {
    e.preventDefault();
    setAnalyticsError("");
    setAnalyticsResult(null);
    setChatAnswer("");
    setChatError("");
    setDuplicateAnalytic(false);

    if (!token) {
      setAnalyticsError("No hay sesión activa. Vuelve a iniciar sesión.");
      return;
    }

    const pid = parseInt(selectedPatientId, 10);
    if (!pid || Number.isNaN(pid)) {
      setAnalyticsError(
        "Selecciona un paciente válido en el desplegable antes de subir la analítica."
      );
      return;
    }

    if (!alias.trim()) {
      setAnalyticsError(
        "Introduce un alias para la analítica (ej. 0001 - Nombre)."
      );
      return;
    }
    if (!fileAnalitica) {
      setAnalyticsError("Selecciona un fichero de analítica (PDF o imagen).");
      return;
    }

    const formData = new FormData();
    formData.append("alias", alias.trim());
    formData.append("file", fileAnalitica);

    try {
      setLoadingAnalitica(true);
      const res = await fetch(`${API}/analytics/upload/${pid}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const raw = await res.text();
      console.log("👉 Respuesta IA analítica (raw):", raw);

      if (!res.ok) {
        let msg = "No se ha podido analizar y guardar la analítica.";
        try {
          const errData = JSON.parse(raw);
          if (errData.detail) {
            if (Array.isArray(errData.detail)) {
              msg = errData.detail.map((d) => d?.msg || d?.type || "Error").join(" · ");
            } else {
              msg = errData.detail;
            }
          }
          if (errData.detail === "PRO_REQUIRED_TRIAL_EXPIRED") {
            setTrialExpired(true);
            setProGateMsg("Tu prueba ha finalizado. Activa PRO para seguir creando pacientes y subiendo analíticas/imágenes.");
          }
        } catch {}
        setAnalyticsError(msg);
        return;
      }

      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        setAnalyticsError("Respuesta inesperada del servidor de analíticas.");
        return;
      }

      // DEDUPLICADO desde backend → aviso inmediato
if (data.duplicate === true) {
    setDuplicateAnalytic(true);
    setLastAnalyticId(data.id);  // para que las siguientes coincidan
    setTimeout(() => setDuplicateAnalytic(false), 5000);
}

      setLastAnalyticId(data.id || null);

      setAnalyticsResult({
        id: data.id,
        patient_alias: alias.trim(),
        file_name: data.file_name || fileAnalitica.name,
        summary: data.summary,
        differential: data.differential,
        markers: data.markers || [],
      });
    } catch (err) {
      console.error("❌ Error enviando analítica:", err);
      setAnalyticsError("Error de conexión con el servidor de analíticas.");
    } finally {
      setLoadingAnalitica(false);
    }
  }

  async function handleAnalyticsChat(e) {
    e.preventDefault();
    setChatError("");
    setChatAnswer("");

    if (!analyticsResult) {
      setChatError("Primero analiza y guarda una analítica.");
      return;
    }
    if (!chatQuestion.trim()) {
      setChatError("Escribe una pregunta para la IA clínica.");
      return;
    }

    const payload = {
      patient_alias: analyticsResult.patient_alias || alias,
      file_name: analyticsResult.file_name,
      markers: analyticsResult.markers,
      summary: analyticsResult.summary,
      differential: analyticsResult.differential,
      question: chatQuestion.trim(),
    };

    try {
      setChatLoading(true);
      const res = await fetch(`${API}/analytics/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const raw = await res.text();
      console.log("👉 Respuesta chat analítica (raw):", raw);

      if (!res.ok) {
        let msg =
          "No se ha podido generar una respuesta de IA para la analítica.";
        try {
          const errData = JSON.parse(raw);
          if (errData.detail) {
            if (Array.isArray(errData.detail)) {
              msg = errData.detail.map((d) => d?.msg || d?.type || "Error").join(" · ");
            } else {
              msg = errData.detail;
            }
          }
        } catch {}
        setChatError(msg);
        return;
      }

      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        setChatError("Respuesta inesperada del chat de analíticas.");
        return;
      }

      setChatAnswer(data.answer || "");
      setChatQuestion("");
    } catch (err) {
      console.error("❌ Error chat analíticas:", err);
      setChatError("Error de conexión con el chat de analíticas.");
    } finally {
      setChatLoading(false);
    }
  }

  // ========================
  // HANDLERS IMÁGENES
  // ========================
  async function handleUploadImagen(e) {
    e.preventDefault();
    setImagenError("");
    setImagenSummary("");
    setImagenDifferential("");
    setImagenPatterns([]);
    setImagenFilePath("");
    setImgUiFamily("");
    setImgUiConfidence(0);
    setActiveOverlays([]);
    setOverlayMode("auto");
    setImgChatAnswer("");
    setImgChatError("");
    setDuplicateImagen(false);

    if (!token) {
      setImagenError("No hay sesión activa. Vuelve a iniciar sesión.");
      return;
    }

    const pid = parseInt(selectedPatientId, 10);
    if (!pid || Number.isNaN(pid)) {
      setImagenError(
        "Selecciona un paciente válido en el desplegable antes de subir la imagen."
      );
      return;
    }
    if (!fileImagen) {
      setImagenError("Selecciona un fichero de imagen (JPG/PNG/PDF).");
      return;
    }

    const formData = new FormData();
    formData.append("patient_id", String(pid));
    formData.append("img_type", imgType || "imagen");
    if (imgContext && imgContext.trim()) {
      formData.append("context", imgContext.trim());
    }
    formData.append("file", fileImagen);

    try {
      setLoadingImagen(true);
      const res = await fetch(`${API}/imaging/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const raw = await res.text();
      console.log("👉 Respuesta imagen (raw):", raw);

      if (!res.ok) {
        let msg = "No se ha podido analizar la imagen médica.";
        try {
          const errData = JSON.parse(raw);
          if (errData.detail) {
            if (Array.isArray(errData.detail)) {
              msg = errData.detail.map((d) => d?.msg || d?.type || "Error").join(" · ");
            } else {
              msg = errData.detail;
            }
          }
        } catch {}
        setImagenError(msg);
        return;
      }

      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        setImagenError("Respuesta inesperada del servidor de imagen.");
        return;
      }

      // DEDUPLICACIÓN desde backend
if (data.duplicate === true) {
    setDuplicateImagen(true);
    setLastImagenId(data.id);
    setTimeout(() => setDuplicateImagen(false), 5000);
}

      setLastImagenId(data.id || null);

      setImagenSummary(data.summary || "");
      setImgUiFamily(String(data.ui_family || ""));
      setImgUiConfidence(Number(data.ui_confidence || 0));
      setImagenDifferential(data.differential || "");
      if (Array.isArray(data.patterns)) {
        setImagenPatterns(
          data.patterns.map((p) => p.pattern_text || String(p))
        );
      } else {
        setImagenPatterns([]);
      }

      if (data.file_path) {
        setImagenFilePath(data.file_path);
      }

      // Overlays (auto) — se calculan desde texto/patrones del análisis
      try {
        const pats = Array.isArray(data.patterns)
          ? data.patterns.map((p) => p.pattern_text || String(p))
          : [];
        setActiveOverlays(inferOverlaysLocal({ imgType, summary: data.summary || "", patterns: pats }));
      } catch {
        setActiveOverlays([]);
      }
    } catch (err) {
      console.error("❌ Error imagen médica:", err);
      setImagenError("Error de conexión con el servidor de imagen.");
    } finally {
      setLoadingImagen(false);
    }
  }
// ========================
// HANDLERS IMÁGENES QUIRÚRGICAS
// ========================
async function handleUploadCosmetic(e) {
  e.preventDefault();
  setCosmeticError("");
  setCosmeticFilePath("");
  setCosmeticId(null);
  setCosmeticAiDraft("");
  setCosmeticAiError("");
  setCosCompareResult("");
  setCosCompareError("");

  if (!token) {
    setCosmeticError("No hay sesión activa. Vuelve a iniciar sesión.");
    return;
  }

  const pid = parseInt(selectedPatientId, 10);
  if (!pid || Number.isNaN(pid)) {
    setCosmeticError("Selecciona un paciente válido antes de subir la imagen quirúrgica.");
    return;
  }

  if (!fileCosmetic) {
    setCosmeticError("Selecciona una foto (JPG/PNG) o PDF.");
    return;
  }

  const formData = new FormData();
  formData.append("patient_id", String(pid));
  // ✅ ESTA ES LA CLAVE: marcamos el tipo como COSMETIC_*
  formData.append("img_type", cosType);  // COSMETIC_PRE / COSMETIC_POST / COSMETIC_FOLLOWUP
  if (cosContext && cosContext.trim()) formData.append("context", cosContext.trim());
  formData.append("file", fileCosmetic);

  try {
    setLoadingCosmeticUpload(true);
    const res = await fetch(`${API}/imaging/cosmetic/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const raw = await res.text();
    console.log("👉 [Cosmetic] upload (raw):", raw);

    if (!res.ok) {
      let msg = "No se pudo guardar la imagen quirúrgica.";
      try {
        const errData = JSON.parse(raw);
        if (errData.detail) {
            if (Array.isArray(errData.detail)) {
              msg = errData.detail.map((d) => d?.msg || d?.type || "Error").join(" · ");
            } else {
              msg = errData.detail;
            }
          }
      } catch {}
      setCosmeticError(msg);
      return;
    }

    let data;
    try { data = JSON.parse(raw); } catch { data = null; }

    setCosmeticId(data?.id ?? null);
    setCosmeticFilePath(data?.file_path || "");

    // refrescamos lista para dropdowns
    await loadCosmeticItemsForPatient(pid);
  } catch (err) {
    console.error("❌ Error upload cosmetic:", err);
    setCosmeticError("Error de conexión al subir imagen quirúrgica.");
  } finally {
    setLoadingCosmeticUpload(false);
  }
}

async function handleAnalyzeCosmetic() {
  setCosmeticAiError("");
  setCosmeticAiDraft("");

  if (!token) {
    setCosmeticAiError("No hay sesión activa. Vuelve a iniciar sesión.");
    return;
  }
  if (!cosmeticId) {
    setCosmeticAiError("Primero sube una imagen quirúrgica.");
    return;
  }

  try {
    setCosmeticAiLoading(true);
    const formData = new FormData();
    if (cosContext && cosContext.trim()) formData.append("context", cosContext.trim());

    const res = await fetch(`${API}/imaging/cosmetic/${cosmeticId}/analyze`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const raw = await res.text();
    console.log("👉 [Cosmetic] analyze (raw):", raw);

    if (!res.ok) {
      let msg = "No se pudo analizar la imagen quirúrgica.";
      try {
        const errData = JSON.parse(raw);
        if (errData.detail) {
            if (Array.isArray(errData.detail)) {
              msg = errData.detail.map((d) => d?.msg || d?.type || "Error").join(" · ");
            } else {
              msg = errData.detail;
            }
          }
      } catch {}
      setCosmeticAiError(msg);
      return;
    }

    let data;
    try { data = JSON.parse(raw); } catch { data = null; }
    setCosmeticAiDraft(data?.ai_description_draft || "");
  } catch (err) {
    console.error("❌ Error analyze cosmetic:", err);
    setCosmeticAiError("Error de conexión al analizar la imagen quirúrgica.");
  } finally {
    setCosmeticAiLoading(false);
  }
}

async function handleCompareCosmetic() {
  setCosCompareError("");
  setCosCompareResult("");

  if (!token) {
    setCosCompareError("No hay sesión activa. Vuelve a iniciar sesión.");
    return;
  }
  if (!selectedPreId || !selectedPostId) {
    setCosCompareError("Selecciona una imagen 'Antes' y una 'Después' para comparar.");
    return;
  }

  try {
    setCosCompareLoading(true);
    const formData = new FormData();
    formData.append("pre_image_id", String(selectedPreId));
    formData.append("post_image_id", String(selectedPostId));
    if (cosContext && cosContext.trim()) formData.append("context", cosContext.trim());

    const res = await fetch(`${API}/imaging/cosmetic/compare`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const raw = await res.text();
    console.log("👉 [Cosmetic] compare (raw):", raw);

    if (!res.ok) {
      let msg = "No se pudo comparar Antes/Después.";
      try {
        const errData = JSON.parse(raw);
        if (errData.detail) {
            if (Array.isArray(errData.detail)) {
              msg = errData.detail.map((d) => d?.msg || d?.type || "Error").join(" · ");
            } else {
              msg = errData.detail;
            }
          }
      } catch {}
      setCosCompareError(msg);
      return;
    }

    let data;
    try { data = JSON.parse(raw); } catch { data = null; }
    setCosCompareResult(data?.compare_text || "");
  } catch (err) {
    console.error("❌ Error compare cosmetic:", err);
    setCosCompareError("Error de conexión al comparar imágenes.");
  } finally {
    setCosCompareLoading(false);
  }
}

async function handleGenerateCosmeticPdf() {
  setCosPdfError("");

  if (!token) {
    setCosPdfError("No hay sesión activa. Vuelve a iniciar sesión.");
    return;
  }
  if (!selectedPreId || !selectedPostId) {
    setCosPdfError("Selecciona una imagen 'Antes' y una 'Después'.");
    return;
  }
  if (!cosCompareResult || !cosCompareResult.trim()) {
    setCosPdfError("Primero genera la comparativa Antes/Después.");
    return;
  }

  try {
    setCosPdfLoading(true);

    const payload = {
      pre_image_id: parseInt(selectedPreId, 10),
      post_image_id: parseInt(selectedPostId, 10),
      compare_text: cosCompareResult,
      note: cosNote && cosNote.trim() ? cosNote.trim() : null,
    };

    const res = await fetch(`${API}/pdf/cosmetic-compare`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const raw = await res.text();
      console.log("👉 [Cosmetic] pdf (raw error):", raw);
      let msg = "No se pudo generar el PDF.";
      try {
        const errData = JSON.parse(raw);
        if (errData.detail) {
            if (Array.isArray(errData.detail)) {
              msg = errData.detail.map((d) => d?.msg || d?.type || "Error").join(" · ");
            } else {
              msg = errData.detail;
            }
          }
      } catch {}
      setCosPdfError(msg);
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `Galenos_Comparativa_${selectedPreId}_${selectedPostId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("❌ Error generando PDF cosmético:", err);
    setCosPdfError("Error de conexión al generar el PDF.");
  } finally {
    setCosPdfLoading(false);
  }
}


  async function handleImagingChat(e) {
    e.preventDefault();
    setImgChatError("");
    setImgChatAnswer("");

    if (!imagenSummary && (!imagenPatterns || imagenPatterns.length === 0)) {
      setImgChatError("Primero analiza una imagen médica.");
      return;
    }
    if (!imgChatQuestion.trim()) {
      setImgChatError("Escribe una pregunta para la IA radiológica.");
      return;
    }

    const imagingId = lastImagenId;

    if (!imagingId) {
      setImgChatError("No se ha detectado el ID de la imagen. Vuelve a analizar la imagen y prueba de nuevo.");
      return;
    }

    // Backend nuevo: /imaging/chat requiere imaging_id (o image_id) + question
    const payload = {
      imaging_id: imagingId,
      question: imgChatQuestion.trim(),
    };

    try {
      setImgChatLoading(true);
      const res = await fetch(`${API}/imaging/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const raw = await res.text();
      console.log("👉 Respuesta chat imagen (raw):", raw);

      if (!res.ok) {
        let msg =
          "No se ha podido generar una respuesta de IA para la imagen médica.";
        try {
          const errData = JSON.parse(raw);
          if (errData.detail) {
            if (Array.isArray(errData.detail)) {
              msg = errData.detail.map((d) => d?.msg || d?.type || "Error").join(" · ");
            } else {
              msg = errData.detail;
            }
          }
        } catch {}
        setImgChatError(msg);
        return;
      }

      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        setImgChatError("Respuesta inesperada del chat radiológico.");
        return;
      }

      setImgChatAnswer(data.answer || "");
      setImgChatQuestion("");
    } catch (err) {
      console.error("❌ Error chat imágenes:", err);
      setImgChatError("Error de conexión con el chat de imágenes.");
    } finally {
      setImgChatLoading(false);
    }
  }


  // ========================
  // Overlay: inferencia simple por texto (SAFE)
  // ========================
  function inferOverlaysLocal({ imgType, summary, patterns }) {
    // Preferencia: clasificación visual desde backend (no depende del texto)
    const fam = (imgUiFamily || "").toString().toUpperCase();
    if (fam === "VASCULAR") return ["VESSEL_AXIS", "VESSEL_GUIDE"];
    if (fam === "MSK") return ["FIBER_LINES"];
    const hay = `${imgType || ""} ${summary || ""} ${(patterns || []).join(" ")}`.toLowerCase();

    // VASCULAR (eco-Doppler / carótidas / arterias)
    if (
      hay.includes("carót") ||
      hay.includes("carot") ||
      hay.includes("arterial") ||
      hay.includes("vascular") ||
      hay.includes("doppler") ||
      hay.includes("troncos supraa") ||
      hay.includes("supraaórtic") ||
      hay.includes("supraaortic") ||
      hay.includes("flujo")
    ) {
      return ["VESSEL_AXIS", "VESSEL_GUIDE"];
    }

    // MÚSCULO / TENDÓN (preparado para siguiente paso)
    if (
      hay.includes("múscul") ||
      hay.includes("muscul") ||
      hay.includes("fibr") ||
      hay.includes("estriacion") ||
      hay.includes("estriación") ||
      hay.includes("tendón") ||
      hay.includes("tendon") ||
      hay.includes("aponeurosis")
    ) {
      return ["FIBER_LINES"];
    }

    return [];
  }

  function VascularOverlaySvg() {
    return (
      <svg viewBox="0 0 100 100" className="absolute inset-0 pointer-events-none z-20" aria-hidden="true">
        <path d="M8 52 Q50 48 92 52" stroke="rgba(255,255,255,0.28)" strokeWidth="1.2" fill="none" />
        <path d="M8 47 Q50 43 92 47" stroke="rgba(255,255,255,0.16)" strokeWidth="0.8" fill="none" />
        <path d="M8 57 Q50 53 92 57" stroke="rgba(255,255,255,0.16)" strokeWidth="0.8" fill="none" />
      </svg>
    );
  }

  function MuscleOverlaySvg() {
    const atlas = overlayMode === "msk-atlas";

    if (!atlas) {
      return (
        <svg viewBox="0 0 100 100" className="absolute inset-0 pointer-events-none z-20" aria-hidden="true">
          <path d="M8 38 Q50 36 92 38" stroke="rgba(255,255,200,0.18)" strokeWidth="0.9" fill="none" />
          <path d="M8 43 Q50 41 92 43" stroke="rgba(255,255,200,0.18)" strokeWidth="0.9" fill="none" />
          <path d="M8 48 Q50 46 92 48" stroke="rgba(255,255,200,0.18)" strokeWidth="0.9" fill="none" />
          <path d="M8 53 Q50 51 92 53" stroke="rgba(255,255,200,0.18)" strokeWidth="0.9" fill="none" />
          <path d="M8 58 Q50 56 92 58" stroke="rgba(255,255,200,0.18)" strokeWidth="0.9" fill="none" />
          <path d="M8 63 Q50 61 92 63" stroke="rgba(255,255,200,0.18)" strokeWidth="0.9" fill="none" />
        </svg>
      );
    }

    return (
      <svg viewBox="0 0 100 100" className="absolute inset-0 pointer-events-none z-20" aria-hidden="true">
        <rect x="1.5" y="6" width="26" height="88" rx="3" ry="3" fill="rgba(0,0,0,0.22)" />
        <line x1="3.5" y1="24" x2="26" y2="24" stroke="rgba(255,255,255,0.25)" strokeWidth="0.6" />
        <line x1="3.5" y1="42" x2="26" y2="42" stroke="rgba(255,255,255,0.25)" strokeWidth="0.6" />
        <line x1="3.5" y1="50" x2="26" y2="50" stroke="rgba(255,255,255,0.25)" strokeWidth="0.6" />

        <text x="4.2" y="16" fontSize="3.4" fill="rgba(255,255,255,0.95)">Piel / Skin</text>
        <text x="4.2" y="34" fontSize="3.4" fill="rgba(255,255,255,0.95)">Subcutáneo / Subcutaneous</text>
        <text x="4.2" y="47.5" fontSize="3.4" fill="rgba(255,255,255,0.95)">Fascia / Fascia</text>
        <text x="4.2" y="63.5" fontSize="3.4" fill="rgba(255,255,255,0.95)">Músculo / Muscle</text>

        <path d="M27 58 C30 58 32 58 34 58" stroke="rgba(255,255,255,0.55)" strokeWidth="0.8" fill="none" />
        <path d="M34 58 l2 -1.3 l0 2.6 z" fill="rgba(255,255,255,0.55)" />

        <rect x="30" y="54" width="68" height="38" fill="rgba(255,255,255,0.06)" />

        <defs>
          <clipPath id="muscleZoneAtlas">
            <rect x="30" y="54" width="68" height="38" />
          </clipPath>
        </defs>

        <g clipPath="url(#muscleZoneAtlas)">
          <path d="M30 58 Q64 56 98 58" stroke="rgba(255,255,200,0.22)" strokeWidth="0.9" fill="none" />
          <path d="M30 63 Q64 61 98 63" stroke="rgba(255,255,200,0.22)" strokeWidth="0.9" fill="none" />
          <path d="M30 68 Q64 66 98 68" stroke="rgba(255,255,200,0.22)" strokeWidth="0.9" fill="none" />
          <path d="M30 73 Q64 71 98 73" stroke="rgba(255,255,200,0.22)" strokeWidth="0.9" fill="none" />
          <path d="M30 78 Q64 76 98 78" stroke="rgba(255,255,200,0.22)" strokeWidth="0.9" fill="none" />
          <path d="M30 83 Q64 81 98 83" stroke="rgba(255,255,200,0.22)" strokeWidth="0.9" fill="none" />
          <path d="M30 88 Q64 86 98 88" stroke="rgba(255,255,200,0.22)" strokeWidth="0.9" fill="none" />
        </g>

        <text x="30" y="96" fontSize="3.0" fill="rgba(255,255,255,0.62)">
          Guía didáctica orientativa / Educational guide
        </text>
      </svg>
    );
  }





  // ========================
  // RENDER
  // ========================
  return (
    <main className="sr-container py-6 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Panel médico · Galenos.pro</h1>
          <p className="text-sm text-slate-600">
            Sube analíticas e imágenes médicas vinculadas a tus pacientes.
            Galenos te ayuda a interpretar de forma prudente los resultados, sin
            sustituir tu criterio clínico.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/pacientes")}
          className="sr-btn-secondary text-sm whitespace-nowrap"
        >
          Gestionar pacientes
        </button>
      </header>

      {/* BLOQUE PLAN PRO / STRIPE */}
      <section className="bg-sky-50 rounded-xl border border-sky-200 shadow-sm p-4 space-y-2">
        <h2 className="text-sm font-semibold text-sky-800">
          Tu plan · Galenos PRO
        </h2>
        {
          trialExpired ? (
            <div className="text-xs text-sky-800 space-y-1">
              <p className="font-semibold">Tu periodo de prueba ha finalizado.</p>
              <p className="text-sky-700">
                Puedes seguir consultando tus pacientes y analíticas, pero para{" "}
                <strong>crear nuevos pacientes</strong> o <strong>subir nuevas analíticas / imágenes</strong>{" "}
                necesitas activar el plan PRO.
              </p>
              <p className="text-sky-700 italic">
                Al activar PRO, la facturación se aplicará en los próximos días.
              </p>
            </div>
          ) : (
            <p className="text-xs text-sky-700">
              Prueba clínica interna activa. Puedes crear pacientes y subir analíticas
              e imágenes. Activa PRO cuando quieras para seguir trabajando sin límites.
            </p>
          )
        }
        {billingError && (
          <p className="text-xs text-red-600">{billingError}</p>
        )}
        {proGateMsg && (
          <p className="text-xs text-amber-700">{proGateMsg}</p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleStripeCheckout}
            disabled={billingLoading}
            className="sr-btn-primary text-xs disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {billingLoading
              ? "Conectando con Stripe..."
              : (trialExpired ? "Activar Galenos PRO" : "Activar Galenos PRO")}
          </button>

          <button
            type="button"
            onClick={handleOpenBillingPortal}
            disabled={billingLoading || trialExpired}
            className="sr-btn-secondary text-xs disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {trialExpired ? "Gestionar suscripción (activa PRO primero)" : "Gestionar suscripción"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/perfil")}
            className="sr-btn-secondary text-xs"
          >
            Ver / editar mi perfil médico
          </button>
        </div>
      </section>

      {/* BLOQUE PACIENTE SELECCIONADO / CREAR DESDE PANEL */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
        <h2 className="text-lg font-semibold">Paciente activo en el panel</h2>
        <p className="text-sm text-slate-600">
          Selecciona el paciente al que se vincularán las analíticas e imágenes.
          Puedes crear uno nuevo desde aquí o elegir uno existente.
        </p>

        {patientsError && (
          <p className="text-sm text-red-600">{patientsError}</p>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="sr-label">Seleccionar paciente existente</label>
            <select
              className="sr-input w-full"
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              disabled={patientsLoading}
            >
              <option value="">
                {patientsLoading
                  ? "Cargando pacientes..."
                  : "Selecciona un paciente..."}
              </option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  Nº {p.patient_number ?? p.id} · {p.alias} (ID {p.id})
                </option>
              ))}
            </select>
            {selectedPatientId && (
              <p className="text-xs text-slate-500 mt-1">
                Paciente seleccionado: ID interno{" "}
                <span className="font-mono">{selectedPatientId}</span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="sr-label">Crear nuevo paciente desde aquí</label>
            <form
              onSubmit={handleCreatePatientInPanel}
              className="flex flex-col sm:flex-row gap-2"
            >
              <input
                type="text"
                className="sr-input flex-1"
                value={newPatientAlias}
                onChange={(e) => setNewPatientAlias(e.target.value)}
                placeholder="0002 - Nombre Apellidos"
              />
              <button
                type="submit"
                disabled={creatingPatient || trialExpired}
                className="sr-btn-secondary disabled:opacity-60 disabled:cursor-not-allowed text-xs"
              >
                {creatingPatient ? "Creando..." : "Crear y seleccionar"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* BLOQUE ANALÍTICAS */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
        <h2 className="text-lg font-semibold">Analíticas de laboratorio</h2>
        <p className="text-sm text-slate-600">
          Sube analíticas (PDF, foto, captura). Galenos extraerá marcadores,
          rangos y un resumen clínico orientativo. Usando el paciente
          seleccionado, la analítica se guardará en su ficha.
        </p>

        <form onSubmit={handleUploadAnalitica} className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="sr-label">Alias / identificador de la analítica</label>
              <input
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                className="sr-input w-full"
                placeholder="Ej. 2024-09 - Analítica control"
              />
            </div>
            <div>
              <label className="sr-label">Fichero de analítica</label>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) =>
                  setFileAnalitica(e.target.files?.[0] || null)
                }
                className="sr-input w-full"
              />
            </div>
          </div>

          {analyticsError && (
            <p className="text-sm text-red-600">{analyticsError}</p>
          )}

          <button
            type="submit"
            disabled={loadingAnalitica || trialExpired}
            className="sr-btn-primary disabled:opacity-60 disabled:cursor-not-allowed mt-1"
          >
            {loadingAnalitica
              ? "Analizando y guardando analítica..."
              : "Analizar y guardar analítica"}
          </button>

          {duplicateAnalytic && (
            <p className="mt-2 text-xs text-amber-700 flex items-center gap-1">
              <span>⚠</span>
              <span>
                Esta analítica ya estaba registrada (no se ha duplicado).
              </span>
            </p>
          )}
        </form>

        {analyticsResult && (
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-1">
                Resultado para {analyticsResult.patient_alias}
              </h3>
              <p className="text-xs text-slate-500">
                Fichero:{" "}
                <span className="font-mono">{analyticsResult.file_name}</span>
              </p>
            </div>

            {analyticsResult.summary && (
              <div>
                <h4 className="text-sm font-semibold mb-1">
                  Resumen orientativo
                </h4>
                <p className="text-sm text-slate-800 whitespace-pre-line">
                  {analyticsResult.summary}
                </p>
              </div>
            )}

            {analyticsResult.differential && (
              <div>
                <h4 className="text-sm font-semibold mb-1">
                  Diagnóstico diferencial (orientativo)
                </h4>
                <p className="text-sm text-slate-800 whitespace-pre-line">
                  {analyticsResult.differential}
                </p>
              </div>
            )}

            {Array.isArray(analyticsResult.markers) &&
              analyticsResult.markers.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">
                    Marcadores extraídos
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs border border-slate-200 rounded-md overflow-hidden">
                      <thead className="bg-slate-100">
                        <tr>
                          <th className="px-2 py-1 text-left">Marcador</th>
                          <th className="px-2 py-1 text-left">Valor</th>
                          <th className="px-2 py-1 text-left">Rango</th>
                          <th className="px-2 py-1 text-left">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsResult.markers.map((m, idx) => (
                          <tr
                            key={idx}
                            className="border-t border-slate-200"
                          >
                            <td className="px-2 py-1">{m.name}</td>
                            <td className="px-2 py-1">
                              {m.value !== null && m.value !== undefined
                                ? m.value
                                : ""}
                            </td>
                            <td className="px-2 py-1">{m.range || ""}</td>
                            <td className="px-2 py-1">
                              {m.status === "elevado" && (
                                <span className="text-red-600 font-medium">
                                  Alto
                                </span>
                              )}
                              {m.status === "bajo" && (
                                <span className="text-amber-600 font-medium">
                                  Bajo
                                </span>
                              )}
                              {m.status === "normal" && (
                                <span className="text-emerald-700 font-medium">
                                  Normal
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            {/* Mini chat analíticas */}
            <div className="mt-4 border-t border-slate-200 pt-3 space-y-2">
              <h4 className="text-sm font-semibold">
                Preguntar sobre la analítica (IA clínica orientativa)
              </h4>
              <form onSubmit={handleAnalyticsChat} className="space-y-2">
                <textarea
                  className="sr-input w-full min-h-[60px]"
                  value={chatQuestion}
                  onChange={(e) => setChatQuestion(e.target.value)}
                  placeholder="Ej. ¿Cómo interpretarías la evolución de PCR y leucocitos?"
                />
                {chatError && (
                  <p className="text-sm text-red-600">{chatError}</p>
                )}
                <button
                  type="submit"
                  disabled={chatLoading}
                  className="sr-btn-secondary disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {chatLoading ? "Pensando..." : "Preguntar a la IA clínica"}
                </button>
              </form>

              {chatAnswer && (
                <div className="mt-2">
                  <h5 className="text-xs font-semibold mb-1">
                    Respuesta orientativa (no vinculante)
                  </h5>
                  <p className="text-sm text-slate-800 whitespace-pre-line">
                    {chatAnswer}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* BLOQUE IMÁGENES MÉDICAS */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
        <h2 className="text-lg font-semibold">
          Imágenes médicas (RX / TAC / RM / ECO)
        </h2>
        <p className="text-sm text-slate-600">
          Indica el paciente seleccionado, el tipo de estudio y sube la imagen
          o PDF correspondiente. Se guardará en la ficha de ese paciente.
        </p>

        <form onSubmit={handleUploadImagen} className="space-y-3">
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="sr-label">Tipo de estudio</label>
              <select
                className="sr-input w-full"
                value={imgType}
                onChange={(e) => setImgType(e.target.value)}
              >
                <option value="RX">RX</option>
                <option value="TAC">TAC</option>
                <option value="RM">RM</option>
                <option value="ECO">ECO</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>
            <div>
              <label className="sr-label">Fichero de imagen o PDF</label>
              <input
                type="file"
                accept=".pdf,image/*"
                className="sr-input w-full"
                onChange={(e) =>
                  setFileImagen(e.target.files?.[0] || null)
                }
              />
            </div>
            <div>
              <label className="sr-label">
                Contexto clínico (opcional, se envía a la IA)
              </label>
              <textarea
                className="sr-input w-full min-h-[60px]"
                value={imgContext}
                onChange={(e) => setImgContext(e.target.value)}
                placeholder="Ej. Tos 3 días, fiebre, Rx de control..."
              />
            </div>
          </div>

          {imagenError && (
            <p className="text-sm text-red-600">{imagenError}</p>
          )}

          <button
            type="submit"
            disabled={loadingImagen || trialExpired}
            className="sr-btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loadingImagen ? "Analizando imagen..." : "Analizar imagen médica"}
          </button>

          {duplicateImagen && (
            <p className="mt-2 text-xs text-amber-700 flex items-center gap-1">
              <span>⚠</span>
              <span>
                Esta imagen ya estaba registrada (no se ha duplicado).
              </span>
            </p>
          )}
        </form>

        {(imagenSummary ||
          imagenDifferential ||
          imagenPatterns.length > 0 ||
          imagenFilePath) && (
          <div className="mt-4 space-y-4">
            {imagenSummary && (
              <div>
                <h3 className="text-sm font-semibold mb-1">
                  Resumen radiológico orientativo
                </h3>
                <p className="text-sm text-slate-800 whitespace-pre-line">
                  {imagenSummary}
                </p>
              </div>
            )}

            {imagenDifferential && (
              <div>
                <h3 className="text-sm font-semibold mb-1">
                  Diagnóstico diferencial general (orientativo)
                </h3>
                <p className="text-sm text-slate-800 whitespace-pre-line">
                  {imagenDifferential}
                </p>
              </div>
            )}

            {imagenFilePath && (
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold mb-1">Imagen analizada</h3>

                  <label className="flex items-center gap-2 text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={showImgOverlay}
                      onChange={() => setShowImgOverlay((v) => !v)}
                    />
                    Mostrar orientación visual
                  </label>

                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="hidden sm:inline">Modo:</span>
                    <select
                      className="sr-input text-xs py-1"
                      value={overlayMode}
                      onChange={(e) => setOverlayMode(e.target.value)}
                    >
                      <option value="auto">Auto</option>
                      <option value="msk-orient">MSK – Orientación</option>
                      <option value="msk-atlas">MSK – Atlas (Didáctico)</option>
                      <option value="vascular">Vascular</option>
                      <option value="off">Sin overlay</option>
                    </select>
                  </div>

                </div>

                <div className="relative inline-block mt-2 cursor-zoom-in" onClick={() => setImgModalOpen(true)}>
                  <img
                    src={imagenFilePath}
                    alt="Estudio de imagen médica"
                    ref={imgInlineRef}
                    className="relative z-10 max-w-xs md:max-w-sm w-full rounded-lg border border-slate-200"
                  />

                  {showImgOverlay && overlayMode !== "off" && (
                    (overlayMode === "vascular" || (overlayMode === "auto" && Array.isArray(activeOverlays) && (activeOverlays.includes("VESSEL_AXIS") || activeOverlays.includes("VESSEL_GUIDE")))) ? (
                      <>
                        <VascularOverlayReal imagingId={lastImagenId} enabled={true} imgRef={imgInlineRef} />
                        <VascularOverlaySvg />
    </>
                    ) : null
                  )}

                  {showImgOverlay && overlayMode !== "off" && (
                    ((overlayMode === "msk-orient" || overlayMode === "msk-atlas") || (overlayMode === "auto" && Array.isArray(activeOverlays) && activeOverlays.includes("FIBER_LINES"))) ? (
                      <MuscleOverlaySvg />
                    ) : null
                  )}

                </div>

                <p className="text-[10px] text-slate-500 mt-2">
                  Orientación visual ilustrativa. No delimita ni valora patología. (En MSK: guía didáctica por capas, no segmentación exacta.)
                </p>

                {imgModalOpen && (
                  <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3" onClick={() => setImgModalOpen(false)}>
                    <div className="bg-white rounded-xl max-w-5xl w-full p-3 sm:p-4 relative" onClick={(e) => e.stopPropagation()}>
                      <button type="button" onClick={() => setImgModalOpen(false)} className="absolute top-2 right-2 sr-btn-secondary text-xs" aria-label="Cerrar">✕</button>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                        <p className="text-sm font-semibold text-slate-900">Visor ampliado</p>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 text-xs text-slate-700">
                            <input type="checkbox" checked={showImgOverlay} onChange={() => setShowImgOverlay((v) => !v)} />
                            Mostrar orientación visual
                          </label>

                          <div className="flex items-center gap-2 text-xs text-slate-700">
                            <span className="hidden sm:inline">Modo:</span>
                            <select className="sr-input text-xs py-1" value={overlayMode} onChange={(e) => setOverlayMode(e.target.value)}>
                              <option value="auto">Auto</option>
                              <option value="msk-orient">MSK – Orientación</option>
                              <option value="msk-atlas">MSK – Atlas (Didáctico)</option>
                              <option value="vascular">Vascular</option>
                              <option value="off">Sin overlay</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="relative w-full">
                        <img src={imagenFilePath} alt="Estudio de imagen médica ampliado" ref={imgModalRef} className="relative z-10 w-full max-h-[75vh] object-contain rounded-lg border border-slate-200" />

                        {showImgOverlay && overlayMode !== "off" && (
  (overlayMode === "vascular" ||
    (overlayMode === "auto" &&
      Array.isArray(activeOverlays) &&
      (activeOverlays.includes("VESSEL_AXIS") ||
        activeOverlays.includes("VESSEL_GUIDE")))) ? (
    <>
      {/* ✅ Overlay vascular REAL (IA) */}
      <VascularOverlayReal
        imagingId={lastImagenId}
        enabled={true}
        imgRef={imgModalRef}
      />

      {/* Fallback direccional */}
      <VascularOverlaySvg />
    </>
  ) : null
)}


                            {((overlayMode === "msk-orient" || overlayMode === "msk-atlas") ||
  (overlayMode === "auto" && Array.isArray(activeOverlays) && activeOverlays.includes("FIBER_LINES"))) ? (
  overlayMode === "msk-atlas" ? (
    <div className="absolute inset-0 z-30 pointer-events-auto">
      <MskAtlasOverlay
        imagingId={lastImagenId}
        src={imagenFilePath}
        imgType={imgType}
        summary={imagenSummary}
        patterns={imagenPatterns}
      />
    </div>
  ) : (
    <MuscleOverlaySvg />
  )
) : null}

                        )}
                      </div>

                      <p className="text-[10px] text-slate-600 mt-2">
                        Guía didáctica/visual orientativa. No delimita ni valora patología. La interpretación final corresponde al profesional sanitario responsable.
                      </p>
                    </div>
                  </div>
                )}


              </div>
            )}

            {imagenPatterns.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2">
                  Patrones / hallazgos descritos
                </h3>
                <ul className="list-disc list-inside text-sm text-slate-800 space-y-1">
                  {imagenPatterns.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Mini chat radiológico */}
            <div className="mt-4 border-t border-slate-200 pt-3 space-y-2">
              <h4 className="text-sm font-semibold">
                Preguntar sobre la imagen (IA radiológica orientativa)
              </h4>
              <form onSubmit={handleImagingChat} className="space-y-2">
                <textarea
                  className="sr-input w-full min-h-[60px]"
                  value={imgChatQuestion}
                  onChange={(e) => setImgChatQuestion(e.target.value)}
                  placeholder="Ej. ¿Qué impresiona más relevante en esta imagen?"
                />
                {imgChatError && (
                  <p className="text-sm text-red-600">{imgChatError}</p>
                )}
                <button
                  type="submit"
                  disabled={imgChatLoading}
                  className="sr-btn-secondary disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {imgChatLoading ? "Pensando..." : "Preguntar a la IA radiológica"}
                </button>
              </form>

              {imgChatAnswer && (
                <div className="mt-2">
                  <h5 className="text-xs font-semibold mb-1">
                    Respuesta orientativa (no vinculante)
                  </h5>
                  <p className="text-sm text-slate-800 whitespace-pre-line">
                    {imgChatAnswer}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

{/* BLOQUE IMÁGENES QUIRÚRGICAS */}
<section className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
  <h2 className="text-lg font-semibold">Imágenes quirúrgicas (Antes / Después)</h2>
  <p className="text-sm text-slate-600">
    Sube fotografías quirúrgicas (antes/después/seguimiento). Se guardan en la ficha del paciente.
    La IA <strong>solo</strong> se ejecuta cuando pulsas <em>Analizar imagen</em>.
  </p>

  <form onSubmit={handleUploadCosmetic} className="space-y-3">
    <div className="grid md:grid-cols-3 gap-3">
      <div>
        <label className="sr-label">Tipo</label>
        <select className="sr-input w-full" value={cosType} onChange={(e) => setCosType(e.target.value)}>
          <option value="COSMETIC_PRE">Antes</option>
          <option value="COSMETIC_POST">Después</option>
          <option value="COSMETIC_FOLLOWUP">Seguimiento</option>
        </select>
      </div>

      <div>
        <label className="sr-label">Fichero (foto o PDF)</label>
        <input
          type="file"
          accept=".pdf,image/*"
          className="sr-input w-full"
          onChange={(e) => setFileCosmetic(e.target.files?.[0] || null)}
        />
      </div>

      <div>
        <label className="sr-label">Contexto (opcional)</label>
        <textarea
          className="sr-input w-full min-h-[60px]"
          value={cosContext}
          onChange={(e) => setCosContext(e.target.value)}
          placeholder="Ej. Rinoplastia primaria · 6 semanas post · marcajes visibles..."
        />
      </div>
    </div>

    {cosmeticError && <p className="text-sm text-red-600">{cosmeticError}</p>}

    <button
      type="submit"
      disabled={loadingCosmeticUpload || trialExpired}
      className="sr-btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loadingCosmeticUpload ? "Guardando imagen..." : "Guardar imagen quirúrgica"}
    </button>
  </form>

  {cosmeticFilePath && (
    <div className="mt-4 space-y-3">
      <div>
        <h3 className="text-sm font-semibold mb-1">Imagen guardada</h3>
        <img
          src={cosmeticFilePath}
          alt="Imagen quirúrgica"
          className="mt-2 max-w-xs md:max-w-sm w-full rounded-lg border border-slate-200"
        />
        {cosmeticId && (
          <p className="text-xs text-slate-500 mt-1">
            ID imagen: <span className="font-mono">{cosmeticId}</span>
          </p>
        )}
      </div>

      <div className="border-t border-slate-200 pt-3">
        <h4 className="text-sm font-semibold">🧠 Analizar imagen (bajo demanda)</h4>
        <p className="text-xs text-slate-600 mt-1">Análisis descriptivo. No diagnóstico.</p>

        {cosmeticAiError && <p className="text-sm text-red-600 mt-2">{cosmeticAiError}</p>}

        <button
          type="button"
          onClick={handleAnalyzeCosmetic}
          disabled={cosmeticAiLoading || !cosmeticId}
          className="sr-btn-secondary mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {cosmeticAiLoading ? "Analizando..." : "Analizar imagen"}
        </button>

        {cosmeticAiDraft && (
          <div className="mt-3 p-3 rounded-lg border border-slate-200 bg-slate-50/60">
            <p className="text-xs text-slate-500 mb-1">Sugerencia de descripción (IA) — borrador</p>
            <p className="text-sm text-slate-800 whitespace-pre-wrap">{cosmeticAiDraft}</p>
          </div>
        )}
      </div>

      

    </div>
  )}


  <div className="mt-4 border-t border-slate-200 pt-3">
  <h4 className="text-sm font-semibold">🔁 Comparar Antes / Después</h4>
  <p className="text-xs text-slate-600 mt-1">
    Elige una foto <strong>Antes</strong> y una <strong>Después</strong>. (Selector visual)
  </p>

  {cosmeticItemsLoading ? (
    <p className="text-xs text-slate-600 mt-2">Cargando imágenes quirúrgicas…</p>
  ) : cosmeticItemsError ? (
    <p className="text-sm text-red-600 mt-2">{cosmeticItemsError}</p>
  ) : cosmeticItems.length === 0 ? (
    <p className="text-xs text-slate-600 mt-2">Aún no hay imágenes quirúrgicas guardadas para este paciente.</p>
  ) : (
    <div className="mt-2 space-y-3">
      <div>
        <p className="text-xs font-semibold text-slate-700 mb-1">Antes</p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {cosmeticItems
            .filter((x) => String(x.type || "").toUpperCase() === "COSMETIC_PRE")
            .map((x) => {
              const active = String(selectedPreId) === String(x.id);
              const dateTxt = fmtDateCompact(x.exam_date || x.created_at);
              return (
                <button
                  key={x.id}
                  type="button"
                  onClick={() => setSelectedPreId(String(x.id))}
                  className={`flex-shrink-0 w-[96px] text-left rounded-lg border ${active ? "border-slate-900" : "border-slate-200 hover:border-slate-300"}`}
                  title={`ID ${x.id} · ${dateTxt}`}
                >
                  <img src={x.file_path} alt={`Antes ${x.id}`} className="w-full h-[72px] object-cover rounded-t-lg" />
                  <div className="px-2 py-1">
                    <p className="text-[10px] text-slate-600">ID {x.id}</p>
                    <p className="text-[10px] text-slate-500">{dateTxt}</p>
                  </div>
                </button>
              );
            })}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-700 mb-1">Después / Seguimiento</p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {cosmeticItems
            .filter((x) => {
              const t = String(x.type || "").toUpperCase();
              return t === "COSMETIC_POST" || t === "COSMETIC_FOLLOWUP";
            })
            .map((x) => {
              const active = String(selectedPostId) === String(x.id);
              const dateTxt = fmtDateCompact(x.exam_date || x.created_at);
              const label = String(x.type || "").toUpperCase().replace("COSMETIC_", "");
              return (
                <button
                  key={x.id}
                  type="button"
                  onClick={() => setSelectedPostId(String(x.id))}
                  className={`flex-shrink-0 w-[96px] text-left rounded-lg border ${active ? "border-slate-900" : "border-slate-200 hover:border-slate-300"}`}
                  title={`ID ${x.id} · ${label} · ${dateTxt}`}
                >
                  <img src={x.file_path} alt={`Después ${x.id}`} className="w-full h-[72px] object-cover rounded-t-lg" />
                  <div className="px-2 py-1">
                    <p className="text-[10px] text-slate-600">ID {x.id} · {label}</p>
                    <p className="text-[10px] text-slate-500">{dateTxt}</p>
                  </div>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  )}

  {cosCompareError && <p className="text-sm text-red-600 mt-2">{cosCompareError}</p>}

  <button
    type="button"
    onClick={handleCompareCosmetic}
    disabled={cosCompareLoading || !selectedPreId || !selectedPostId}
    className="sr-btn-secondary mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
  >
    {cosCompareLoading ? "Comparando..." : "Comparar"}
  </button>

  {cosCompareResult && (
    <div className="mt-3 p-3 rounded-lg border border-slate-200 bg-slate-50/60">
      <p className="text-xs text-slate-500 mb-1">Comparativa descriptiva (IA) — borrador</p>
      <p className="text-sm text-slate-800 whitespace-pre-wrap">{cosCompareResult}</p>
    </div>
  )}
<div className="mt-3 border-t border-slate-200 pt-3">
  <h4 className="text-sm font-semibold">📄 PDF quirúrgico (Antes / Después)</h4>
  <p className="text-xs text-slate-600 mt-1">
    Genera un PDF con imágenes lado a lado + texto comparativo. La nota del cirujano es opcional.
  </p>

  <label className="sr-label mt-2">Nota del cirujano (opcional)</label>
  <textarea
    className="sr-input w-full min-h-[70px]"
    value={cosNote}
    onChange={(e) => setCosNote(e.target.value)}
    placeholder="Ej. Seguimiento a 6 semanas. Edema esperado. Revisión en 3 meses..."
  />

  {cosPdfError && <p className="text-sm text-red-600 mt-2">{cosPdfError}</p>}

  <button
    type="button"
    onClick={handleGenerateCosmeticPdf}
    disabled={cosPdfLoading}
    className="sr-btn-secondary mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
  >
    {cosPdfLoading ? "Generando PDF..." : "📄 Generar PDF"}
  </button>
</div>

</div>
</section>

    </main>
  );
}