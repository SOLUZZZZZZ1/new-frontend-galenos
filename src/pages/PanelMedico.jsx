// src/pages/PanelMedico.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MskAtlasOverlay from "../components/MskAtlasOverlay";
import VascularOverlayReal from "../components/VascularOverlayReal";

const API = import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

export default function PanelMedico() {
  const navigate = useNavigate();
  const token = localStorage.getItem("galenos_token");

  // --- estados clave (recortados para foco en overlay) ---
  const [overlayMode, setOverlayMode] = useState("auto"); // auto | msk-orient | msk-atlas | vascular | off
  const [showImgOverlay, setShowImgOverlay] = useState(true);
  const [imgModalOpen, setImgModalOpen] = useState(false);

  const [imagenFilePath, setImagenFilePath] = useState("");
  const [lastImagenId, setLastImagenId] = useState(null);
  const [imgUiFamily, setImgUiFamily] = useState("");

  // --- SVG fallback direccional (ya existente) ---
  function VascularOverlaySvg() {
    return (
      <svg viewBox="0 0 100 100" className="absolute inset-0 pointer-events-none z-20">
        <path d="M8 52 Q50 48 92 52" stroke="rgba(255,255,255,0.28)" strokeWidth="1.2" fill="none" />
        <path d="M8 47 Q50 43 92 47" stroke="rgba(255,255,255,0.16)" strokeWidth="0.8" fill="none" />
        <path d="M8 57 Q50 53 92 57" stroke="rgba(255,255,255,0.16)" strokeWidth="0.8" fill="none" />
      </svg>
    );
  }

  return (
    <main className="sr-container py-6">
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
        <h2 className="text-lg font-semibold">Imágenes médicas</h2>

        {imagenFilePath && (
          <div className="relative inline-block mt-2 cursor-zoom-in" onClick={() => setImgModalOpen(true)}>
            <img
              src={imagenFilePath}
              alt="Estudio de imagen médica"
              className="relative z-10 max-w-xs md:max-w-sm w-full rounded-lg border border-slate-200"
            />

            {/* VASCULAR REAL (IA) */}
            {showImgOverlay && overlayMode !== "off" && (
              (overlayMode === "vascular" || (overlayMode === "auto" && String(imgUiFamily).toUpperCase() === "VASCULAR")) ? (
                <VascularOverlayReal imagingId={lastImagenId} enabled={true} />
              ) : null
            )}

            {/* Fallback direccional */}
            {showImgOverlay && overlayMode === "vascular" && <VascularOverlaySvg />}
          </div>
        )}

        {/* Modal */}
        {imgModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3" onClick={() => setImgModalOpen(false)}>
            <div className="bg-white rounded-xl max-w-5xl w-full p-3 relative" onClick={(e) => e.stopPropagation()}>
              <button type="button" onClick={() => setImgModalOpen(false)} className="absolute top-2 right-2 sr-btn-secondary text-xs">✕</button>

              <div className="relative w-full">
                <img src={imagenFilePath} alt="Estudio ampliado" className="relative z-10 w-full max-h-[75vh] object-contain rounded-lg border border-slate-200" />

                {/* VASCULAR REAL (IA) */}
                {showImgOverlay && overlayMode === "vascular" && (
                  <VascularOverlayReal imagingId={lastImagenId} enabled={true} />
                )}

                {/* Fallback direccional */}
                {showImgOverlay && overlayMode === "vascular" && <VascularOverlaySvg />}

                {/* MSK Atlas (no tocado) */}
                {showImgOverlay && overlayMode === "msk-atlas" && (
                  <div className="absolute inset-0 z-30 pointer-events-auto">
                    <MskAtlasOverlay imagingId={lastImagenId} src={imagenFilePath} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
