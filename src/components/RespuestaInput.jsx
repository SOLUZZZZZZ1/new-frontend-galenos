import React, { useEffect, useMemo, useState } from "react";

export default function RespuestaInput({
  onSend,
  sending = false,
  apiBase,
  token,
}) {
  const [text, setText] = useState("");

  // 📎 adjuntos
  const [showAttach, setShowAttach] = useState(false);
  const [patientId, setPatientId] = useState("");

  const [loadingOptions, setLoadingOptions] = useState(false);
  const [optionsError, setOptionsError] = useState("");
  const [options, setOptions] = useState(null);

  const [selected, setSelected] = useState([]); // [{kind:'analytic'|'imaging', id:number}]

  const canFetchOptions = useMemo(() => {
    const pid = Number.parseInt((patientId || "").trim(), 10);
    return Boolean(apiBase && token && pid && !Number.isNaN(pid));
  }, [apiBase, token, patientId]);

  async function fetchOptions() {
    setOptionsError("");
    setOptions(null);

    if (!canFetchOptions) {
      setOptionsError(
        "Introduce un Patient ID válido (número) y asegúrate de tener sesión."
      );
      return;
    }

    const pid = Number.parseInt(patientId.trim(), 10);

    try {
      setLoadingOptions(true);
      const res = await fetch(
        `${apiBase}/guard/attachments/options?patient_id=${pid}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const raw = await res.text();

      if (!res.ok) {
        let msg = "No se pudieron cargar los adjuntos del paciente.";
        try {
          const err = JSON.parse(raw);
          if (err.detail) msg = err.detail;
        } catch {}
        setOptionsError(msg);
        return;
      }

      let data = null;
      try {
        data = JSON.parse(raw);
      } catch {
        setOptionsError("Respuesta inesperada al cargar adjuntos.");
        return;
      }

      setOptions(data);
      // limpiar selección si cambia paciente
      setSelected([]);
    } catch (e) {
      console.error("❌ Error cargando attachments options:", e);
      setOptionsError("Error de conexión cargando adjuntos.");
    } finally {
      setLoadingOptions(false);
    }
  }

  function toggleSelected(kind, id) {
    setSelected((prev) => {
      const exists = prev.some((x) => x.kind === kind && x.id === id);
      if (exists) {
        return prev.filter((x) => !(x.kind === kind && x.id === id));
      }
      if (prev.length >= 8) return prev; // límite backend
      return [...prev, { kind, id }];
    });
  }

  function clearAttachmentsUI() {
    setSelected([]);
    setOptions(null);
    setOptionsError("");
    setPatientId("");
    setShowAttach(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const content = (text ?? "").toString().trim();
    if (!content) return;

    // Modo B: enviamos {content, attachments}
    const payload = {
      content,
      attachments: selected.map((a) => ({ kind: a.kind, id: a.id })),
    };

    onSend(payload);
    setText("");
    clearAttachmentsUI();
  }

  const selectedCount = selected.length;

  return (
    <div className="border-t bg-gray-50">
      {/* Panel adjuntos */}
      {showAttach && (
        <div className="p-3 border-b bg-white">
          <div className="flex flex-col sm:flex-row sm:items-end gap-2">
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-700">
                Patient ID (para adjuntar analíticas/imágenes)
              </label>
              <input
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="mt-1 w-full border rounded p-2 text-sm"
                placeholder="Ej. 16"
                disabled={sending}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={fetchOptions}
                disabled={sending || loadingOptions}
                className="px-3 py-2 rounded border text-sm bg-slate-50 hover:bg-slate-100 disabled:opacity-60"
              >
                {loadingOptions ? "Cargando…" : "Cargar adjuntos"}
              </button>
              <button
                type="button"
                onClick={clearAttachmentsUI}
                disabled={sending}
                className="px-3 py-2 rounded border text-sm bg-white hover:bg-slate-50 disabled:opacity-60"
              >
                Cerrar
              </button>
            </div>
          </div>

          {optionsError && (
            <p className="mt-2 text-xs text-red-600">{optionsError}</p>
          )}

          {options && (
            <div className="mt-3 grid md:grid-cols-2 gap-4">
              {/* Analíticas */}
              <div className="border rounded-lg p-3 bg-slate-50">
                <h4 className="text-xs font-semibold text-slate-800 mb-2">
                  Analíticas
                </h4>
                {options.analytics && options.analytics.length > 0 ? (
                  <div className="space-y-2">
                    {options.analytics.map((a) => {
                      const checked = selected.some(
                        (x) => x.kind === "analytic" && x.id === a.id
                      );
                      return (
                        <label
                          key={`a-${a.id}`}
                          className="flex items-start gap-2 text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleSelected("analytic", a.id)}
                            disabled={sending}
                          />
                          <span className="text-slate-700">
                            <span className="font-medium">
                              {a.exam_date || "Fecha —"}
                            </span>
                            {" · "}
                            {(a.summary || "").slice(0, 110)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    No hay analíticas registradas para este paciente.
                  </p>
                )}
              </div>

              {/* Imágenes */}
              <div className="border rounded-lg p-3 bg-slate-50">
                <h4 className="text-xs font-semibold text-slate-800 mb-2">
                  Imágenes
                </h4>
                {options.imaging && options.imaging.length > 0 ? (
                  <div className="space-y-2">
                    {options.imaging.map((i) => {
                      const checked = selected.some(
                        (x) => x.kind === "imaging" && x.id === i.id
                      );
                      return (
                        <label
                          key={`i-${i.id}`}
                          className="flex items-start gap-2 text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleSelected("imaging", i.id)}
                            disabled={sending}
                          />
                          <span className="text-slate-700">
                            <span className="font-medium">
                              {i.type || "IMAGEN"}
                            </span>
                            {i.exam_date ? ` · ${i.exam_date}` : ""}
                            {" · "}
                            {(i.summary || "").slice(0, 110)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    No hay imágenes registradas para este paciente.
                  </p>
                )}
              </div>
            </div>
          )}

          {options && (
            <p className="mt-3 text-[11px] text-slate-500">
              Seleccionados: {selectedCount} (máx. 8). Los adjuntos se guardarán
              asociados a este mensaje.
            </p>
          )}
        </div>
      )}

      {/* Input principal */}
      <form onSubmit={handleSubmit} className="p-3 flex gap-2 items-end">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 border rounded p-2 text-sm"
          rows={2}
          placeholder="Escribe tu respuesta…"
          disabled={sending}
        />

        <button
          type="button"
          onClick={() => setShowAttach((v) => !v)}
          disabled={sending}
          className="px-3 py-2 rounded border text-sm bg-white hover:bg-slate-50 disabled:opacity-60"
          title="Adjuntar analíticas / imágenes (Modo B)"
        >
          📎
          {selectedCount > 0 ? (
            <span className="ml-1 text-xs font-semibold">{selectedCount}</span>
          ) : null}
        </button>

        <button
          type="submit"
          disabled={sending}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm disabled:opacity-60"
        >
          {sending ? "Enviando…" : "Enviar"}
        </button>
      </form>
    </div>
  );
}
