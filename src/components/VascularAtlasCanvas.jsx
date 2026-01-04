import React from "react";

function confText(confPct) {
  if (confPct == null) return "";
  if (confPct >= 85) return " · conf. alta";
  if (confPct >= 70) return " · conf. media";
  return " · conf. baja";
}

export default function VascularAtlasCanvas({ overlay, showStentLabel = false, showPatternShade = false }) {
  if (!overlay || !overlay.layers) return null;

  const { vessel_cx = 0.5, vessel_cy = 0.5, vessel_rx = 0.1, vessel_ry = 0.08 } = overlay.layers;

  const label = overlay.label?.text || "Vaso (orientativo)";
  const confidencePct = typeof overlay.confidence === "number" ? Math.round(overlay.confidence * 100) : null;

  const cx = vessel_cx * 100;
  const cy = vessel_cy * 100;
  const rx = vessel_rx * 100;
  const ry = vessel_ry * 100;

  const haloRx = rx * 1.25;
  const haloRy = ry * 1.25;

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
      {/* Halo suave: patrón a mirar */}
      {showPatternShade ? (
        <ellipse
          cx={cx}
          cy={cy}
          rx={haloRx}
          ry={haloRy}
          fill="rgba(70,160,255,0.07)"
          stroke="rgba(70,160,255,0.14)"
          strokeWidth="0.5"
        />
      ) : null}

      {/* Elipse del vaso */}
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill="rgba(70,160,255,0.22)"
        stroke="rgba(70,160,255,0.95)"
        strokeWidth="0.8"
      />

      {/* Etiqueta del vaso (sin porcentaje) */}
      <text
        x={cx}
        y={Math.max(cy - ry - 3.0, 4)}
        textAnchor="middle"
        fontSize="3.2"
        fill="rgba(220,245,255,0.95)"
        stroke="rgba(0,0,0,0.55)"
        strokeWidth="0.9"
        paintOrder="stroke"
      >
        {label}{confText(confidencePct)}
      </text>

      {/* Etiqueta de stent (hecho visible) */}
      {showStentLabel ? (
        <text
          x={cx}
          y={Math.max(cy + ry + 6.0, 10)}
          textAnchor="middle"
          fontSize="3.1"
          fill="rgba(255,255,255,0.92)"
          stroke="rgba(0,0,0,0.55)"
          strokeWidth="0.9"
          paintOrder="stroke"
        >
          Stent (orientativo)
        </text>
      ) : null}
    </svg>
  );
}
