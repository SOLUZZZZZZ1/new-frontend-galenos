
// src/pages/PanelMedico.jsx — Panel médico Galenos.pro
// Dos espacios bien separados:
// 1) Analíticas (PDF / imagen) → /analytics/analyze + /analytics/chat
// 2) Imágenes médicas (RX / TAC / RM / ECO) → /imaging/upload + /imaging/chat

import React, { useState } from "react";

const API =
  import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

export default function PanelMedico() {
  // ----------------------------
  // Estado ANALÍTICAS
  // ----------------------------
  const [aliasAnalitica, setAliasAnalitica] = useState("");
  const [fileAnalitica, setFileAnalitica] = useState(null);
  const [loadingAnalitica, setLoadingAnalitica] = useState(false);
  const [markers, setMarkers] = useState([]);
  const [summary, setSummary] = useState("");
  const [differential, setDifferential] = useState("");
  const [analyticsError, setAnalyticsError] = useState("");

  const [chatQuestion, setChatQuestion] = useState("");
  const [chatAnswer, setChatAnswer] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");

  // ----------------------------
  // Estado IMAGEN MÉDICA
  // ----------------------------
  const [patientIdImagen, setPatientIdImagen] = useState("");
  const [imgType, setImgType] = useState("RX");
  const [imgContext, setImgContext] = useState("");
  const [fileImagen, setFileImagen] = useState(null);

  const [loadingImagen, setLoadingImagen] = useState(false);
  const [imagenSummary, setImagenSummary] = useState("");
  const [imagenDifferential, setImagenDifferential] = useState("");
  const [imagenPatterns, setImagenPatterns] = useState([]);
  const [imagenError, setImagenError] = useState("");

  const [imgChatQuestion, setImgChatQuestion] = useState("");
  const [imgChatAnswer, setImgChatAnswer] = useState("");
  const [imgChatLoading, setImgChatLoading] = useState(false);
  const [imgChatError, setImgChatError] = useState("");

  // ----------------------------
  // Handlers ANALÍTICAS
  // ----------------------------
  async function handleUploadAnalitica(e) {
    e.preventDefault();
    setAnalyticsError("");
    setSummary("");
    setDifferential("");
    setMarkers([]);
    setChatAnswer("");
    setChatError("");

    if (!aliasAnalitica.trim()) {
      setAnalyticsError("Introduce un alias o identificador para el paciente.");
      return;
    }
    if (!fileAnalitica) {
      setAnalyticsError("Selecciona un fichero de analítica (PDF o imagen).");
      return;
    }

    const formData = new FormData();
    formData.append("alias", aliasAnalitica.trim());
    formData.append("file", fileAnalitica);

    try {
      setLoadingAnalitica(true);
      const res = await fetch(`${API}/analytics/analyze`, {
        method: "POST",
        body: formData,
      });

      const raw = await res.text();
      // console.log("👉 Respuesta IA analítica (raw):", raw);

      if (!res.ok) {
        let msg = "No se ha podido analizar la analítica.";
        try {
          const errData = JSON.parse(raw);
          if (errData.detail) msg = errData.detail;
        } catch {
          // ignore
        }
        setAnalyticsError(msg);
        return;
      }

      let data;
      try {
        data = JSON.parse(raw);
      } catch (err) {
        setAnalyticsError("Respuesta inesperada del servidor de analíticas.");
        return;
      }

      setSummary(data.summary || "");
      setDifferential(data.differential || "");
      setMarkers(Array.isArray(data.markers) ? data.markers : []);
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

    if (!chatQuestion.trim()) {
      setChatError("Escribe una pregunta para la IA clínica.");
      return;
    }

    try {
      setChatLoading(true);
      const body = {
        patient_alias: aliasAnalitica || "el paciente",
        file_name: null,
        markers,
        summary,
        differential,
        question: chatQuestion,
      };

      const res = await fetch(`${API}/analytics/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const raw = await res.text();
      // console.log("👉 Respuesta chat analítica (raw):", raw);

      if (!res.ok) {
        let msg = "No se ha podido generar una respuesta para la analítica.";
        try {
          const errData = JSON.parse(raw);
          if (errData.detail) msg = errData.detail;
        } catch {
          // ignore
        }
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
    } catch (err) {
      console.error("❌ Error en chat de analíticas:", err);
      setChatError("Error de conexión con el servidor de analíticas.");
    } finally {
      setChatLoading(false);
    }
  }

  // ----------------------------
  // Handlers IMAGEN
  // ----------------------------
  async function handleUploadImagen(e) {
    e.preventDefault();
    setImagenError("");
    setImagenSummary("");
    setImagenDifferential("");
    setImagenPatterns([]);
    setImgChatAnswer("");
    setImgChatError("");

    const pid = parseInt(patientIdImagen, 10);
    if (!pid || Number.isNaN(pid)) {
      setImagenError("Introduce un ID de paciente válido (número).");
      return;
    }
    if (!fileImagen) {
      setImagenError("Selecciona un fichero de imagen (JPG/PNG/PDF, etc.).");
      return;
    }

    const formData = new FormData();
    formData.append("patient_id", String(pid));
    formData.append("img_type", imgType || "imagen");
    if (imgContext && imgContext.trim()) {
      formData.append("context", imgContext.trim());
    }
    formData.append("file", fileImagen);

    const token = localStorage.getItem("galenos_token");
    if (!token) {
      setImagenError("No hay sesión activa. Vuelve a iniciar sesión.");
      return;
    }

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
      // console.log("👉 Respuesta imagen (raw):", raw);

      if (!res.ok) {
        let msg = "No se ha podido analizar la imagen médica.";
        try {
          const errData = JSON.parse(raw);
          if (errData.detail) msg = errData.detail;
        } catch {
          // ignore
        }
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
        // Si ImagingReturn incluye patterns directamente
        setImagenPatterns(data.patterns.map((p) => p.pattern_text || String(p)));
      } else {
        // Si no vienen, dejamos vacío; en el futuro podemos hacer un fetch de patterns
        setImagenPatterns([]);
      }
    } catch (err) {
      console.error("❌ Error enviando imagen médica:", err);
      setImagenError("Error de conexión con el servidor de imagen.");
    } finally {
      setLoadingImagen(false);
    }
  }

  async function handleImagenChat(e) {
    e.preventDefault();
    setImgChatError("");
    setImgChatAnswer("");

    if (!imgChatQuestion.trim()) {
      setImgChatError("Escribe una pregunta para la IA radiológica.");
      return;
    }

    const token = localStorage.getItem("galenos_token");
    if (!token) {
      setImgChatError("No hay sesión activa. Vuelve a iniciar sesión.");
      return;
    }

    try {
      setImgChatLoading(true);
      const body = {
        patient_alias: aliasAnalitica || "el paciente",
        summary: imagenSummary,
        patterns: imagenPatterns,
        question: imgChatQuestion,
      };

      const res = await fetch(`${API}/imaging/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const raw = await res.text();
      // console.log("👉 Respuesta chat imagen (raw):", raw);

      if (!res.ok) {
        let msg = "No se ha podido generar una respuesta para la imagen médica.";
        try {
          const errData = JSON.parse(raw);
          if (errData.detail) msg = errData.detail;
        } catch {
          // ignore
        }
        setImgChatError(msg);
        return;
      }

      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        setImgChatError("Respuesta inesperada del chat de imagen.");
        return;
      }

      setImgChatAnswer(data.answer || "");
    } catch (err) {
      console.error("❌ Error en chat de imagen:", err);
      setImgChatError("Error de conexión con el servidor de imagen.");
    } finally {
      setImgChatLoading(false);
    }
  }

  return (
    <main className="sr-container py-6 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Panel médico · Galenos.pro</h1>
        <p className="text-sm text-slate-600">
          Sube analíticas e imágenes médicas vinculadas a tus pacientes. Galenos te ayuda a
          interpretar de forma prudente los resultados, sin sustituir tu criterio clínico.
        </p>
      </header>

      {/* BLOQUE ANALÍTICAS */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
        <h2 className="text-lg font-semibold mb-1">Analíticas de laboratorio</h2>
        <p className="text-sm text-slate-600 mb-2">
          Sube analíticas (PDF, foto, captura de pantalla). Galenos extraerá los marcadores,
          rangos y un resumen clínico orientativo.
        </p>

        <form onSubmit={handleUploadAnalitica} className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="sr-label">Alias / identificador del paciente</label>
              <input
                type="text"
                value={aliasAnalitica}
                onChange={(e) => setAliasAnalitica(e.target.value)}
                className="sr-input w-full"
                placeholder="Ej. Paciente A, María 54 años..."
              />
            </div>
            <div>
              <label className="sr-label">Fichero de analítica (PDF o imagen)</label>
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
            className="sr-btn-primary mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loadingAnalitica ? "Analizando analítica..." : "Analizar analítica"}
          </button>
        </form>

        {/* Resultados de analítica */}
        {(summary || markers.length > 0) && (
          <div className="mt-4 space-y-4">
            {summary && (
              <div>
                <h3 className="text-sm font-semibold mb-1">Resumen orientativo</h3>
                <p className="text-sm text-slate-800 whitespace-pre-line">{summary}</p>
              </div>
            )}

            {differential && (
              <div>
                <h3 className="text-sm font-semibold mb-1">
                  Diagnóstico diferencial (orientativo)
                </h3>
                <p className="text-sm text-slate-800 whitespace-pre-line">
                  {differential}
                </p>
              </div>
            )}

            {markers.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Marcadores extraídos</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border border-slate-200 rounded-md overflow-hidden">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-2 py-1 text-left">Marcador</th>
                        <th className="px-2 py-1 text-left">Valor</th>
                        <th className="px-2 py-1 text-left">Rango</th>
                        <th className="px-2 py-1 text-left">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {markers.map((m, idx) => (
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

            {/* Mini chat sobre analítica */}
            <div className="mt-4 border-t border-slate-200 pt-4 space-y-2">
              <h3 className="text-sm font-semibold">Preguntar sobre la analítica</h3>
              <form onSubmit={handleAnalyticsChat} className="space-y-2">
                <textarea
                  className="sr-input w-full min-h-[60px]"
                  value={chatQuestion}
                  onChange={(e) => setChatQuestion(e.target.value)}
                  placeholder="Ej. ¿Cómo interpretarías la evolución de la PCR y los leucocitos?"
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
                  <h4 className="text-xs font-semibold mb-1">
                    Respuesta orientativa (no vinculante)
                  </h4>
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
        <h2 className="text-lg font-semibold mb-1">Imágenes médicas (RX / TAC / RM / ECO)</h2>
        <p className="text-sm text-slate-600 mb-2">
          Sube imágenes médicas vinculadas a un paciente (radiografía, TAC, RM, ecografía, etc.).
          Galenos describirá los hallazgos de forma prudente y te ayudará a documentar.
        </p>

        <form onSubmit={handleUploadImagen} className="space-y-3">
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="sr-label">ID de paciente</label>
              <input
                type="number"
                value={patientIdImagen}
                onChange={(e) => setPatientIdImagen(e.target.value)}
                className="sr-input w-full"
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
                onChange={(e) => setFileImagen(e.target.files?.[0] || null)}
                className="sr-input w-full"
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
              placeholder="Ej. Tos y fiebre 3 días. Rx de control. Sin antecedentes respiratorios relevantes..."
            />
          </div>

          {imagenError && (
            <p className="text-sm text-red-600">{imagenError}</p>
          )}

          <button
            type="submit"
            disabled={loadingImagen}
            className="sr-btn-primary mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loadingImagen ? "Analizando imagen..." : "Analizar imagen médica"}
          </button>
        </form>

        {(imagenSummary || imagenPatterns.length > 0) && (
          <div className="mt-4 space-y-4">
            {imagenSummary && (
              <div>
                <h3 className="text-sm font-semibold mb-1">Resumen radiológico orientativo</h3>
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
                <h3 className="text-sm font-semibold mb-2">Patrones / hallazgos descritos</h3>
                <ul className="list-disc list-inside text-sm text-slate-800 space-y-1">
                  {imagenPatterns.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Mini chat sobre imagen */}
            <div className="mt-4 border-t border-slate-200 pt-4 space-y-2">
              <h3 className="text-sm font-semibold">
                Preguntar sobre la imagen (apoyo radiológico)
              </h3>
              <form onSubmit={handleImagenChat} className="space-y-2">
                <textarea
                  className="sr-input w-full min-h-[60px]"
                  value={imgChatQuestion}
                  onChange={(e) => setImgChatQuestion(e.target.value)}
                  placeholder="Ej. ¿Qué hallazgo destacarías en el informe? ¿Puede encajar con un proceso infeccioso?"
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
                  <h4 className="text-xs font-semibold mb-1">
                    Respuesta orientativa (no vinculante)
                  </h4>
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
