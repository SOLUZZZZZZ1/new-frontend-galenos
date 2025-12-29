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
      <div className="flex gap-2">
        <button
          type="button"
          className="sr-btn-secondary text-xs"
          onClick={onAutoReal}
          disabled={loadingAuto}
        >
          {loadingAuto ? "Auto…" : "Auto (real)"}
        </button>

        <button
          type="button"
          className="sr-btn-secondary text-xs"
          onClick={() => onChange({ ...value, preset: "medio" })}
        >
          Intermedio
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
        />
      </div>

      <button
        type="button"
        className="sr-btn-primary text-xs"
        onClick={() => {
          localStorage.setItem(
            `msk_cfg_${imagingId}`,
            JSON.stringify(value)
          );
          alert("Guardado");
        }}
      >
        Guardar
      </button>
    </div>
  );
}
