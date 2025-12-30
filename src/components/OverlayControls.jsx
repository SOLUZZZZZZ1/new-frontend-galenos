import React from "react";
import { UIProfile } from "../utils/uiProfiles";

// ✅ MSK controls (ya lo tienes)
import AtlasMskControls from "./AtlasMskControls";

// ⏳ Próximos perfiles:
// import VascularControls from "./VascularControls";

/**
 * OverlayControls — switch central de controles por perfil.
 *
 * Props:
 * - overlay: estado actual (shape libre por perfil)
 * - onChangeOverlay: setter para actualizar overlay
 * - extra: props opcionales (imagingId, onAutoReal, loadingAuto...) para MSK
 */
export default function OverlayControls({
  overlay,
  onChangeOverlay,
  imagingId,
  imgType,
  summary,
  patterns,
  onAutoReal,
  loadingAuto,
}) {
  if (!overlay || !overlay.profile) return null;

  switch (overlay.profile) {
    case UIProfile.MSK:
      return (
        <AtlasMskControls
          imagingId={imagingId}
          imgType={imgType}
          summary={summary}
          patterns={patterns}
          value={overlay}
          onChange={onChangeOverlay}
          onAutoReal={onAutoReal}
          loadingAuto={loadingAuto}
        />
      );

    // case UIProfile.VASCULAR:
    //   return <VascularControls overlay={overlay} onChange={onChangeOverlay} />;

    default:
      return null;
  }
}
