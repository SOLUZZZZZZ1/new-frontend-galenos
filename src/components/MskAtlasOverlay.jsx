import React, { useMemo, useState } from "react";
import MuscleAtlasCanvas from "./MuscleAtlasCanvas";
import AtlasMskControls from "./AtlasMskControls";

// ✅ Usa el mismo backend que PanelMedico
const API = import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

export default function MskAtlasOverlay({ imagingId, src }) {
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
      // ✅ En Galenos se usa galenos_token
      const token = localStorage.getItem("galenos_token");
      const res = await fetch(`${API}/imaging/msk-overlay/${imagingId}`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const t = await res.text();
        console.error("Auto(real) error:", res.status, t);
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const o = data?.msk_overlay;
      if (!o || !o.roi || !o.layers) {
        console.error("Auto(real) invalid payload:", data);
        throw new Error("invalid payload");
      }

      setCfg({
        preset: "auto",
        anatomyBox: {
          x0: (o.roi.x0 ?? 0.10) * 100,
          y0: (o.roi.y0 ?? 0.10) * 100,
          x1: (o.roi.x1 ?? 0.95) * 100,
          y1: (o.roi.y1 ?? 0.84) * 100,
        },
        layerPercents: {
          skinEnd: o.layers.skin_end ?? 0.06,
          subcEnd: o.layers.subc_end ?? 0.22,
          fasciaEnd: o.layers.fascia_y ?? 0.30,
        },
        labelOffset: o.label?.muscle_offset ?? 1.6,
      });
    } catch (e) {
      alert("No se pudo ejecutar Auto (real). Revisa que el backend esté accesible y que haya sesión.");
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
