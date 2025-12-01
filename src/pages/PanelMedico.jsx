
// src/pages/PanelMedico.jsx — Panel médico con Analíticas + Imágenes · Galenos.pro
import React, { useState } from "react";

// URL del backend de Galenos (Render)
const API =
  import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

export default function PanelMedico() {
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

  // ========================
  // ESTADO IMÁGENES
  // ========================
  const [patientIdImagen, setPatientIdImagen] = useState("");
  const [imgType, setImgType] = useState("RX");
  const [imgContext, setImgContext] = useState("");
  const [fileImagen, setFileImagen] = useState(null);
  const [loadingImagen, setLoadingImagen] = useState(false);
  const [imagenError, setImagenError] = useState("");
  const [imagenSummary, setImagenSummary] = useState("");
  const [imagenDifferential, setImagenDifferential] = useState("");
  const [imagenPatterns, setImagenPatterns] = useState([]);

  const token = localStorage.getItem("galenos_token");

  // ========================
  // HANDLERS ANALÍTICAS
  // ========================
  async function handleUploadAnalitica(e) {
    e.preventDefault();
    setAnalyticsError("");
    setAnalyticsResult(null);
    setChatAnswer("");
    setChatError("");

    if (!alias.trim()) {
      setAnalyticsError("Introduce un alias para la analítica (ej. 0001 - Nombre).");
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
      const res = await fetch(`${API}/analytics/analyze`, {
        method: "POST",
        body: formData,
      });

      const raw = await res.text();
      console.log("👉 Respuesta IA analítica (raw):", raw);

      if (!res.ok) {
        let msg = "No se ha podido analizar la analítica.";
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

      setAnalyticsResult(data);
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
      setChatError("Primero analiza una analítica.");
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
        let msg = "No se ha podido generar una respuesta de IA para la analítica.";
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

    if (!token) {
      setImagenError("No hay sesión activa. Vuelve a iniciar sesión.");
      return;
    }

    const pid = parseInt(patientIdImagen, 10);
    if (!pid || Number.isNaN(pid)) {
      setImagenError("Introduce un ID de paciente válido (número). Puedes verlo en la página Pacientes.");
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

      setImagenSummary(data.summary || "");
      setImagenDifferential(data.differential || "");
      if (Array.isArray(data.patterns)) {
        setImagenPatterns(data.patterns.map((p) => p.pattern_text || String(p)));
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

  // ========================
  // RENDER
  // ========================
  return (
    <main className="sr-container py-6 space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Panel médico · Galenos.pro</h1>
        <p className="text-sm text-slate-600">
          Sube analíticas e imágenes médicas vinculadas a tus pacientes. Galenos te ayuda a
          interpretar de forma prudente los resultados, sin sustituir tu criterio clínico.
        </p>
      </header>

      {/* BLOQUE ANALÍTICAS */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
        <h2 className="text-lg font-semibold">Analíticas de laboratorio</h2>
        <p className="text-sm text-slate-600">
          Sube analíticas (PDF, foto, captura). Galenos extraerá marcadores, rangos y un resumen
          clínico orientativo.
        </p>

        <form onSubmit={handleUploadAnalitica} className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
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
              <label className="sr-label">Fichero de analítica</label>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => setFileAnalitica(e.target.files?.[0] || null)}
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
            {loadingAnalitica ? "Analizando analítica..." : "Analizar analítica"}
          </button>
        </form>

        {analyticsResult && (
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-1">
                Resultado para {analyticsResult.patient_alias}
              </h3>
              <p className="text-xs text-slate-500">
                Fichero:{" "}
                <span className="font-mono">
                  {analyticsResult.file_name}
                </span>
              </p>
            </div>

            {analyticsResult.summary && (
              <div>
                <h4 className="text-sm font-semibold mb-1">Resumen orientativo</h4>
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
                  <h4 className="text-sm font-semibold mb-2">Marcadores extraídos</h4>
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
                          <tr key={idx} className="border-t border-slate-200">
                            <td className="px-2 py-1">{m.name}</td>
                            <td className="px-2 py-1">
                              {m.value !== null && m.value !== undefined ? m.value : ""}
                            </td>
                            <td className="px-2 py-1">{m.range || ""}</td>
                            <td className="px-2 py-1">
                              {m.status === "elevado" && (
                                <span className="text-red-600 font-medium">Alto</span>
                              )}
                              {m.status === "bajo" && (
                                <span className="text-amber-600 font-medium">Bajo</span>
                              )}
                              {m.status === "normal" && (
                                <span className="text-emerald-700 font-medium">Normal</span>
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
          Indica el ID del paciente (lo puedes ver en la página Pacientes), el tipo de estudio
          y sube la imagen o PDF correspondiente.
        </p>

        <form onSubmit={handleUploadImagen} className="space-y-3">
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="sr-label">ID de paciente</label>
              <input
                type="number"
                className="sr-input w-full"
                value={patientIdImagen}
                onChange={(e) => setPatientIdImagen(e.target.value)}
                placeholder="Ej. 1"
              />
            </div>
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
                onChange={(e) => setFileImagen(e.target.files?.[0] || null)}
              />
            </div>
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
        </form>

        {(imagenSummary || imagenPatterns.length > 0) && (
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
          </div>
        )}
      </section>
    </main>
  );
}
