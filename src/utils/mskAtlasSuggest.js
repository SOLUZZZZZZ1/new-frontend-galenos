export function suggestMskCfg({ imgType = "", summary = "", patterns = [] } = {}) {
  const hay = `${imgType} ${summary} ${(patterns || []).join(" ")}`.toLowerCase();

  const SUPERFICIAL = {
    preset: "superficial",
    anatomyBox: { x0: 10, y0: 10, x1: 95, y1: 86 },
    layerPercents: { skinEnd: 0.06, subcEnd: 0.24, fasciaEnd: 0.34 },
    labelOffset: 1.8,
  };

  const MEDIO = {
    preset: "medio",
    anatomyBox: { x0: 10, y0: 10, x1: 95, y1: 84 },
    layerPercents: { skinEnd: 0.06, subcEnd: 0.22, fasciaEnd: 0.30 },
    labelOffset: 1.6,
  };

  const PROFUNDO = {
    preset: "profundo",
    anatomyBox: { x0: 10, y0: 12, x1: 95, y1: 82 },
    layerPercents: { skinEnd: 0.06, subcEnd: 0.20, fasciaEnd: 0.28 },
    labelOffset: 1.3,
  };

  const looksMsk = ["múscul", "muscle", "fascia", "aponeurosis", "tendón", "tendon", "estriacion", "fibr"].some((k) => hay.includes(k));
  if (!looksMsk) return null;

  const superficialHints = ["superfic", "superficial", "delgado", "thin", "near field"];
  const deepHints = ["profund", "deep", "obeso", "adiposo", "panículo", "espesor subcut"];

  if (superficialHints.some((k) => hay.includes(k))) return SUPERFICIAL;
  if (deepHints.some((k) => hay.includes(k))) return PROFUNDO;
  return MEDIO;
}
