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
    <div className="w-full h-full">
      <div className="flex flex-col md:flex-row gap-3 w-full h-full">
        {/* Panel */}
        <aside className="md:w-[340px] lg:w-[380px] w-full">
          <div className="bg-white/92 backdrop-blur rounded-xl border border-slate-200 shadow-sm p-3 md:max-h-[75vh] overflow-auto">
            <AtlasMskControls
              imagingId={imagingId}
              imgType={imgType}
              summary={summary}
              patterns={patterns}
              value={cfg}
              onChange={setCfg}
            />
          </div>
        </aside>

        {/* Imagen */}
        <section className="flex-1 min-w-0">
          <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 md:max-h-[75vh]">
            <MuscleAtlasCanvas
              src={src}
              anatomyBox={cfg.anatomyBox}
              layerPercents={cfg.layerPercents}
              labelOffset={cfg.labelOffset}
            />
          </div>

          <p className="text-[11px] text-slate-600 mt-2">
            Tip: Ajusta “Inicio del músculo (fascia)” y luego “Guardar” para memorizado por imagen.
          </p>
        </section>
      </div>
    </div>
  );
}
