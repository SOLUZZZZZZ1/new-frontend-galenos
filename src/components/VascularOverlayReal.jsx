import React, { useEffect, useState } from "react";
import VascularAtlasCanvas from "./VascularAtlasCanvas";

const API = import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

export default function VascularOverlayReal({ imagingId, enabled }) {
  const [overlay, setOverlay] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!enabled || !imagingId) {
        setOverlay(null);
        return;
      }

      const token = localStorage.getItem("galenos_token");
      if (!token) return;

      try {
        const res = await fetch(`${API}/imaging/overlay/${imagingId}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ profile: "VASCULAR" }),
        });

        const data = await res.json();
        if (!cancelled && data?.overlay?.layers) {
          setOverlay(data.overlay);
        }
      } catch {
        if (!cancelled) setOverlay(null);
      }
    }

    run();
    return () => {
      cancelled = True;
    };
  }, [enabled, imagingId]);

  if (!overlay) return null;
  return <VascularAtlasCanvas overlay={overlay} />;
}
