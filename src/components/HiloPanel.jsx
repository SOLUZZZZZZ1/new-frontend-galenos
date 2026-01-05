import React, { useEffect, useMemo, useRef, useState } from "react";
import RespuestaInput from "./RespuestaInput";
import MensajesList from "./MensajesList.jsx";

export default function HiloPanel({ selectedCaseId, apiBase, token }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const bottomRef = useRef(null);

  const currentAlias = useMemo(() => {
    return localStorage.getItem("galenos_guard_alias") || "";
  }, []);

  const caseAuthorAlias = useMemo(() => {
    if (!messages || messages.length === 0) return "";
    const first = messages[0]?.author_alias || "";
    if (first === "anónimo" && currentAlias) return currentAlias;
    return first;
  }, [messages, currentAlias]);

  const viewerIsCaseAuthor =
    Boolean(currentAlias) && Boolean(caseAuthorAlias) && currentAlias === caseAuthorAlias;

  const highlightKey = useMemo(() => {
    return selectedCaseId ? `galenos_guard_highlight_${selectedCaseId}` : "";
  }, [selectedCaseId]);

  const highlightedMessageId = useMemo(() => {
    if (!highlightKey) return null;
    const v = localStorage.getItem(highlightKey);
    const n = v ? Number(v) : null;
    return n && !Number.isNaN(n) ? n : null;
  }, [highlightKey, messages.length]);

  function scrollToBottom(smooth = true) {
    if (!bottomRef.current) return;
    try {
      bottomRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "end",
      });
    } catch {}
  }

  async function loadMessages() {
    if (!selectedCaseId || !token) return;

    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `${apiBase}/guard/cases/${selectedCaseId}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const raw = await res.text();
      console.log("👉 [DeGuardia] GET /messages raw:", raw);


if (!res.ok) {
  let msg = "No se pudieron cargar los mensajes.";
  try {
    const errData = JSON.parse(raw);
    if (errData?.detail) msg = errData.detail;
  } catch {
    if (raw && raw.trim()) msg = raw.trim();
  }
  setError(msg);
  return;
}

      let data;
      try { data = JSON.parse(raw); } catch {
        setError("Respuesta inesperada al cargar mensajes.");
        return;
      }

      const items = Array.isArray(data.items) ? data.items : [];
      setMessages(items);

      setTimeout(() => scrollToBottom(false), 50);
    } catch (err) {
      console.error("❌ Error cargando mensajes:", err);
      setError("Error de conexión al cargar mensajes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCaseId]);

  function handleToggleHighlight(messageId) {
    if (!selectedCaseId) return;
    if (!highlightKey) return;

    const current = localStorage.getItem(highlightKey);
    const currentNum = current ? Number(current) : null;

    if (currentNum && currentNum === messageId) {
      localStorage.removeItem(highlightKey);
    } else {
      localStorage.setItem(highlightKey, String(messageId));
    }
    setMessages((prev) => [...prev]);
  }

  async function handleSendMessage(input) {
    let payload;

    if (typeof input === "string") {
      const content = (input ?? "").toString().trim();
      if (!content) return;
      payload = { content };
    } else {
      const content = (input?.content ?? "").toString().trim();
      if (!content) return;

      const atts = Array.isArray(input?.attachments) ? input.attachments : [];
      const normalized = atts
        .filter((a) => a && (a.kind === "analytic" || a.kind === "imaging") && a.id)
        .map((a) => ({ kind: a.kind, id: Number(a.id) }));

      payload = { content };
      if (normalized.length > 0) payload.attachments = normalized;
    }

    if (!selectedCaseId || !token) {
      setError("No hay sesión activa o no hay caso seleccionado.");
      return;
    }

    try {
      setSending(true);
      setError("");

      const res = await fetch(
        `${apiBase}/guard/cases/${selectedCaseId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const raw = await res.text();
      console.log("👉 [DeGuardia] POST /messages raw:", raw);


if (!res.ok) {
  let msg = "No se pudo enviar el mensaje.";
  try {
    const errData = JSON.parse(raw);
    if (errData?.detail) msg = errData.detail;
  } catch {
    if (raw && raw.trim()) msg = raw.trim();
  }
  setError(msg);
  return;
}

      let newMsg;
      try { newMsg = JSON.parse(raw); } catch {
        await loadMessages();
        return;
      }

      setMessages((prev) => [...prev, newMsg]);
      setTimeout(() => scrollToBottom(true), 50);
    } catch (err) {
      console.error("❌ Error enviando mensaje:", err);
      setError("Error de conexión al enviar el mensaje.");
    } finally {
      setSending(false);
    }
  }

  if (!selectedCaseId) {
    return (
      <p className="text-sm text-gray-500">
        Selecciona una consulta de la cartelera para ver el hilo y responder.
      </p>
    );
  }

  return (
    <div className="flex flex-col h-full">

<div className="px-3 pt-3">
  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
    <p className="text-xs font-semibold text-slate-800">🛡️ Espacio moderado (aprendizaje clínico)</p>
    <p className="text-[11px] text-slate-600 mt-1">
      Sin insultos, sin política y sin datos identificativos. Si un mensaje se bloquea, te mostraremos el motivo para que puedas editarlo.
    </p>
  </div>
</div>
      <div className="flex-1 overflow-y-auto space-y-3 p-3">
        {loading && <p className="text-sm text-gray-500">Cargando mensajes…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <MensajesList
          messages={messages}
          currentAlias={currentAlias}
          caseId={selectedCaseId}
          caseAuthorAlias={caseAuthorAlias}
          highlightedMessageId={highlightedMessageId}
          viewerIsCaseAuthor={viewerIsCaseAuthor}
          onToggleHighlight={handleToggleHighlight}
          apiBase={apiBase}
          token={token}
        />

        <div ref={bottomRef} />
      </div>

      <RespuestaInput
        onSend={handleSendMessage}
        sending={sending}
        apiBase={apiBase}
        token={token}
      />
    </div>
  );
}
