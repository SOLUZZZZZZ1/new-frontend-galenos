import React, { useEffect, useMemo, useState } from "react";
import MuscleAtlasCanvas from "./MuscleAtlasCanvas";
import AtlasMskControls from "./AtlasMskControls";

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
  const [loadingAuto, setLoadingAuto] = useState(false);

  async function autoReal() {
    if (!imagingId) return;
    setLoadingAuto(true);

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`/imaging/msk-overlay/${imagingId}`, {
        method: "POST",
        headers: {
          "Authorization": token ? `Bearer ${token}` : "",
        },
      });

      if (!res.ok) throw new Error("Auto MSK falló");

      const data = await res.json();
      const o = data?.msk_overlay;
      if (!o) throw new Error("Respuesta inválida");

      setCfg({
        preset: "auto",
        anatomyBox: {
          x0: o.roi.x0 * 100,
          y0: o.roi.y0 * 100,
          x1: o.roi.x1 * 100,
          y1: o.roi.y1 * 100,
        },
        layerPercents: {
          skinEnd: o.layers.skin_end,
          subcEnd: o.layers.subc_end,
          fasciaEnd: o.layers.fascia_y,
        },
        labelOffset: o.label?.muscle_offset ?? 1.6,
      });
    } catch (e) {
      alert("No se pudo ejecutar Auto (real).");
    } finally {
      setLoadingAuto(false);
    }
  }

  if (!src) return null;

  return (
    <div className="w-full h-full">
      <div className="flex flex-col md:flex-row gap-3 w-full h-full">
        <aside className="md:w-[340px] lg:w-[380px] w-full">
          <div className="bg-white/92 backdrop-blur rounded-xl border border-slate-200 shadow-sm p-3 md:max-h-[75vh] overflow-auto">
            <AtlasMskControls
              imagingId={imagingId}
              value={cfg}
              onChange={setCfg}
              onAutoReal={autoReal}
              loadingAuto={loadingAuto}
            />
          </div>
        </aside>

        <section className="flex-1 min-w-0">
          <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 md:max-h-[75vh]">
            <MuscleAtlasCanvas
              src={src}
              anatomyBox={cfg.anatomyBox}
              layerPercents={cfg.layerPercents}
              labelOffset={cfg.labelOffset}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
