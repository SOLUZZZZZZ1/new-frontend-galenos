import React, { useEffect, useState } from "react";
import VascularAtlasCanvas from "./VascularAtlasCanvas";

const API = import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

export default function VascularOverlayReal({ imagingId, enabled, imgRef }) {
  const [overlay, setOverlay] = useState(null);
  const [fit, setFit] = useState(null);

  useEffect(() => {
    if (!enabled || !imgRef?.current) return;

    function update() {
      const img = imgRef.current;
      const rect = img.getBoundingClientRect();
      const nw = img.naturalWidth || 0;
      const nh = img.naturalHeight || 0;
      if (!nw || !nh || !rect.width || !rect.height) return;

      const ratioImg = nw / nh;
      const ratioBox = rect.width / rect.height;

      let width, height, left, top;
      if (ratioImg > ratioBox) {
        width = rect.width;
        height = rect.width / ratioImg;
        left = 0;
        top = (rect.height - height) / 2;
      } else {
        height = rect.height;
        width = rect.height * ratioImg;
        top = 0;
        left = (rect.width - width) / 2;
      }

      setFit({ width, height, left, top });
    }

    const img = imgRef.current;
    img.addEventListener("load", update);
    update();
    window.addEventListener("resize", update);

    return () => {
      img.removeEventListener("load", update);
      window.removeEventListener("resize", update);
    };
  }, [enabled, imgRef]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!enabled || !imagingId) {
        setOverlay(null);
        return;
      }

      const token = localStorage.getItem("galenos_token");
      if (!token) return;

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
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [enabled, imagingId]);

  if (!overlay || !fit) return null;

  return (
    <div
      className="absolute z-30 pointer-events-none"
      style={{ left: fit.left, top: fit.top, width: fit.width, height: fit.height }}
    >
      <VascularAtlasCanvas overlay={overlay} />
    </div>
  );
}
