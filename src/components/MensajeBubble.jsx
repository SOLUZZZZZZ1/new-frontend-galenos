import React, { useState } from "react";

export default function MensajeBubble({
  message,
  isMine,
  caseId,
  caseAuthorAlias,
  highlightedMessageId,
  viewerIsCaseAuthor,
  onToggleHighlight,
  apiBase,
  token,
}) {
  const { id, author_alias, clean_content, moderation_status, created_at, attachments } =
    message || {};

  const createdInfo = created_at ? new Date(created_at).toLocaleString() : "";

  const moderationLabel =
    moderation_status === "auto_cleaned"
      ? "ajustado por IA"
      : moderation_status === "blocked"
      ? "bloqueado"
      : moderation_status
      ? "moderado"
      : "ok";

  const isAuthor = Boolean(caseAuthorAlias) && author_alias === caseAuthorAlias;
  const isHighlighted = Boolean(highlightedMessageId) && highlightedMessageId === id;

  const [expanded, setExpanded] = useState({});
  const [markersOpen, setMarkersOpen] = useState({});
  const [markersLoading, setMarkersLoading] = useState({});
  const [markersError, setMarkersError] = useState({});
  const [markersData, setMarkersData] = useState({});

  const clip = (text, max = 260) => {
    const t = (text || "").toString();
    if (t.length <= max) return { short: t, clipped: false };
    return { short: t.slice(0, max) + "…", clipped: true };
  };

  function toggleExpanded(key) {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function toggleMarkers(analyticId) {
    const idNum = Number(analyticId);
    if (!idNum || Number.isNaN(idNum)) return;

    if (markersOpen[idNum]) {
      setMarkersOpen((prev) => ({ ...prev, [idNum]: false }));
      return;
    }

    setMarkersOpen((prev) => ({ ...prev, [idNum]: true }));

    if (Array.isArray(markersData[idNum])) return;

    if (!apiBase || !token) {
      setMarkersError((prev) => ({ ...prev, [idNum]: "Falta sesion o API." }));
      return;
    }

    try {
      setMarkersLoading((prev) => ({ ...prev, [idNum]: true }));
      setMarkersError((prev) => ({ ...prev, [idNum]: "" }));

      const res = await fetch(`${apiBase}/analytics/markers/${idNum}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const raw = await res.text();

      if (!res.ok) {
        let msg = "No se pudieron cargar los marcadores.";
        try {
          const err = JSON.parse(raw);
          if (err.detail) msg = err.detail;
        } catch {}
        setMarkersError((prev) => ({ ...prev, [idNum]: msg }));
        return;
      }

      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        setMarkersError((prev) => ({ ...prev, [idNum]: "Respuesta inesperada." }));
        return;
      }

      const markers = Array.isArray(data.markers) ? data.markers : [];
      setMarkersData((prev) => ({ ...prev, [idNum]: markers }));
    } catch (e) {
      console.error("❌ Error cargando marcadores:", e);
      setMarkersError((prev) => ({ ...prev, [idNum]: "Error de conexion." }));
    } finally {
      setMarkersLoading((prev) => ({ ...prev, [idNum]: false }));
    }
  }

  const safeText =
    typeof clean_content === "string"
      ? clean_content
      : clean_content != null
      ? JSON.stringify(clean_content)
      : "";

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[86%] rounded-lg border px-3 py-2 text-xs space-y-2 ${
          isHighlighted
            ? "bg-emerald-50 border-emerald-200 text-slate-900"
            : isMine
            ? "bg-sky-50 border-sky-200 text-slate-900"
            : "bg-slate-50 border-slate-200 text-slate-900"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-semibold text-slate-800">
              {author_alias || "alias desconocido"}
            </p>

            {isAuthor && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                Autor del caso
              </span>
            )}

            {isHighlighted && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                Respuesta clave
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {createdInfo && <p className="text-[10px] text-slate-500">{createdInfo}</p>}

            {viewerIsCaseAuthor && id && caseId && (
              <button
                type="button"
                onClick={() => onToggleHighlight?.(id)}
                className="text-[10px] px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50"
                title="Marcar como respuesta clave"
              >
                {isHighlighted ? "Quitar clave" : "Marcar clave"}
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-900 whitespace-pre-line">{safeText}</p>

        {Array.isArray(attachments) && attachments.length > 0 && (
          <div className="pt-2 border-t border-slate-200 space-y-2">
            <p className="text-[10px] font-semibold text-slate-600">Adjuntos clinicos</p>

            <div className="space-y-2">
              {attachments.map((a, idx) => {
                if (!a || !a.kind) return null;
                const key = `${id || "m"}-${a.kind}-${a.id}-${idx}`;
                const open = Boolean(expanded[key]);

                if (a.kind === "analytic") {
                  const full = (a.summary || "").trim() || "—";
                  const { short, clipped } = clip(full, 260);

                  const analyticId = a.id;
                  const isMarkersOpen = Boolean(markersOpen[analyticId]);
                  const isLoading = Boolean(markersLoading[analyticId]);
                  const err = markersError[analyticId] || "";
                  const markers = markersData[analyticId];

                  return (
                    <div
                      key={key}
                      className="rounded-md border border-slate-200 bg-white/70 p-2 space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-slate-800">
                          🧪 Analitica
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {a.exam_date || "fecha —"} · ID {a.id}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-700 whitespace-pre-line">
                        {open ? full : short}
                      </p>

                      <div className="flex items-center gap-3 pt-1">
                        {clipped && (
                          <button
                            type="button"
                            onClick={() => toggleExpanded(key)}
                            className="text-[11px] text-sky-700 hover:underline"
                          >
                            {open ? "Ver menos" : "Ver mas"}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => toggleMarkers(analyticId)}
                          className="text-[11px] text-emerald-700 hover:underline"
                        >
                          {isMarkersOpen ? "Ocultar marcadores" : "Ver marcadores"}
                        </button>
                      </div>

                      {isMarkersOpen && (
                        <div className="mt-2 border-t pt-2">
                          {isLoading && (
                            <p className="text-[11px] text-slate-500">Cargando marcadores…</p>
                          )}
                          {err && <p className="text-[11px] text-red-600">{err}</p>}

                          {Array.isArray(markers) && markers.length > 0 && (
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-[11px] border border-slate-200 rounded-md overflow-hidden">
                                <thead className="bg-slate-100">
                                  <tr>
                                    <th className="px-2 py-1 text-left">Marcador</th>
                                    <th className="px-2 py-1 text-left">Valor</th>
                                    <th className="px-2 py-1 text-left">Rango</th>
                                    <th className="px-2 py-1 text-left">Estado</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {markers.map((m, mi) => (
                                    <tr key={mi} className="border-t border-slate-200">
                                      <td className="px-2 py-1">{m.name || ""}</td>
                                      <td className="px-2 py-1">
                                        {m.value != null ? String(m.value) : ""}
                                      </td>
                                      <td className="px-2 py-1">{m.range || ""}</td>
                                      <td className="px-2 py-1">
                                        {m.status === "elevado" && (
                                          <span className="font-medium text-red-600">Alto</span>
                                        )}
                                        {m.status === "bajo" && (
                                          <span className="font-medium text-amber-600">Bajo</span>
                                        )}
                                        {m.status === "normal" && (
                                          <span className="font-medium text-emerald-700">Normal</span>
                                        )}
                                        {!m.status && <span className="text-slate-500">—</span>}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {Array.isArray(markers) && markers.length === 0 && !isLoading && !err && (
                            <p className="text-[11px] text-slate-500">No hay marcadores guardados.</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }

                if (a.kind === "imaging") {
                  const full = (a.summary || "").trim() || "—";
                  const { short, clipped } = clip(full, 260);

                  return (
                    <div
                      key={key}
                      className="rounded-md border border-slate-200 bg-white/70 p-2 space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-slate-800">
                          🩻 Imagen {a.type ? `(${a.type})` : ""}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {a.exam_date || "fecha —"} · ID {a.id}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-700 whitespace-pre-line">
                        {open ? full : short}
                      </p>

                      {clipped && (
                        <button
                          type="button"
                          onClick={() => toggleExpanded(key)}
                          className="text-[11px] text-sky-700 hover:underline"
                        >
                          {open ? "Ver menos" : "Ver mas"}
                        </button>
                      )}

                      <p className="text-[10px] text-amber-700">
                        Previsualizacion desactivada por privacidad.
                      </p>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </div>
        )}

        <p className="text-[9px] text-slate-500">Moderacion: {moderationLabel}</p>
      </div>
    </div>
  );
}

