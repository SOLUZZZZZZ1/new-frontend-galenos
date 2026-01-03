import React from "react";

export default function MskRealCanvas({ src, overlay }) {
  if (!src || !overlay) return null;

  const layers = overlay.layers || {};
  const toPct = (v) => Math.max(0, Math.min(100, Number(v) * 100));

  const ySkin = toPct(layers.skin_end ?? 0.06);
  const ySubc = toPct(layers.subc_end ?? 0.22);
  const yFascia = toPct(layers.fascia_y ?? 0.30);

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-auto">
      <image href={src} x="0" y="0" width="100" height="100" preserveAspectRatio="none" />

      <line x1="0" y1={ySkin} x2="100" y2={ySkin} stroke="rgba(255,255,255,0.28)" strokeWidth="0.8" />
      <line x1="0" y1={ySubc} x2="100" y2={ySubc} stroke="rgba(255,255,255,0.28)" strokeWidth="0.8" />
      <line x1="0" y1={yFascia} x2="100" y2={yFascia} stroke="rgba(255,255,200,0.30)" strokeWidth="0.9" />

      <text x="2" y={Math.max(3, ySkin - 1)} fontSize="3.2" fill="rgba(255,255,255,0.85)">Piel</text>
      <text x="2" y={Math.max(6, (ySkin + ySubc) / 2)} fontSize="3.2" fill="rgba(255,255,255,0.85)">Subcutáneo</text>
      <text x="2" y={Math.max(6, (ySubc + yFascia) / 2)} fontSize="3.2" fill="rgba(255,255,255,0.85)">Fascia</text>
      <text x="2" y={Math.min(98, yFascia + 6)} fontSize="3.2" fill="rgba(255,255,255,0.85)">Músculo</text>

      <text x="2" y="98" fontSize="2.8" fill="rgba(255,255,255,0.55)">
        Overlay real del backend (orientativo, no diagnóstico)
      </text>
    </svg>
  );
}