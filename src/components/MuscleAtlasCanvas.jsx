import React from "react";

/**
 * MuscleAtlasCanvas — DIDÁCTICO (A) · Subcutáneo↔Fascia MÁS CERRADO
 *
 * Ajuste solicitado:
 * - Menos espacio entre Subcutáneo y Fascia.
 *
 * Defaults nuevos (más “apretados”):
 * - skinEnd:   0.06
 * - subcEnd:   0.22
 * - fasciaEnd: 0.28
 * - muscleStart:0.44
 */
export default function MuscleAtlasCanvas({
  src,
  anatomyBox = { x0: 10, y0: 18, x1: 95, y1: 86 },
  layerPercents = { skinEnd: 0.06, subcEnd: 0.22, fasciaEnd: 0.28, muscleStart: 0.44 },
  className = "",
}) {
  if (!src) return null;

  const { x0, y0, x1, y1 } = anatomyBox;
  const W = Math.max(1, x1 - x0);
  const H = Math.max(1, y1 - y0);

  const panelX = 2.0;
  const panelY = y0;
  const panelW = 26.0;
  const panelH = H;

  const workX0 = x0;
  const workX1 = x1;

  const ySkin = y0 + H * 0.02;

  const ySkinEnd = y0 + H * (layerPercents.skinEnd ?? 0.06);
  const ySubcEnd = y0 + H * (layerPercents.subcEnd ?? 0.22);
  const yFasciaEnd = y0 + H * (layerPercents.fasciaEnd ?? 0.28);
  const yMuscleTop = y0 + H * (layerPercents.muscleStart ?? 0.44);
  const yBottom = y1;

  const txt = "rgba(255,255,255,0.95)";
  const line = "rgba(255,255,255,0.75)";
  const weak = "rgba(255,255,255,0.25)";
  const accent = "rgba(255,255,200,0.28)";
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const ArrowDouble = ({ x, yA, yB }) => {
    const y1c = clamp(yA, 0, 100);
    const y2c = clamp(yB, 0, 100);
    const mid = (y1c + y2c) / 2;
    return (
      <>
        <line x1={x} y1={y1c} x2={x} y2={y2c} stroke={line} strokeWidth="0.8" />
        <path d={`M${x-0.9} ${y1c+1.6} L${x} ${y1c} L${x+0.9} ${y1c+1.6}`} stroke={line} strokeWidth="0.8" fill="none" />
        <path d={`M${x-0.9} ${y2c-1.6} L${x} ${y2c} L${x+0.9} ${y2c-1.6}`} stroke={line} strokeWidth="0.8" fill="none" />
        <circle cx={x} cy={mid} r="0.8" fill="rgba(255,255,255,0.6)" />
      </>
    );
  };

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      style={{ width: "100%", height: "auto", background: "#00000010" }}
    >
      <image href={src} x="0" y="0" width="100" height="100" preserveAspectRatio="none" />

      <rect x={x0} y={y0} width={W} height={H} fill="rgba(0,0,0,0)" stroke="rgba(255,255,255,0.14)" strokeWidth="0.4" />

      <rect x={panelX} y={panelY} width={panelW} height={panelH} rx="2.5" fill="rgba(0,0,0,0.35)" stroke="rgba(255,255,255,0.10)" strokeWidth="0.4" />

      <line x1={panelX+1.5} y1={ySkinEnd} x2={panelX+panelW-1.5} y2={ySkinEnd} stroke={weak} strokeWidth="0.6" />
      <line x1={panelX+1.5} y1={ySubcEnd} x2={panelX+panelW-1.5} y2={ySubcEnd} stroke={weak} strokeWidth="0.6" />
      <line x1={panelX+1.5} y1={yFasciaEnd} x2={panelX+panelW-1.5} y2={yFasciaEnd} stroke={weak} strokeWidth="0.6" />
      <line x1={panelX+1.5} y1={yMuscleTop} x2={panelX+panelW-1.5} y2={yMuscleTop} stroke={weak} strokeWidth="0.6" />

      <text x={panelX+2.0} y={ySkin-2.2} fontSize="3.6" fill={txt}>Piel / Skin</text>
      <text x={panelX+2.0} y={(ySkinEnd+ySubcEnd)/2} fontSize="3.6" fill={txt}>Subcutáneo / Subcutaneous</text>
      <text x={panelX+2.0} y={(ySubcEnd+yFasciaEnd)/2} fontSize="3.6" fill={txt}>Fascia / Fascia</text>
      <text x={panelX+2.0} y={(yMuscleTop+yBottom)/2} fontSize="3.6" fill={txt}>Músculo / Muscle</text>

      <path d={`M ${panelX+1.8} ${y0} L ${panelX+1.8} ${y1}`} stroke="rgba(255,255,0,0.75)" strokeWidth="1.2" />
      {[ySkin, ySkinEnd, ySubcEnd, yFasciaEnd, yMuscleTop].map((yy, i) => (
        <line key={i} x1={panelX+1.2} y1={yy} x2={panelX+5.0} y2={yy} stroke="rgba(255,255,0,0.75)" strokeWidth="1.2" />
      ))}

      <line x1={workX0} y1={ySkinEnd} x2={workX1} y2={ySkinEnd} stroke={weak} strokeWidth="0.7" />
      <line x1={workX0} y1={ySubcEnd} x2={workX1} y2={ySubcEnd} stroke={weak} strokeWidth="0.7" />
      <line x1={workX0} y1={yFasciaEnd} x2={workX1} y2={yFasciaEnd} stroke={weak} strokeWidth="0.7" />

      <rect x={workX0} y={yMuscleTop} width={workX1-workX0} height={yBottom-yMuscleTop} fill="rgba(255,255,200,0.08)" stroke="rgba(255,255,200,0.10)" strokeWidth="0.3" />

      <defs>
        <clipPath id="mskMuscleClipTightSF">
          <rect x={workX0} y={yMuscleTop} width={workX1-workX0} height={yBottom-yMuscleTop} />
        </clipPath>
      </defs>
      <g clipPath="url(#mskMuscleClipTightSF)">
        {Array.from({ length: 9 }).map((_, i) => {
          const yy = yMuscleTop + (i + 1) * ((yBottom - yMuscleTop) / 10);
          const amp = 1.2;
          return (
            <path
              key={i}
              d={`M${workX0} ${yy} Q ${(workX0 + workX1) / 2} ${yy - amp} ${workX1} ${yy}`}
              stroke={accent}
              strokeWidth="0.9"
              fill="none"
            />
          );
        })}
      </g>

      <ArrowDouble x={workX0 + W * 0.18} yA={ySkin} yB={ySkinEnd} />
      <ArrowDouble x={workX0 + W * 0.30} yA={ySkinEnd} yB={ySubcEnd} />
      <ArrowDouble x={workX0 + W * 0.42} yA={ySubcEnd} yB={yFasciaEnd} />

      <text x={workX0 + W * 0.16} y={(ySkin + ySkinEnd) / 2} fontSize="3.0" fill={txt}>Skin</text>
      <text x={workX0 + W * 0.28} y={(ySkinEnd + ySubcEnd) / 2} fontSize="3.0" fill={txt}>SubQ</text>
      <text x={workX0 + W * 0.40} y={(ySubcEnd + yFasciaEnd) / 2} fontSize="3.0" fill={txt}>Fascia</text>

      <text x={workX0} y={clamp(yBottom + 8, 0, 98)} fontSize="3.1" fill="rgba(255,255,255,0.70)">
        Guía didáctica orientativa / Educational guide
      </text>
    </svg>
  );
}
