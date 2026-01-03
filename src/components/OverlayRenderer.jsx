import React from "react";
import { UIProfile } from "../utils/uiProfiles";

// MSK (existente)
import MuscleAtlasCanvas from "./MuscleAtlasCanvas";
import MskRealCanvas from "./MskRealCanvas";

// ✅ VASCULAR (nuevo)
import VascularAtlasCanvas from "./VascularAtlasCanvas";

/**
 * OverlayRenderer — switch central de render por perfil.
 */
export default function OverlayRenderer({ overlay, imageSrc }) {
  if (!overlay || !overlay.profile) return null;

  switch (overlay.profile) {
    
case UIProfile.MSK: {
  if (overlay?.renderMode === "real" && overlay?.backendOverlay) {
    return <MskRealCanvas src={imageSrc} overlay={overlay.backendOverlay} />;
  }
  if (overlayMode === "MSK_ATLAS") {
    return (
      <MuscleAtlasCanvas
        src={imageSrc}
        anatomyBox={anatomyBox}
        layerPercents={layerPercents}
        labelOffset={labelOffset}
      />
    );
  }
  return null;
}
;

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
