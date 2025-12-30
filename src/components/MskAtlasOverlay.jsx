import React, { useMemo, useState } from "react";
import MuscleAtlasCanvas from "./MuscleAtlasCanvas";
import AtlasMskControls from "./AtlasMskControls";

const API = import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

export default function MskAtlasOverlay({ imagingId, src, imgType, summary, patterns }) {
  const initial = useMemo(() => ({
    preset: "medio",
    anatomyBox: { x0: 10, y0: 10, x1: 95, y1: 84 },
    layerPercents: { skinEnd: 0.06, subcEnd: 0.22, fasciaEnd: 0.30 },
    labelOffset: 1.6,
  }), []);

  const [cfg, setCfg] = useState(initial);
  const [loadingAuto, setLoadingAuto] = useState(false);

  async function autoReal() {
    if (!imagingId) return alert("No hay imagingId.");
    const token = localStorage.getItem("galenos_token");
    if (!token) return alert("No hay sesión (galenos_token).");

    setLoadingAuto(true);
    try {
      const url = `${API}/imaging/msk-overlay/${imagingId}`;
      const res = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } });
      const raw = await res.text();

      if (!res.ok) {
        console.error("Auto(real) HTTP", res.status, raw);
        return alert(`Auto(real) error ${res.status}: ${raw.slice(0,200)}`);
      }

      let data = null;
      try { data = JSON.parse(raw); } catch {}
      const o = data?.msk_overlay;
      if (!o?.roi || !o?.layers) {
        console.error("Payload inválido:", data);
        return alert("Auto(real) payload inválido (sin roi/layers).");
      }

      setCfg({
        preset: "auto",
        anatomyBox: { x0: (o.roi.x0 ?? 0.10)*100, y0: (o.roi.y0 ?? 0.10)*100, x1: (o.roi.x1 ?? 0.95)*100, y1: (o.roi.y1 ?? 0.84)*100 },
        layerPercents: { skinEnd: o.layers.skin_end ?? 0.06, subcEnd: o.layers.subc_end ?? 0.22, fasciaEnd: o.layers.fascia_y ?? 0.30 },
        labelOffset: o.label?.muscle_offset ?? 1.6,
      });

      alert("Auto(real) aplicado ✅");
    } catch (e) {
      console.error("Auto(real) exception:", e);
      alert("Auto(real) fallo de red/CORS.");
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
              imgType={imgType}
              summary={summary}
              patterns={patterns}
              value={cfg}
              onChange={setCfg}
              onAutoReal={autoReal}
              loadingAuto={loadingAuto}
            />
          </div>
        </aside>

        <section className="flex-1 min-w-0">
          <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 md:max-h-[75vh]">
            <MuscleAtlasCanvas src={src} anatomyBox={cfg.anatomyBox} layerPercents={cfg.layerPercents} labelOffset={cfg.labelOffset} />
          </div>
          <p className="text-[11px] text-slate-600 mt-2">API: <span className="font-mono">{API}</span></p>
        </section>
      </div>
    </div>
  );
}
