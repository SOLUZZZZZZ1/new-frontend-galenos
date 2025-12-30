import React from "react";
import { loadMskCfg, saveMskCfg } from "../utils/mskAtlasStore";
import { suggestMskCfg } from "../utils/mskAtlasSuggest";

function clampNum(v, a, b) {
  const n = Number(v);
  if (Number.isNaN(n)) return a;
  return Math.max(a, Math.min(b, n));
}

export default function AtlasMskControls({
  imagingId,
  imgType,
  summary,
  patterns,
  value,
  onChange,
  onAutoReal,
  loadingAuto = false,
}) {
  const y0 = value?.anatomyBox?.y0 ?? 10;
  const y1 = value?.anatomyBox?.y1 ?? 84;
  const fasciaP = value?.layerPercents?.fasciaEnd ?? 0.30;
  const labelOffset = value?.labelOffset ?? 1.6;

  function autoBeta() {
    const s = suggestMskCfg({ imgType, summary, patterns });
    if (!s) return;
    onChange({ ...value, preset: s.preset || "auto", ...s });
  }

  function load() {
    const cfg = loadMskCfg(imagingId);
    if (cfg) onChange(cfg);
  }

  function save() {
    if (!imagingId) return;
    saveMskCfg(imagingId, value);
    alert("Ajuste MSK guardado.");
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
      <div className="flex flex-wrap gap-2">
        <button type="button" className="sr-btn-secondary text-xs" onClick={onAutoReal} disabled={!imagingId || loadingAuto}>
          {loadingAuto ? "Auto…" : "Auto (real)"}
        </button>
        <button type="button" className="sr-btn-secondary text-xs" onClick={autoBeta}>Auto (beta)</button>
        <button type="button" className="sr-btn-secondary text-xs" onClick={load} disabled={!imagingId}>Cargar</button>
        <button type="button" className="sr-btn-primary text-xs" onClick={save} disabled={!imagingId}>Guardar</button>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold">y0</p>
          <input type="range" min="0" max="30" step="1" value={y0}
            onChange={(e) => onChange({ ...value, anatomyBox: { ...(value.anatomyBox||{}), y0: clampNum(e.target.value, 0, 30) } })}
            className="w-full" />
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold">y1</p>
          <input type="range" min="70" max="98" step="1" value={y1}
            onChange={(e) => onChange({ ...value, anatomyBox: { ...(value.anatomyBox||{}), y1: clampNum(e.target.value, 70, 98) } })}
            className="w-full" />
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold">fasciaEnd</p>
          <input type="range" min="0.22" max="0.46" step="0.01" value={fasciaP}
            onChange={(e) => onChange({ ...value, layerPercents: { ...(value.layerPercents||{}), fasciaEnd: clampNum(e.target.value, 0.22, 0.46) } })}
            className="w-full" />
        </div>

        <div className="space-y-1 md:col-span-3">
          <p className="text-xs font-semibold">labelOffset</p>
          <input type="range" min="0.4" max="6.0" step="0.1" value={labelOffset}
            onChange={(e) => onChange({ ...value, labelOffset: clampNum(e.target.value, 0.4, 6.0) })}
            className="w-full" />
        </div>
      </div>
    </div>
  );
}
