import React from "react";
import MensajeBubble from "./MensajeBubble.jsx";

export default function MensajesList({
  messages,
  currentAlias,
  caseId,
  caseAuthorAlias,
  highlightedMessageId,
  viewerIsCaseAuthor,
  onToggleHighlight,
  apiBase,
  token,
}) {
  if (!messages || messages.length === 0) {
    return (
      <p className="text-xs text-slate-500 py-4">
        Todavia no hay respuestas en esta consulta.
      </p>
    );
  }

  return (
    <div className="space-y-2 pr-1">
      {messages.map((m) => (
        <MensajeBubble
          key={m.id}
          message={m}
          isMine={m.author_alias === currentAlias}
          caseId={caseId}
          caseAuthorAlias={caseAuthorAlias}
          highlightedMessageId={highlightedMessageId}
          viewerIsCaseAuthor={viewerIsCaseAuthor}
          onToggleHighlight={onToggleHighlight}
          apiBase={apiBase}
          token={token}
        />
      ))}
    </div>
  );
}

