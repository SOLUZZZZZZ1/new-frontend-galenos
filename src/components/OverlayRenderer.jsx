import React from "react";
import { UIProfile } from "../utils/uiProfiles";

// ✅ Perfil MSK (ya lo tienes)
import MuscleAtlasCanvas from "./MuscleAtlasCanvas";

// ⏳ Próximos perfiles (los crearemos después)
// import VascularAtlasCanvas from "./VascularAtlasCanvas";
// import AbdominalAtlasCanvas from "./AbdominalAtlasCanvas";

/**
 * OverlayRenderer — switch central de render por perfil.
 *
 * Espera un objeto overlay con forma:
 * {
 *   profile: "MSK" | "VASCULAR" | ...
 *   roi: { x0,y0,x1,y1 }  // en 0..100 (frontend) o 0..1 (si lo normalizas antes)
 *   layers: { ... }
 *   label: { ... }
 * }
 */
export default function OverlayRenderer({ overlay, imageSrc }) {
  if (!overlay || !overlay.profile) return null;

  switch (overlay.profile) {
    case UIProfile.MSK: {
      // Adaptación MSK: el canvas actual usa anatomyBox (0..100) y layerPercents
      const anatomyBox = overlay.anatomyBox || overlay.roi || { x0: 10, y0: 10, x1: 95, y1: 84 };
      const layerPercents = overlay.layerPercents || overlay.layers || { skinEnd: 0.06, subcEnd: 0.22, fasciaEnd: 0.30 };
      const labelOffset = overlay.labelOffset ?? overlay.label?.muscle_offset ?? 1.6;

      return (
        <MuscleAtlasCanvas
          src={imageSrc}
          anatomyBox={anatomyBox}
          layerPercents={layerPercents}
          labelOffset={labelOffset}
        />
      );
    }

    // case UIProfile.VASCULAR:
    //   return <VascularAtlasCanvas overlay={overlay} imageSrc={imageSrc} />;

    // case UIProfile.ABDOMINAL:
    //   return <AbdominalAtlasCanvas overlay={overlay} imageSrc={imageSrc} />;

    default:
      return null;
  }
}
