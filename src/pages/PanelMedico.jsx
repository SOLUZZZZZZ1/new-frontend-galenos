// src/pages/PanelMedico.jsx — Panel médico con Analíticas + Imágenes · Galenos.pro
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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

  async function handleStripeCheckout() {
    setBillingError("");

    if (!token) {
      setBillingError("No hay sesión activa. Vuelve a iniciar sesión.");
      navigate("/login");
      return;
    }

    try {
      setBillingLoading(true);
      const res = await fetch(`${API}/billing/create-checkout-session-auth`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const raw = await res.text();
      console.log(
        "👉 [Billing] Respuesta create-checkout-session-auth (raw):",
        raw
      );

      if (!res.ok) {
        let msg = "No se ha podido iniciar el pago con Stripe.";
        try {
          const errData = JSON.parse(raw);
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
        data = JSON.parse(raw);
      } catch {
        setBillingError("Respuesta inesperada del servidor de pagos.");
        return;
      }

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        setBillingError("No se ha recibido la URL de pago de Stripe.");
      }
    } catch (err) {
      console.error("❌ Error iniciando checkout Stripe:", err);
      setBillingError("Error de conexión al iniciar el pago con Stripe.");
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
          if (errData.detail) msg = errData.detail;
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

  useEffect(() => {
    loadPatients();
  }, []);

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
          if (errData.detail) msg = errData.detail;
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

  // Chat radiológico
  const [imgChatQuestion, setImgChatQuestion] = useState("");
  const [imgChatAnswer, setImgChatAnswer] = useState("");
  const [imgChatError, setImgChatError] = useState("");
  const [imgChatLoading, setImgChatLoading] = useState(false);

  // Detección de duplicados (imágenes)
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
    setImagenFilePath("");
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

      if (data.file_path) {
        setImagenFilePath(data.file_path);
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
        <p className="text-xs text-sky-700">
          Prueba gratuita interna de <strong>10 días</strong> desde el alta en
          Galenos. El pago con Stripe activa y mantiene tu suscripción PRO.
        </p>
        {billingError && (
          <p className="text-xs text-red-600">{billingError}</p>
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
              : "Activar / gestionar Galenos PRO"}
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
                disabled={creatingPatient}
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
            disabled={loadingAnalitica}
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
            disabled={loadingImagen}
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
                <h3 className="text-sm font-semibold mb-1">
                  Imagen analizada
                </h3>
                <img
                  src={imagenFilePath}
                  alt="Estudio de imagen médica"
                  className="mt-2 max-w-xs md:max-w-sm w-full rounded-lg border border-slate-200"
                />
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
    </main>
  );
}
