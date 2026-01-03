import React, { useEffect, useState } from "react";

function clamp01(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

export default function MskRealOverlayLayer({ imgRef, overlay }) {
  const [fit, setFit] = useState(null);

  useEffect(() => {
    if (!imgRef?.current) return;

    function update() {
      const img = imgRef.current;
      const rect = img.getBoundingClientRect();
      const nw = img.naturalWidth || 0;
      const nh = img.naturalHeight || 0;
      if (!nw || !nh || !rect.width || !rect.height) return;

      const ratioImg = nw / nh;
      const ratioBox = rect.width / rect.height;

      let width, height, left, top;
      if (ratioImg > ratioBox) {
        width = rect.width;
        height = rect.width / ratioImg;
        left = 0;
        top = (rect.height - height) / 2;
      } else {
        height = rect.height;
        width = rect.height * ratioImg;
        top = 0;
        left = (rect.width - width) / 2;
      }
      setFit({ width, height, left, top });
    }

    const img = imgRef.current;
    img.addEventListener("load", update);
    update();
    window.addEventListener("resize", update);
    return () => {
      img.removeEventListener("load", update);
      window.removeEventListener("resize", update);
    };
  }, [imgRef]);

  if (!overlay || !fit) return null;

  const layers = overlay.layers || {};
  const ySkin = clamp01(layers.skin_end ?? 0.06) * 100;
  const ySubc = clamp01(layers.subc_end ?? 0.22) * 100;
  const yFascia = clamp01(layers.fascia_y ?? 0.30) * 100;

  return (
    <div
      className="absolute z-40 pointer-events-none"
      style={{ left: fit.left, top: fit.top, width: fit.width, height: fit.height }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
        <line x1="0" y1={ySkin} x2="100" y2={ySkin} stroke="rgba(255,255,255,0.28)" strokeWidth="0.8" />
        <line x1="0" y1={ySubc} x2="100" y2={ySubc} stroke="rgba(255,255,255,0.28)" strokeWidth="0.8" />
        <line x1="0" y1={yFascia} x2="100" y2={yFascia} stroke="rgba(255,255,200,0.30)" strokeWidth="0.9" />
        <text x="2" y={Math.max(3, ySkin - 1)} fontSize="3.2" fill="rgba(255,255,255,0.85)">Piel</text>
        <text x="2" y={Math.max(6, (ySkin + ySubc) / 2)} fontSize="3.2" fill="rgba(255,255,255,0.85)">Subcutáneo</text>
        <text x="2" y={Math.max(6, (ySubc + yFascia) / 2)} fontSize="3.2" fill="rgba(255,255,255,0.85)">Fascia</text>
        <text x="2" y={Math.min(98, yFascia + 6)} fontSize="3.2" fill="rgba(255,255,255,0.85)">Músculo</text>
      </svg>
    </div>
  );
}
