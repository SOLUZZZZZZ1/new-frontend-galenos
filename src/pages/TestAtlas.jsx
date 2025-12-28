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

<MuscleAtlasCanvas
  src="https://s3.eu-central-003.backblazeb2.com/galenos-storage/prod/users/1/imaging/42/preview.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=00359e01d7672d80000000001%2F20251228%2Feu-central-003%2Fs3%2Faws4_request&X-Amz-Date=20251228T110129Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=867a2d9740b783923183144400a67a490af786674896eb7abc3d71080452bfde"
/>
