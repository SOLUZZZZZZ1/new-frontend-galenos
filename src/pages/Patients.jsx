// src/pages/Patients.jsx — Analíticas · IA (MVP + mini chat) para Galenos.pro
import React, { useState } from "react";

// URL del backend de Galenos (Render)
const API = import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

export default function Patients() {
  const [alias, setAlias] = useState("Paciente A");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);
    setChatMessages([]);

    if (!file) {
      setError("Por favor, sube una analítica en PDF o imagen.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("alias", alias);
      formData.append("file", file);

      console.log("🔥 Enviando analítica a:", `${API}/analytics/analyze`);

      const res = await fetch(`${API}/analytics/analyze`, {
        method: "POST",
        body: formData,
      });

      const raw = await res.text();
      console.log("👉 Respuesta IA (raw):", raw);

      if (!res.ok) {
        setError(`Error del servidor (${res.status}). Mira la consola.`);
        return;
      }

      const data = JSON.parse(raw);
      setResult(data);
    } catch (err) {
      console.error("❌ Error al llamar a IA de analíticas:", err);
      setError("No se ha podido conectar con el backend de IA.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSendQuestion(e) {
    e.preventDefault();
    if (!chatInput.trim() || !result) return;

    const question = chatInput.trim();
    setChatInput("");

    const newMessages = [
      ...chatMessages,
      { from: "doctor", text: question },
    ];
    setChatMessages(newMessages);
    setChatLoading(true);
    setError("");

    try {
      const payload = {
        patient_alias: result.patient_alias,
        file_name: result.file_name,
        markers: result.markers,
        summary: result.summary,
        differential: result.differential,
        question,
      };

      console.log("🔥 Enviando pregunta de chat a:", `${API}/analytics/chat`);

      const res = await fetch(`${API}/analytics/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const raw = await res.text();
      console.log("👉 Respuesta chat IA (raw):", raw);

      if (!res.ok) {
        setError(`Error en el chat de IA (${res.status}). Mira la consola.`);
        setChatLoading(false);
        return;
      }

      const data = JSON.parse(raw);
      const aiText = data.answer || "No se ha podido generar una respuesta.";

      setChatMessages([
        ...newMessages,
        { from: "ia", text: aiText },
      ]);
    } catch (err) {
      console.error("❌ Error en el chat de IA:", err);
      setError("No se ha podido conectar con el chat de IA.");
    } finally {
      setChatLoading(false);
    }
  }

  return (
    <section className="space-y-4">
      <div className="border-b border-slate-200 pb-3 mb-3">
        <h2 className="sr-h1 text-xl mb-1">Analíticas · IA (MVP)</h2>
        <p className="sr-p text-sm text-slate-600">
          Sube una analítica en PDF o imagen. Esta versión MVP utiliza marcadores de ejemplo y
          genera un resumen clínico orientativo y un diagnóstico diferencial a valorar.
          La decisión final es siempre del médico responsable.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sr-card">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
          <div className="flex-1">
            <label className="sr-label" htmlFor="alias">
              Alias del paciente
            </label>
            <input
              id="alias"
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              className="sr-input w-full"
              placeholder="Ej. Paciente A"
            />
          </div>

          <div className="flex-1">
            <label className="sr-label" htmlFor="file">
              Analítica (PDF o imagen)
            </label>
            <input
              id="file"
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => setFile(e.target.files[0] || null)}
              className="sr-input w-full bg-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={uploading}
            className="sr-btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {uploading ? "Procesando con IA..." : "Enviar a IA"}
          </button>
          {file && (
            <span className="sr-small text-slate-600 truncate max-w-xs">
              {file.name}
            </span>
          )}
        </div>

        {error && (
          <p className="sr-small text-red-600">
            {error}
          </p>
        )}
      </form>

      <div className="sr-card space-y-3">
        <p className="sr-small text-slate-500">
          Galenos.pro no diagnostica ni prescribe. Es una herramienta de apoyo al médico.
        </p>

        {!result && !uploading && (
          <p className="sr-p text-sm text-slate-500">
            Cuando subas una analítica, aquí aparecerán los marcadores detectados junto con un
            resumen orientativo generado por IA. Esta versión MVP usa datos de ejemplo.
          </p>
        )}

        {uploading && (
          <p className="sr-p text-sm text-slate-600">
            Procesando con IA...
          </p>
        )}

        {result && (
          <div className="space-y-4">
            <div>
              <h3 className="sr-h1 text-lg mb-1">Resultado para {result.patient_alias}</h3>
              <p className="sr-small text-slate-500">
                Fichero: <span className="font-mono text-xs">{result.file_name}</span>
              </p>
            </div>

            <div>
              <h4 className="sr-h1 text-base mb-1">Marcadores (demo)</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left border-b border-slate-200">Parámetro</th>
                      <th className="px-3 py-2 text-left border-b border-slate-200">Valor</th>
                      <th className="px-3 py-2 text-left border-b border-slate-200">Rango</th>
                      <th className="px-3 py-2 text-left border-b border-slate-200">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.markers?.map((m, idx) => (
                      <tr key={idx} className="odd:bg-white even:bg-slate-50">
                        <td className="px-3 py-2 border-b border-slate-100">{m.name}</td>
                        <td className="px-3 py-2 border-b border-slate-100">{m.value}</td>
                        <td className="px-3 py-2 border-b border-slate-100">{m.range}</td>
                        <td className="px-3 py-2 border-b border-slate-100">
                          <span
                            className={
                              m.status === "normal"
                                ? "text-emerald-600"
                                : "text-amber-700 font-medium"
                            }
                          >
                            {m.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 className="sr-h1 text-base mb-1">Resumen orientativo</h4>
              <p className="sr-p text-sm whitespace-pre-line">
                {result.summary}
              </p>
            </div>

            <div>
              <h4 className="sr-h1 text-base mb-1">Diagnóstico diferencial (orientativo)</h4>
              <p className="sr-p text-sm whitespace-pre-line">
                {result.differential}
              </p>
            </div>

            {/* Mini chat clínico */}
            <div className="mt-4 border-t border-slate-200 pt-3 space-y-2">
              <h4 className="sr-h1 text-base mb-1">Preguntas rápidas a la IA (demo)</h4>
              <p className="sr-small text-slate-500 mb-1">
                Puedes hacer preguntas orientativas sobre esta analítica. Las respuestas son de apoyo
                y no sustituyen tu criterio clínico.
              </p>

              <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-lg p-2 bg-slate-50 space-y-2 text-sm">
                {chatMessages.length === 0 && (
                  <p className="sr-small text-slate-500">
                    Aún no hay preguntas. Escribe tu duda abajo para iniciar la conversación.
                  </p>
                )}
                {chatMessages.map((m, idx) => (
                  <div
                    key={idx}
                    className={
                      m.from === "doctor"
                        ? "text-right"
                        : "text-left"
                    }
                  >
                    <div
                      className={
                        m.from === "doctor"
                          ? "inline-block rounded-xl bg-sky-600 text-white px-3 py-1.5 mb-0.5 max-w-[80%] text-left"
                          : "inline-block rounded-xl bg-white text-slate-900 px-3 py-1.5 mb-0.5 border border-slate-200 max-w-[80%]"
                      }
                    >
                      <span className="block whitespace-pre-line">{m.text}</span>
                    </div>
                    <div className="sr-small text-slate-500">
                      {m.from === "doctor" ? "Tú" : "IA (demo)"}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <p className="sr-small text-slate-500">
                    IA está generando una respuesta...
                  </p>
                )}
              </div>

              <form onSubmit={handleSendQuestion} className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Escribe una pregunta clínica orientativa..."
                  className="sr-input flex-1 text-sm"
                  disabled={chatLoading}
                />
                <button
                  type="submit"
                  disabled={chatLoading || !result}
                  className="sr-btn-secondary whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                >
                  Enviar
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
