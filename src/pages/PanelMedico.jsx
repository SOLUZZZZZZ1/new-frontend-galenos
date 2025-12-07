// src/pages/PanelMedico.jsx — Panel médico con Analíticas + Imágenes · Galenos.pro
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API =
  import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

export default function PanelMedico() {
  const navigate = useNavigate();
  const token = localStorage.getItem("galenos_token");

  // ========================
  // CANCELACIÓN SUSCRIPCIÓN (PRO)
  // ========================
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [cancelReasonCategory, setCancelReasonCategory] = useState("");
  const [cancelReasonText, setCancelReasonText] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelMessage, setCancelMessage] = useState("");
  const [cancelError, setCancelError] = useState("");

  async function handleCancelSubscription(e) {
    e.preventDefault();
    setCancelError("");
    setCancelMessage("");

    if (!cancelReasonCategory.trim()) {
      setCancelError("Selecciona un motivo antes de continuar.");
      return;
    }

    try {
      setCancelLoading(true);

      const res = await fetch(`${API}/billing/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason_category: cancelReasonCategory,
          reason_text: cancelReasonText.trim(),
        }),
      });

      const raw = await res.text();
      console.log("👉 Respuesta cancelación (raw):", raw);

      if (!res.ok) {
        setCancelError("No se pudo cancelar la suscripción.");
        return;
      }

      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        setCancelError("Respuesta inesperada del servidor de pagos.");
        return;
      }

      setCancelMessage("Suscripción cancelada correctamente.");
      // Opcional: desactivar PRO en local
      localStorage.removeItem("galenos_pro");
    } catch (err) {
      console.error("❌ Error cancelando suscripción:", err);
      setCancelError("Error al conectar con el servidor de pagos.");
    } finally {
      setCancelLoading(false);
    }
  }

  // ========================
  // ESTADO ANALÍTICAS
  // ========================
  const [alias, setAlias] = useState("Paciente A");
  const [patientIdAnalitica, setPatientIdAnalitica] = useState("");
  const [fileAnalitica, setFileAnalitica] = useState(null);
  const [examDateAnalitica, setExamDateAnalitica] = useState("");
  const [loadingAnalitica, setLoadingAnalitica] = useState(false);
  const [analyticsError, setAnalyticsError] = useState("");
  const [analyticsResult, setAnalyticsResult] = useState(null);

  const [chatQuestion, setChatQuestion] = useState("");
  const [chatAnswer, setChatAnswer] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");

  const [lastAnalyticId, setLastAnalyticId] = useState(null);
  const [duplicateAnalytic, setDuplicateAnalytic] = useState(false);

  // ========================
  // ESTADO IMÁGENES
  // ========================
  const [patientIdImagen, setPatientIdImagen] = useState("");
  const [imgType, setImgType] = useState("RX");
  const [imgContext, setImgContext] = useState("");
  const [fileImagen, setFileImagen] = useState(null);
  const [examDateImagen, setExamDateImagen] = useState("");
  const [loadingImagen, setLoadingImagen] = useState(false);
  const [imagenError, setImagenError] = useState("");
  const [imagenSummary, setImagenSummary] = useState("");
  const [imagenDifferential, setImagenDifferential] = useState("");
  const [imagenPatterns, setImagenPatterns] = useState([]);

  const [imgChatQuestion, setImgChatQuestion] = useState("");
  const [imgChatAnswer, setImgChatAnswer] = useState("");
  const [imgChatError, setImgChatError] = useState("");
  const [imgChatLoading, setImgChatLoading] = useState(false);

  const [lastImagenId, setLastImagenId] = useState(null);
  const [duplicateImagen, setDuplicateImagen] = useState(false);

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

    const pid = parseInt(patientIdAnalitica, 10);
    if (!pid || Number.isNaN(pid)) {
      setAnalyticsError(
        "Introduce un ID de paciente válido (número). Puedes verlo en la página Pacientes."
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
    if (examDateAnalitica) {
      formData.append("exam_date", examDateAnalitica);
    }

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
          if (errData.detail) msg = errData.detail;
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

      if (lastAnalyticId && data.id && data.id === lastAnalyticId) {
        setDuplicateAnalytic(true);
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
        exam_date: data.exam_date || null,
        created_at: data.created_at || null,
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
          if (errData.detail) msg = errData.detail;
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
    setImgChatAnswer("");
    setImgChatError("");
    setDuplicateImagen(false);

    if (!token) {
      setImagenError("No hay sesión activa. Vuelve a iniciar sesión.");
      return;
    }

    const pid = parseInt(patientIdImagen, 10);
    if (!pid || Number.isNaN(pid)) {
      setImagenError(
        "Introduce un ID de paciente válido (número). Puedes verlo en la página Pacientes."
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
    if (examDateImagen) {
      formData.append("exam_date", examDateImagen);
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
          if (errData.detail) msg = errData.detail;
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

      if (lastImagenId && data.id && data.id === lastImagenId) {
        setDuplicateImagen(true);
        setTimeout(() => setDuplicateImagen(false), 5000);
      }
      setLastImagenId(data.id || null);

      setImagenSummary(data.summary || "");
      setImagenDifferential(data.differential || "");
      if (Array.isArray(data.patterns)) {
        setImagenPatterns(
          data.patterns.map((p) => p.pattern_text || String(p))
        );
      } else {
        setImagenPatterns([]);
      }
    } catch (err) {
      console.error("❌ Error imagen médica:", err);
      setImagenError("Error de conexión con el servidor de imagen.");
    } finally {
      setLoadingImagen(false);
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

    const payload = {
      patient_alias: null,
      summary: imagenSummary || "",
      patterns: imagenPatterns || [],
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
          if (errData.detail) msg = errData.detail;
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
  // RENDER
  // ========================
  return (
    <main className="sr-container py-6 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Panel médico · Galenos.pro</h1>
          <p className="text-sm text-slate-600">
            Sube analíticas e imágenes médicas vinculadas a tus pacientes. Galenos te ayuda a
            interpretar de forma prudente los resultados, sin sustituir tu criterio clínico.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => navigate("/pacientes")}
            className="sr-btn-secondary text-sm whitespace-nowrap"
          >
            Gestionar pacientes
          </button>
          <button
            type="button"
            onClick={() => setShowCancelPopup(true)}
            className="sr-btn-secondary text-sm whitespace-nowrap border-red-300 text-red-600 hover:bg-red-50"
          >
            Cancelar suscripción PRO
          </button>
        </div>
      </header>

      {/* BLOQUE ANALÍTICAS */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
        <h2 className="text-lg font-semibold">Analíticas de laboratorio</h2>
        <p className="text-sm text-slate-600">
          Sube analíticas (PDF, foto, captura). Galenos extraerá marcadores, rangos y un resumen
          clínico orientativo. Usando el ID del paciente, la analítica se guardará en su ficha.
        </p>

        <form onSubmit={handleUploadAnalitica} className="space-y-3">
          <div className="grid md:grid-cols-4 gap-3">
            <div>
              <label className="sr-label">ID de paciente</label>
              <input
                type="number"
                value={patientIdAnalitica}
                onChange={(e) => setPatientIdAnalitica(e.target.value)}
                className="sr-input w-full"
                placeholder="Ej. 1"
              />
            </div>
            <div>
              <label className="sr-label">Alias / identificador del paciente</label>
              <input
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                className="sr-input w-full"
                placeholder="0001 - Nombre Apellidos"
              />
            </div>
            <div>
              <label className="sr-label">Fecha de la analítica</label>
              <input
                type="date"
                className="sr-input w-full"
                value={examDateAnalitica}
                onChange={(e) => setExamDateAnalitica(e.target.value)}
              />
            </div>
            <div>
              <label className="sr-label">Fichero de analítica</label>
              {/* etc, resto del render como en tu versión */}
            </div>
          </div>
          {/* ... sigue igual que en el código anterior que ya te he pegado completo ... */}
        </form>
      </section>

      {/* BLOQUE IMÁGENES y POPUP cancelación PRO también como en tu código completo */}
      {/* ... (resto del JSX igual que en el código anterior) ... */}

      {showCancelPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          {/* popup */}
        </div>
      )}
    </main>
  );
}
