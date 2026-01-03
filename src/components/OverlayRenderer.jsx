import React from "react";
import { UIProfile } from "../utils/uiProfiles";

// MSK (didáctico existente)
import MuscleAtlasCanvas from "./MuscleAtlasCanvas";

// ✅ MSK (real backend)
import MskRealCanvas from "./MskRealCanvas";

// ✅ VASCULAR
import VascularAtlasCanvas from "./VascularAtlasCanvas";

/**
 * OverlayRenderer — switch central de render por perfil.
 *
 * Reglas:
 * - Si MSK tiene renderMode="real" y backendOverlay, se muestra SOLO el overlay real.
 * - En caso contrario, se muestra el MSK didáctico existente.
 */
export default function OverlayRenderer({ overlay, imageSrc }) {
  if (!overlay || !overlay.profile) return null;

  switch (overlay.profile) {
    case UIProfile.MSK: {
      // 1) Modo REAL: verdad del backend
      if (overlay.renderMode === "real" && overlay.backendOverlay) {
        return <MskRealCanvas src={imageSrc} overlay={overlay.backendOverlay} />;
      }

      // 2) Fallback didáctico: el que ya tenías
      const anatomyBox =
        overlay.anatomyBox ||
        overlay.roi || { x0: 10, y0: 10, x1: 95, y1: 84 };

      const layerPercents =
        overlay.layerPercents ||
        overlay.layers || { skinEnd: 0.06, subcEnd: 0.22, fasciaEnd: 0.30 };

      const labelOffset =
        overlay.labelOffset ?? overlay.label?.muscle_offset ?? 1.6;

      return (
        <MuscleAtlasCanvas
          src={imageSrc}
          anatomyBox={anatomyBox}
          layerPercents={layerPercents}
          labelOffset={labelOffset}
        />
      );
    }

    case UIProfile.VASCULAR:
      return <VascularAtlasCanvas overlay={overlay} />;

    default:
      return null;
  }
}
