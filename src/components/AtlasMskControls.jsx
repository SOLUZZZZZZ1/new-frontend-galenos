import React from "react";

export default function AtlasMskControls({
  imagingId,
  value,
  onChange,
  onAutoReal,
  loadingAuto = false,
}) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          className="sr-btn-secondary text-xs"
          onClick={onAutoReal}
          disabled={loadingAuto || !imagingId}
        >
          {loadingAuto ? "Auto…" : "Auto (real)"}
        </button>

        <button
          type="button"
          className="sr-btn-secondary text-xs"
          onClick={() => onChange({ ...value, preset: "medio" })}
        >
          Reset (Intermedio)
        </button>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold">Inicio músculo (fascia)</label>
        <input
          type="range"
          min="0.2"
          max="0.6"
          step="0.01"
          value={value.layerPercents.fasciaEnd}
          onChange={(e) =>
            onChange({
              ...value,
              layerPercents: {
                ...value.layerPercents,
                fasciaEnd: Number(e.target.value),
              },
            })
          }
          className="w-full"
        />
        <p className="text-[11px] text-slate-600">
          fasciaEnd: <span className="font-mono">{Number(value.layerPercents.fasciaEnd).toFixed(2)}</span>
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold">Etiqueta “Músculo” (offset)</label>
        <input
          type="range"
          min="0.4"
          max="6.0"
          step="0.1"
          value={value.labelOffset}
          onChange={(e) => onChange({ ...value, labelOffset: Number(e.target.value) })}
          className="w-full"
        />
        <p className="text-[11px] text-slate-600">
          labelOffset: <span className="font-mono">{Number(value.labelOffset).toFixed(1)}</span>
        </p>
      </div>

      <p className="text-[11px] text-slate-500">
        Nota: Guardar/Cargar sigue en tu versión anterior (localStorage/BD). Aquí solo se corrige Auto (real) → backend.
      </p>
    </div>
  );
}
