import React, { useEffect, useMemo, useState } from "react";
import MuscleAtlasCanvas from "./MuscleAtlasCanvas";
import AtlasMskControls from "./AtlasMskControls";
import { loadMskCfg } from "../utils/mskAtlasStore";
import { suggestMskCfg } from "../utils/mskAtlasSuggest";

export default function MskAtlasOverlay({ imagingId, src, imgType, summary, patterns }) {
  const initial = useMemo(
    () => ({
      preset: "medio",
      anatomyBox: { x0: 10, y0: 10, x1: 95, y1: 84 },
      layerPercents: { skinEnd: 0.06, subcEnd: 0.22, fasciaEnd: 0.30 },
      labelOffset: 1.6,
    }),
    []
  );

  const [cfg, setCfg] = useState(initial);

  useEffect(() => {
    if (!imagingId) return;
    const saved = loadMskCfg(imagingId);
    if (saved) {
      setCfg(saved);
      return;
    }
    const s = suggestMskCfg({ imgType, summary, patterns });
    if (s) setCfg((prev) => ({ ...prev, preset: s.preset || "auto", ...s }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagingId]);

  if (!src) return null;

  return (
    <div className="w-full h-full p-2 sm:p-3 overflow-auto">
      <div className="bg-white/90 backdrop-blur rounded-xl border border-slate-200 shadow-sm p-3">
        <AtlasMskControls
          imagingId={imagingId}
          imgType={imgType}
          summary={summary}
          patterns={patterns}
          value={cfg}
          onChange={setCfg}
        />
      </div>

      <div className="mt-3 rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
        <MuscleAtlasCanvas
          src={src}
          anatomyBox={cfg.anatomyBox}
          layerPercents={cfg.layerPercents}
          labelOffset={cfg.labelOffset}
        />
      </div>
    </div>
  );
}
