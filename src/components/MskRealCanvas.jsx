import React from "react";

export default function MskRealCanvas({ src, mskOverlay }) {
  if (!src || !mskOverlay) return null;

  const roi = mskOverlay.roi || null;
  const layers = mskOverlay.layers || {};

  const skinEnd = Number(layers.skin_end ?? 0.06);
  const subcEnd = Number(layers.subc_end ?? 0.22);
  const fasciaY = Number(layers.fascia_y ?? 0.30);

  const toPct = (v) => Math.max(0, Math.min(100, Number(v) * 100));

  const ySkinEnd = toPct(skinEnd);
  const ySubcEnd = toPct(subcEnd);
  const yFascia = toPct(fasciaY);

  const roiRect = roi && typeof roi === "object"
    ? {
        x: toPct(roi.x0 ?? 0.10),
        y: toPct(roi.y0 ?? 0.10),
        w: toPct(roi.x1 ?? 0.95) - toPct(roi.x0 ?? 0.10),
        h: toPct(roi.y1 ?? 0.84) - toPct(roi.y0 ?? 0.10),
      }
    : null;

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-auto">
      <image href={src} x="0" y="0" width="100" height="100" preserveAspectRatio="none" />

      {roiRect && roiRect.w > 0 && roiRect.h > 0 ? (
        <rect x={roiRect.x} y={roiRect.y} width={roiRect.w} height={roiRect.h}
          fill="rgba(0,0,0,0)" stroke="rgba(255,255,255,0.14)" strokeWidth="0.4" />
      ) : null}

      <line x1="0" y1={ySkinEnd} x2="100" y2={ySkinEnd} stroke="rgba(255,255,255,0.25)" strokeWidth="0.7" />
      <line x1="0" y1={ySubcEnd} x2="100" y2={ySubcEnd} stroke="rgba(255,255,255,0.25)" strokeWidth="0.7" />
      <line x1="0" y1={yFascia} x2="100" y2={yFascia} stroke="rgba(255,255,200,0.28)" strokeWidth="0.8" />

      <text x="2" y={Math.max(3, ySkinEnd - 1)} fontSize="3.2" fill="rgba(255,255,255,0.85)">Piel</text>
      <text x="2" y={Math.max(6, (ySkinEnd + ySubcEnd) / 2)} fontSize="3.2" fill="rgba(255,255,255,0.85)">Subcutáneo</text>
      <text x="2" y={Math.max(6, (ySubcEnd + yFascia) / 2)} fontSize="3.2" fill="rgba(255,255,255,0.85)">Fascia</text>
      <text x="2" y={Math.min(98, yFascia + 6)} fontSize="3.2" fill="rgba(255,255,255,0.85)">Músculo</text>

      <text x="2" y="98" fontSize="2.8" fill="rgba(255,255,255,0.55)">
        Guía orientativa (no diagnóstico)
      </text>
    </svg>
  );
}
