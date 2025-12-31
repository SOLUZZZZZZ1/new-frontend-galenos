import React from "react";

export default function VascularAtlasCanvas({ overlay }) {
  if (!overlay || !overlay.layers) return null;

  const {
    vessel_cx = 0.5,
    vessel_cy = 0.5,
    vessel_rx = 0.1,
    vessel_ry = 0.08,
  } = overlay.layers;

  const label = overlay.label?.text || "Vaso (orientativo)";
  const conf =
    typeof overlay.confidence === "number"
      ? Math.round(overlay.confidence * 100)
      : null;

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
      <ellipse
        cx={vessel_cx * 100}
        cy={vessel_cy * 100}
        rx={vessel_rx * 100}
        ry={vessel_ry * 100}
        fill="rgba(70,160,255,0.22)"
        stroke="rgba(70,160,255,0.95)"
        strokeWidth="0.8"
      />
      <text
        x={vessel_cx * 100}
        y={Math.max(vessel_cy * 100 - vessel_ry * 100 - 2.5, 3)}
        textAnchor="middle"
        fontSize="3.2"
        fill="rgba(220,245,255,0.95)"
        stroke="rgba(0,0,0,0.55)"
        strokeWidth="0.9"
        paintOrder="stroke"
      >
        {label}{conf !== null ? ` · ${conf}%` : ""}
      </text>
    </svg>
  );
}
