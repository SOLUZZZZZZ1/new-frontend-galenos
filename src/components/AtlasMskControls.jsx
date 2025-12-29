import React from "react";
import { loadMskCfg, saveMskCfg } from "../utils/mskAtlasStore";
import { suggestMskCfg } from "../utils/mskAtlasSuggest";

function clampNum(v, a, b) {
  const n = Number(v);
  if (Number.isNaN(n)) return a;
  return Math.max(a, Math.min(b, n));
}

const PRESETS = {
  superficial: {
    label: "Superficial",
    cfg: {
      anatomyBox: { x0: 10, y0: 10, x1: 95, y1: 86 },
      layerPercents: { skinEnd: 0.06, subcEnd: 0.24, fasciaEnd: 0.34 },
      labelOffset: 1.8,
    },
  },
  medio: {
    label: "Intermedio",
    cfg: {
      anatomyBox: { x0: 10, y0: 10, x1: 95, y1: 84 },
      layerPercents: { skinEnd: 0.06, subcEnd: 0.22, fasciaEnd: 0.30 },
      labelOffset: 1.6,
    },
  },
  profundo: {
    label: "Profundo",
    cfg: {
      anatomyBox: { x0: 10, y0: 12, x1: 95, y1: 82 },
      layerPercents: { skinEnd: 0.06, subcEnd: 0.20, fasciaEnd: 0.28 },
      labelOffset: 1.3,
    },
  },
};

export default function AtlasMskControls({ imagingId, imgType, summary, patterns, value, onChange }) {
  const y0 = value?.anatomyBox?.y0 ?? 10;
  const y1 = value?.anatomyBox?.y1 ?? 84;
  const fasciaP = value?.layerPercents?.fasciaEnd ?? 0.30;
  const labelOffset = value?.labelOffset ?? 1.6;

  function applyPreset(key) {
    const p = PRESETS[key];
    if (!p) return;
    onChange({ ...value, preset: key, ...p.cfg });
  }

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
    // eslint-disable-next-line no-alert
    alert("Ajuste MSK guardado para esta imagen.");
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">MSK Atlas</p>
          <p className="text-xs text-slate-600">IA (beta) + presets + sliders + guardar por imagen.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="sr-btn-secondary text-xs" onClick={autoBeta}>Auto (beta)</button>
          <button type="button" className="sr-btn-secondary text-xs" onClick={load} disabled={!imagingId}>Cargar</button>
          <button type="button" className="sr-btn-primary text-xs" onClick={save} disabled={!imagingId}>Guardar</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(PRESETS).map(([k, p]) => (
          <button
            key={k}
            type="button"
            className={`sr-btn-secondary text-xs ${value?.preset === k ? "ring-2 ring-slate-900" : ""}`}
            onClick={() => applyPreset(k)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-700">Subir/Bajar bloque (y0)</p>
          <input
            type="range"
            min="0"
            max="30"
            step="1"
            value={y0}
            onChange={(e) =>
              onChange({ ...value, anatomyBox: { ...(value.anatomyBox || {}), y0: clampNum(e.target.value, 0, 30) } })
            }
            className="w-full"
          />
          <p className="text-[11px] text-slate-600">y0: <span className="font-mono">{y0}</span></p>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-700">Profundidad (y1)</p>
          <input
            type="range"
            min="70"
            max="98"
            step="1"
            value={y1}
            onChange={(e) =>
              onChange({ ...value, anatomyBox: { ...(value.anatomyBox || {}), y1: clampNum(e.target.value, 70, 98) } })
            }
            className="w-full"
          />
          <p className="text-[11px] text-slate-600">y1: <span className="font-mono">{y1}</span></p>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-700">Inicio del músculo (fascia)</p>
          <input
            type="range"
            min="0.22"
            max="0.46"
            step="0.01"
            value={fasciaP}
            onChange={(e) => {
              const v = clampNum(e.target.value, 0.22, 0.46);
              onChange({ ...value, layerPercents: { ...(value.layerPercents || {}), fasciaEnd: v } });
            }}
            className="w-full"
          />
          <p className="text-[11px] text-slate-600">fasciaEnd: <span className="font-mono">{Number(fasciaP).toFixed(2)}</span></p>
        </div>

        <div className="space-y-1 md:col-span-3">
          <p className="text-xs font-semibold text-slate-700">Etiqueta “Músculo” (offset)</p>
          <input
            type="range"
            min="0.4"
            max="6.0"
            step="0.1"
            value={labelOffset}
            onChange={(e) => onChange({ ...value, labelOffset: clampNum(e.target.value, 0.4, 6.0) })}
            className="w-full"
          />
          <p className="text-[11px] text-slate-600">labelOffset: <span className="font-mono">{Number(labelOffset).toFixed(1)}</span></p>
        </div>
      </div>

      {!imagingId && <p className="text-[11px] text-amber-700">Sin imaging_id no se puede guardar. En PanelMedico usa lastImagenId.</p>}
    </div>
  );
}
