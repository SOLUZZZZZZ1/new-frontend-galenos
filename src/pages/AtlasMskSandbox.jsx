import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MskAtlasOverlay from "../components/MskAtlasOverlay";

export default function AtlasMskSandbox() {
  const navigate = useNavigate();
  const BASE = import.meta.env.BASE_URL || "/";

  const [src, setSrc] = useState(`${BASE}logo.png`);
  const [localUrl, setLocalUrl] = useState("");

  const [imagingId, setImagingId] = useState("demo-001");
  const [imgType, setImgType] = useState("ECO");
  const [summary, setSummary] = useState("Ecografía muscular superficial. Fascia visible. Músculo con estriación.");
  const [patterns, setPatterns] = useState(["fascia hiperecogénica", "patrón fibrilar"]);

  useEffect(() => () => { if (localUrl) URL.revokeObjectURL(localUrl); }, [localUrl]);

  function handlePickLocalFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (localUrl) URL.revokeObjectURL(localUrl);
    const url = URL.createObjectURL(f);
    setLocalUrl(url);
    setSrc(url);
  }

  return (
    <main className="sr-container py-6 space-y-4">
      <header className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">MSK Atlas · IA + presets + slider</h1>
          <p className="text-sm text-slate-600">Sandbox seguro antes de integrarlo en PanelMedico.</p>
        </div>
        <button type="button" onClick={() => navigate(-1)} className="sr-btn-secondary text-sm whitespace-nowrap">Volver</button>
      </header>

      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3">
        <div className="grid md:grid-cols-3 gap-3 items-end">
          <div className="md:col-span-2 space-y-2">
            <div>
              <label className="sr-label">Ruta / URL (pública) de la imagen</label>
              <input className="sr-input w-full" value={src} onChange={(e) => setSrc(e.target.value)} />
            </div>
            <div>
              <label className="sr-label">O subir imagen local</label>
              <input type="file" accept="image/*" className="sr-input w-full" onChange={handlePickLocalFile} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="sr-label">imaging_id (demo)</label>
            <input className="sr-input w-full" value={imagingId} onChange={(e) => setImagingId(e.target.value)} />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="sr-label">imgType</label>
            <input className="sr-input w-full" value={imgType} onChange={(e) => setImgType(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="sr-label">summary (IA)</label>
            <input className="sr-input w-full" value={summary} onChange={(e) => setSummary(e.target.value)} />
          </div>
          <div className="md:col-span-3">
            <label className="sr-label">patterns (IA) — separados por coma</label>
            <input className="sr-input w-full" value={patterns.join(", ")}
              onChange={(e) => setPatterns(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
          </div>
        </div>
      </section>

      <MskAtlasOverlay imagingId={imagingId} src={src} imgType={imgType} summary={summary} patterns={patterns} />
    </main>
  );
}
