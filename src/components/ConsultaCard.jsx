import React from "react";

export default function ConsultaCard({
  item,
  isSelected,
  onClick,
  onToggleFavorite,
  onToggleStatus,
}) {
  const {
    id,
    title,
    anonymized_summary,
    author_alias,
    status,
    message_count,
    last_activity_at,
    is_favorite,
    age_group,
    sex,
    context,
  } = item || {};

  const statusLabel =
    status === "closed" ? "Cerrada" : status === "open" ? "Abierta" : status || "Abierta";

  const statusClass =
    status === "closed"
      ? "border-slate-300 bg-slate-50 text-slate-700"
      : "border-emerald-300 bg-emerald-50 text-emerald-800";

  const createdInfo = last_activity_at ? new Date(last_activity_at).toLocaleString() : "";

  function handleStarClick(e) {
    e.stopPropagation();
    onToggleFavorite?.(id, !is_favorite);
  }

  function handleToggleStatus(e) {
    e.stopPropagation();
    const next = status === "closed" ? "open" : "closed";
    onToggleStatus?.(id, next);
  }

  return (
    <article
      onClick={onClick}
      className={`border rounded-lg p-3 cursor-pointer transition-colors text-xs space-y-1 ${
        isSelected
          ? "border-sky-500 bg-sky-50/80"
          : "border-slate-200 hover:border-sky-300 hover:bg-sky-50/40"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <h3 className="text-[13px] font-semibold text-slate-900 line-clamp-2">
            {title || "Consulta clinica sin titulo"}
          </h3>
          <p className="text-[11px] text-slate-500">
            por <span className="font-medium">{author_alias || "alias desconocido"}</span>
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleStarClick}
            className="text-lg leading-none px-1 py-0.5 rounded-full hover:bg-amber-50"
            aria-label={is_favorite ? "Quitar de favoritas" : "Marcar como favorita"}
            title={is_favorite ? "Quitar de favoritas" : "Marcar como favorita"}
          >
            {is_favorite ? "⭐" : "☆"}
          </button>

          <button
            type="button"
            onClick={handleToggleStatus}
            className="text-[10px] px-2 py-1 rounded-full border border-slate-200 bg-white hover:bg-slate-50"
            title={status === "closed" ? "Reabrir consulta" : "Marcar como resuelta"}
          >
            {status === "closed" ? "Reabrir" : "Resuelta"}
          </button>
        </div>
      </div>

      <p className="text-[11px] text-slate-600 line-clamp-3 mt-1">
        {anonymized_summary || "Consulta clinica en De guardia. Abre el hilo para ver los detalles."}
      </p>

      <div className="flex flex-wrap items-center gap-1.5 mt-2">
        {age_group && (
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-700">
            {age_group}
          </span>
        )}
        {sex && (
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-700">
            {sex}
          </span>
        )}
        {context && (
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-700">
            {context}
          </span>
        )}

        <span className={`ml-auto px-2 py-0.5 rounded-full border text-[10px] ${statusClass}`}>
          {statusLabel}
        </span>
      </div>

      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
        <span>{message_count || 0} mensajes</span>
        {createdInfo && <span>Ultima actividad: {createdInfo}</span>}
      </div>
    </article>
  );
}

