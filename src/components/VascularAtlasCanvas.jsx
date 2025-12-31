import React from "react";

/**
 * VascularAtlasCanvas
 * Dibuja un vaso como elipse SVG a partir del overlay vascular IA.
 * NO diagnostica. Orientativo.
 */
export default function VascularAtlasCanvas({ overlay }) {
  if (!overlay || !overlay.layers) return null;

  const {
    vessel_cx = 0.5,
    vessel_cy = 0.5,
    vessel_rx = 0.1,
    vessel_ry = 0.08,
  } = overlay.layers;

  const label = overlay.label?.text || "Vaso (orientativo)";
  const confidence =
    typeof overlay.confidence === "number"
      ? Math.round(overlay.confidence * 100)
      : null;

  const cx = vessel_cx * 100;
  const cy = vessel_cy * 100;
  const rx = vessel_rx * 100;
  const ry = vessel_ry * 100;

  return (
    <svg
      viewBox="0 0 100 100"
      className="absolute inset-0 z-30 pointer-events-none"
      preserveAspectRatio="none"
    >
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

      {/* Etiqueta */}
      <text
        x={cx}
        y={Math.max(cy - ry - 2.5, 3)}
        textAnchor="middle"
        fontSize="3.2"
        fill="rgba(220,245,255,0.95)"
        stroke="rgba(0,0,0,0.55)"
        strokeWidth="0.9"
        paintOrder="stroke"
      >
        {label}
        {confidence !== null ? ` · ${confidence}%` : ""}
      </text>
    </svg>
  );
}
