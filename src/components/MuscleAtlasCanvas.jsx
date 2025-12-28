import React from "react";

export default function MuscleAtlasCanvas({ src }) {
  if (!src) return null;

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      style={{ width: "100%", height: "auto", background: "#00000010" }}
    >
      {/* ===== Imagen base ===== */}
      <image
        href={src}
        x="0"
        y="0"
        width="100"
        height="100"
        preserveAspectRatio="xMidYMid meet"
      />

      {/* ===== Panel de capas (izquierda) ===== */}
      <rect x="1.5" y="6" width="30" height="88" rx="3" fill="rgba(0,0,0,0.35)" />

      {/* Separadores */}
      <line x1="3" y1="24" x2="30" y2="24" stroke="rgba(255,255,255,0.25)" />
      <line x1="3" y1="44" x2="30" y2="44" stroke="rgba(255,255,255,0.25)" />
      <line x1="3" y1="54" x2="30" y2="54" stroke="rgba(255,255,255,0.25)" />

      {/* Etiquetas */}
      <text x="4" y="16" fontSize="3.8" fill="white">Piel / Skin</text>
      <text x="4" y="36" fontSize="3.8" fill="white">Subcutáneo / Subcutaneous</text>
      <text x="4" y="51" fontSize="3.8" fill="white">Fascia / Fascia</text>
      <text x="4" y="70" fontSize="3.8" fill="white">Músculo / Muscle</text>

      {/* ===== Flechas didácticas ===== */}
      <defs>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,255,255,0.8)" />
        </marker>
      </defs>

      <line x1="31" y1="16" x2="46" y2="16" stroke="white" strokeWidth="0.9" markerEnd="url(#arrow)" />
      <line x1="31" y1="36" x2="46" y2="36" stroke="white" strokeWidth="0.9" markerEnd="url(#arrow)" />
      <line x1="31" y1="51" x2="46" y2="51" stroke="white" strokeWidth="0.9" markerEnd="url(#arrow)" />
      <line x1="31" y1="70" x2="46" y2="70" stroke="white" strokeWidth="1.0" markerEnd="url(#arrow)" />

      {/* ===== Zona muscular ===== */}
      <rect x="46" y="56" width="52" height="34" rx="2" fill="rgba(255,255,200,0.12)" />

      {/* ===== Fibras musculares ===== */}
      <defs>
        <clipPath id="muscleClip">
          <rect x="46" y="56" width="52" height="34" />
        </clipPath>
      </defs>

      <g clipPath="url(#muscleClip)">
        {[0, 1, 2, 3, 4, 5].map(i => (
          <path
            key={i}
            d={`M46 ${60 + i * 5} Q72 ${58 + i * 5} 98 ${60 + i * 5}`}
            stroke="rgba(255,255,200,0.35)"
            strokeWidth="1.0"
            fill="none"
          />
        ))}
      </g>

      {/* ===== Disclaimer ===== */}
      <text x="46" y="96" fontSize="3.2" fill="rgba(255,255,255,0.7)">
        Guía didáctica orientativa / Educational guide
      </text>
    </svg>
  );
}
