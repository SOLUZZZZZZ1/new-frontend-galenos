// src/pages/admin/AdminIA.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const INITIAL = [
  {
    role: "assistant",
    content:
      "Soy la IA del Administrador de MEDIAZION. Puedo ayudarte a redactar mensajes, analizar ideas, crear textos para la web, resumir documentos o darte estrategias. ¿Qué necesitas hoy?",
  },
];

export default function AdminIA() {
  const nav = useNavigate();
  const [msgs, setMsgs] = useState(INITIAL);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight + 300;
    }
  }, [msgs, loading]);

  async function sendMessage(text) {
    if (!text) return;
    setMsgs((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);
    setErrorMsg("");

    try {
      const resp = await fetch("/api/ai/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt:
            "Eres la IA del Administrador de MEDIAZION. Debes responder como asistente profesional, clara y directamente. Instrucción del administrador: " +
            text,
        }),
      });

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok || !data?.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "No se pudo obtener respuesta de la IA."
        );
      }

      setMsgs((prev) => [
        ...prev,
        { role: "assistant", content: data.text || "(respuesta vacía)" },
      ]);
    } catch (e) {
      setErrorMsg(e.message || "Error en la IA");
    } finally {
      setLoading(false);
    }
  }

  function handleSend() {
    const txt = input.trim();
    if (!txt) return;
    setInput("");
    sendMessage(txt);
  }

  return (
    <main className="sr-container py-10" style={{ minHeight: "calc(100vh - 160px)" }}>
      <h1 className="sr-h1 mb-2">IA del Administrador</h1>
      <p className="sr-p mb-6">
        Asistente profesional para ayudarte en tareas administrativas, contenido, análisis y estrategia.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* CHAT */}
        <section className="sr-card p-4 overflow-auto" style={{ maxHeight: "70vh" }} ref={listRef}>
          {msgs.map((m, i) => (
            <div
              key={i}
              className={`w-full flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              } mb-3`}
            >
              <div
                className={
                  "max-w-[92%] md:max-w-[75%] px-4 py-3 rounded-2xl shadow-sm " +
                  (m.role === "user"
                    ? "bg-sky-600 text-white rounded-br-sm"
                    : "bg-white border border-zinc-200 text-zinc-800 rounded-bl-sm")
                }
              >
                <pre className="whitespace-pre-wrap m-0 font-sans text-[15px] leading-relaxed">
                  {m.content}
                </pre>
              </div>
            </div>
          ))}
          {loading && (
            <p className="sr-small text-zinc-500 mt-2">La IA está pensando…</p>
          )}
          {errorMsg && (
            <p className="sr-small text-red-600 mt-2">❌ {errorMsg}</p>
          )}
        </section>

        {/* INPUT */}
        <section className="sr-card p-4 flex flex-col gap-3">
          <textarea
            className="sr-input resize-none"
            rows={6}
            placeholder="Escribe qué necesitas (ej.: redactar un email, resumir un texto, hacer un borrador de landing, generar ideas...)."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <button
            className="sr-btn-primary"
            onClick={handleSend}
            disabled={!input.trim() || loading}
          >
            {loading ? "Generando…" : "Generar con IA"}
          </button>

          <button
            className="sr-btn-secondary"
            onClick={() => nav("/admin/dashboard")}
          >
            Volver al dashboard
          </button>
        </section>
      </div>
    </main>
  );
}
