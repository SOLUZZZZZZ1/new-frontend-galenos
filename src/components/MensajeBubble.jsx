
import React from "react";

/**
 * Mensaje individual dentro del hilo de guardia.
 */
export default function MensajeBubble({ message, isMine }) {
  const {
    author_alias,
    clean_content,
    moderation_status,
    created_at,
  } = message;

  const createdInfo = created_at ? new Date(created_at).toLocaleString() : "";

  const moderationLabel =
    moderation_status === "auto_cleaned"
      ? "ajustado por IA"
      : moderation_status === "blocked"
      ? "bloqueado"
      : "moderado";

  return (
    <div
      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[86%] rounded-lg border px-3 py-2 text-xs space-y-1 ${
          isMine
            ? "bg-sky-50 border-sky-200 text-slate-900"
            : "bg-slate-50 border-slate-200 text-slate-900"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold text-slate-800">
            {author_alias || "alias desconocido"}
          </p>
          {createdInfo && (
            <p className="text-[10px] text-slate-500">{createdInfo}</p>
          )}
        </div>
        <p className="text-xs text-slate-900 whitespace-pre-line">
          {clean_content}
        </p>
        <p className="text-[9px] text-slate-500">
          Moderación: {moderationLabel}
        </p>
      </div>
    </div>
  );
}
