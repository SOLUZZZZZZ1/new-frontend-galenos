import React from "react";
import MuscleAtlasCanvas from "../components/MuscleAtlasCanvas.jsx";

export default function TestAtlas() {
  const API = import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

  return (
    <div className="sr-container py-6">
      <h1 className="text-xl font-bold mb-4">Test MSK – Atlas</h1>

      <MuscleAtlasCanvas src={`${API}/preview.jpg`} />
    </div>
  );
}
