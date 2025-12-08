
import React, { useEffect, useState } from "react";
import MensajesList from "./MensajesList.jsx";
import RespuestaInput from "./RespuestaInput.jsx";

/**
 * Panel derecho: detalles del caso + hilo de mensajes.
 */
export default function HiloPanel({ selectedCaseId, apiBase, token, currentAlias }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [caseData, setCaseData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [iaSummary, setIaSummary] = useState("");

  useEffect(() => {
    if (!selectedCaseId || !token) return;
    loadCaseAndMessages(selectedCaseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCaseId, token]);

  async function loadCaseAndMessages(caseId) {
    setLoading(true);
    setError("");
    setIaSummary("");

    try {
      // 1) Detalles del caso
      const resCase = await fetch(`${apiBase}/guard/cases/${caseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const rawCase = await resCase.text();
      console.log("👉 [DeGuardia] GET /guard/cases/{id} (raw):", rawCase);

      if (!resCase.ok) {
        setError("No se pudo cargar la consulta seleccionada.");
        setLoading(false);
        return;
      }

      let dataCase;
      try {
        dataCase = JSON.parse(rawCase);
      } catch {
        dataCase = null;
      }
      setCaseData(dataCase);

      // 2) Mensajes
      const resMsgs = await fetch(`${apiBase}/guard/cases/${caseId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const rawMsgs = await resMsgs.text();
      console.log("👉 [DeGuardia] GET /guard/cases/{id}/messages (raw):", rawMsgs);

      if (!resMsgs.ok) {
        setError("No se pudieron cargar los mensajes del hilo.");
        setLoading(false);
        return;
      }

      let dataMsgs;
      try {
        dataMsgs = JSON.parse(rawMsgs);
      } catch {
        dataMsgs = { items: [] };
      }

      setMessages(Array.isArray(dataMsgs.items) ? dataMsgs.items : []);
      setLoading(false);
    } catch (err) {
      console.error("❌ [DeGuardia] Error cargando hilo:", err);
      setError("Error de conexión al cargar el hilo de guardia.");
      setLoading(false);
    }
  }

  async function handleSendMessage(content) {
    if (!selectedCaseId || !token) return;

    try {
      const res = await fetch(`${apiBase}/guard/cases/${selectedCaseId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      const raw = await res.text();
      console.log("👉 [DeGuardia] POST /guard/cases/{id}/messages (raw):", raw);

      if (!res.ok) {
        let msg = "No se pudo publicar tu respuesta en De guardia.";
        try {
          const errData = JSON.parse(raw);
          if (errData.detail) msg = errData.detail;
        } catch {}
        throw new Error(msg);
      }

      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        data = null;
      }

      if (data) {
        setMessages((prev) => [...prev, data]);
      }
    } catch (err) {
      console.error("❌ [DeGuardia] Error enviando mensaje:", err);
      throw err;
    }
  }

  async function handleLoadSummary() {
    if (!selectedCaseId || !token) return;

    setLoadingSummary(true);
    setIaSummary("");

    try {
      const res = await fetch(`${apiBase}/guard/cases/${selectedCaseId}/summary-ia`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const raw = await res.text();
      console.log("👉 [DeGuardia] GET /guard/cases/{id}/summary-ia (raw):", raw);

      if (!res.ok) {
        setIaSummary("No se pudo generar un resumen automático del debate.");
        setLoadingSummary(false);
        return;
      }

      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        data = null;
      }

      setIaSummary(data?.summary || "No hay resumen disponible.");
      setLoadingSummary(false);
    } catch (err) {
      console.error("❌ [DeGuardia] Error resumen IA:", err);
      setIaSummary("Error de conexión al generar el resumen del debate.");
      setLoadingSummary(false);
    }
  }

  if (!selectedCaseId) {
    return (
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center justify-center">
        <p className="text-sm text-slate-500 text-center max-w-sm">
          Selecciona una consulta de la cartelera para ver el caso clínico y el hilo de respuestas,
          o crea una nueva consulta de diagnóstico.
        </p>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <p className="text-sm text-slate-600">Cargando hilo de guardia…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <p className="text-sm text-red-600">{error}</p>
      </section>
    );
  }

  if (!caseData) {
    return (
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <p className="text-sm text-slate-500">
          No se encontró la consulta seleccionada. Prueba a recargar la cartelera.
        </p>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col gap-3">
      {/* Cabecera del caso */}
      <div className="border-b border-slate-200 pb-3 space-y-1">
        <h2 className="text-lg font-semibold text-slate-900">
          {caseData.title || "Consulta clínica sin título"}
        </h2>
        <p className="text-xs text-slate-500">
          por <span className="font-semibold">{caseData.author_alias}</span>{" "}
          {caseData.age_group && <>· {caseData.age_group}</>}{" "}
          {caseData.sex && <>· {caseData.sex}</>}{" "}
          {caseData.context && <>· {caseData.context}</>}
        </p>
        {caseData.anonymized_summary && (
          <div className="mt-2 bg-slate-50 border border-slate-200 rounded-md p-2">
            <p className="text-xs text-slate-800 whitespace-pre-line">
              {caseData.anonymized_summary}
            </p>
            <p className="mt-1 text-[10px] text-slate-500">
              Caso inicial anonimizado y moderado automáticamente.
            </p>
          </div>
        )}
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
            {messages.length} mensajes en el hilo
          </span>
          <button
            type="button"
            onClick={handleLoadSummary}
            className="text-[11px] px-2 py-1 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50"
          >
            {loadingSummary ? "Generando resumen…" : "🧠 Ver resumen IA del debate"}
          </button>
        </div>
        {iaSummary && (
          <div className="mt-2 bg-sky-50 border border-sky-200 rounded-md p-2">
            <p className="text-xs text-slate-800 whitespace-pre-line">{iaSummary}</p>
            <p className="mt-1 text-[10px] text-slate-500">
              Resumen orientativo del debate entre médicos. No sustituye tu criterio clínico.
            </p>
          </div>
        )}
      </div>

      {/* Lista de mensajes */}
      <div className="flex-1 min-h-[260px] max-h-[420px] overflow-y-auto">
        <MensajesList messages={messages} currentAlias={currentAlias} />
      </div>

      {/* Caja de respuesta */}
      <div className="border-t border-slate-200 pt-3">
        <RespuestaInput onSend={handleSendMessage} />
      </div>
    </section>
  );
}
