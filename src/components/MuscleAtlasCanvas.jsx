import React from "react";

/**
 * MuscleAtlasCanvas — DIDÁCTICO (A)
 * Objetivo: que SIEMPRE se vea “como en los papers”, con indicaciones completas,
 * sin que las líneas se salgan aunque la eco tenga márgenes/letterbox/textos.
 *
 * En ecografía real, la “zona anatómica útil” no suele ocupar todo el frame.
 * Por eso definimos una caja anatómica fija (anatomyBox) dentro del viewBox 0..100
 * y dibujamos TODO relativo a esa caja.
 *
 * - No es segmentación exacta.
 * - Es guía didáctica/orientativa.
 *
 * Props:
 * - src: URL de imagen (obligatoria)
 * - anatomyBox: { x0, y0, x1, y1 } en coordenadas 0..100 (opcional)
 *   Default pensado para ecos típicas con barra superior y márgenes.
 * - className: clases CSS para usar como overlay absoluto si se desea
 */
export default function MuscleAtlasCanvas({
  src,
 anatomyBox = { x0: 10, y0: 40, x1: 95, y1: 90 }

  className = "",
}) {
  if (!src) return null;

  const { x0, y0, x1, y1 } = anatomyBox;

  // Dimensiones de la zona anatómica
  const W = Math.max(1, x1 - x0);
  const H = Math.max(1, y1 - y0);

  // Panel izquierdo (como en tus ejemplos, con llaves/labels)
  const panelX = 2.0;
  const panelY = y0;
  const panelW = 26.0;
  const panelH = H;

  // Área donde dibujamos las “capas” (a la derecha del panel)
  const workX0 = x0;
  const workX1 = x1;

  // Posiciones relativas de capas dentro de la caja anatómica
  const ySkin = y0 + H * 0.05;
  const ySubc = y0 + H * 0.28;
  const yFascia = y0 + H * 0.48;
  const yMuscleTop = y0 + H * 0.62;
  const yBottom = y1;

  // Estilos “paper-like”
  const txt = "rgba(255,255,255,0.95)";
  const line = "rgba(255,255,255,0.75)";
  const weak = "rgba(255,255,255,0.25)";
  const accent = "rgba(255,255,200,0.28)";

  // Helpers
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // Flechas (doble flecha vertical) para medir espesor por capas
  const ArrowDouble = ({ x, yA, yB }) => {
    const y1c = clamp(yA, 0, 100);
    const y2c = clamp(yB, 0, 100);
    const mid = (y1c + y2c) / 2;
    return (
      <>
        <line x1={x} y1={y1c} x2={x} y2={y2c} stroke={line} strokeWidth="0.8" />
        {/* puntas */}
        <path d={`M${x-0.9} ${y1c+1.6} L${x} ${y1c} L${x+0.9} ${y1c+1.6}`} stroke={line} strokeWidth="0.8" fill="none" />
        <path d={`M${x-0.9} ${y2c-1.6} L${x} ${y2c} L${x+0.9} ${y2c-1.6}`} stroke={line} strokeWidth="0.8" fill="none" />
        {/* punto central */}
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
      {/* ===== Imagen base =====
          Importante:
          - Usamos "none" para que el contenido ocupe el viewBox y no haya “bandas”.
          - La guía está definida dentro del viewBox; así no se desalineará.
      */}
      <image href={src} x="0" y="0" width="100" height="100" preserveAspectRatio="none" />

      {/* ===== Caja anatómica (debug suave) ===== */}
      <rect
        x={x0}
        y={y0}
        width={W}
        height={H}
        fill="rgba(0,0,0,0.0)"
        stroke="rgba(255,255,255,0.14)"
        strokeWidth="0.4"
      />

      {/* ===== Panel de capas (izquierda) ===== */}
      <rect
        x={panelX}
        y={panelY}
        width={panelW}
        height={panelH}
        rx="2.5"
        fill="rgba(0,0,0,0.35)"
        stroke="rgba(255,255,255,0.10)"
        strokeWidth="0.4"
      />

      {/* Separadores en panel */}
      <line x1={panelX+1.5} y1={ySubc} x2={panelX+panelW-1.5} y2={ySubc} stroke={weak} strokeWidth="0.6" />
      <line x1={panelX+1.5} y1={yFascia} x2={panelX+panelW-1.5} y2={yFascia} stroke={weak} strokeWidth="0.6" />
      <line x1={panelX+1.5} y1={yMuscleTop} x2={panelX+panelW-1.5} y2={yMuscleTop} stroke={weak} strokeWidth="0.6" />

      {/* Etiquetas panel */}
      <text x={panelX+2.0} y={ySkin-2.2} fontSize="3.6" fill={txt}>Piel / Skin</text>
      <text x={panelX+2.0} y={ySubc-2.2} fontSize="3.6" fill={txt}>Subcutáneo / Subcutaneous</text>
      <text x={panelX+2.0} y={yFascia-2.2} fontSize="3.6" fill={txt}>Fascia / Fascia</text>
      <text x={panelX+2.0} y={yMuscleTop-2.2} fontSize="3.6" fill={txt}>Músculo / Muscle</text>

      {/* Llave vertical estilo “NORMAL” */}
      <path
        d={`M ${panelX+1.8} ${y0} L ${panelX+1.8} ${y1}`}
        stroke="rgba(255,255,0,0.75)"
        strokeWidth="1.2"
      />
      {/* Marcas horizontales */}
      {[ySkin, ySubc, yFascia, yMuscleTop].map((yy, i) => (
        <line
          key={i}
          x1={panelX+1.2}
          y1={yy}
          x2={panelX+5.0}
          y2={yy}
          stroke="rgba(255,255,0,0.75)"
          strokeWidth="1.2"
        />
      ))}

      {/* ===== Indicaciones tipo paper (flechas sobre la zona anatómica) ===== */}
      <line x1={workX0} y1={ySkin} x2={workX1} y2={ySkin} stroke={weak} strokeWidth="0.6" />
      <line x1={workX0} y1={ySubc} x2={workX1} y2={ySubc} stroke={weak} strokeWidth="0.6" />
      <line x1={workX0} y1={yFascia} x2={workX1} y2={yFascia} stroke={weak} strokeWidth="0.6" />

      {/* Zona músculo (sombreado suave) */}
      <rect
        x={workX0}
        y={yMuscleTop}
        width={workX1 - workX0}
        height={yBottom - yMuscleTop}
        fill="rgba(255,255,200,0.08)"
        stroke="rgba(255,255,200,0.10)"
        strokeWidth="0.3"
      />

      {/* Fibras musculares (clipped) */}
      <defs>
        <clipPath id="mskMuscleClipA">
          <rect x={workX0} y={yMuscleTop} width={workX1-workX0} height={yBottom-yMuscleTop} />
        </clipPath>
      </defs>

      <g clipPath="url(#mskMuscleClipA)">
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

      {/* Flechas de espesor */}
      <ArrowDouble x={workX0 + W * 0.18} yA={ySkin} yB={ySubc} />
      <ArrowDouble x={workX0 + W * 0.30} yA={ySubc} yB={yFascia} />
      <ArrowDouble x={workX0 + W * 0.42} yA={yFascia} yB={yMuscleTop} />

      {/* Etiquetas tipo paper */}
      <text x={workX0 + W * 0.16} y={(ySkin + ySubc) / 2} fontSize="3.2" fill={txt}>Skin</text>
      <text x={workX0 + W * 0.28} y={(ySubc + yFascia) / 2} fontSize="3.2" fill={txt}>SubQ</text>
      <text x={workX0 + W * 0.40} y={(yFascia + yMuscleTop) / 2} fontSize="3.2" fill={txt}>Fascia</text>

      {/* Disclaimer */}
      <text x={workX0} y={clamp(yBottom + 8, 0, 98)} fontSize="3.1" fill="rgba(255,255,255,0.70)">
        Guía didáctica orientativa / Educational guide
      </text>
    </svg>
  );
}
