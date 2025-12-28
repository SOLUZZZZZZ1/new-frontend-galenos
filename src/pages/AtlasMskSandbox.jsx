// src/pages/AtlasMskSandbox.jsx
// Sandbox seguro para validar el MSK Atlas sin tocar PanelMedico.jsx
// V2: soporte de subida local (URL.createObjectURL) + BASE_URL para assets de /public

import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Ajusta la ruta si tu componente está en otra carpeta:
import MuscleAtlasCanvas from "../components/MuscleAtlasCanvas";

export default function AtlasMskSandbox() {
  const navigate = useNavigate();

  // ✅ BASE_URL de Vite para que funcione con subrutas/preview/prod
  const BASE = import.meta.env.BASE_URL || "/";

  // Probamos con un asset público típico. Cambia si lo prefieres:
  // - si tienes /casa-diseno.jpg en public, debería funcionar con BASE + "casa-diseno.jpg"
  // - si no, prueba con BASE + "logo.png"
  const defaultSrc = `${BASE}logo.png`;

  const [src, setSrc] = useState(defaultSrc);
  const [localUrl, setLocalUrl] = useState("");

  // Limpieza de objectURL cuando cambias de fichero
  useEffect(() => {
    return () => {
      if (localUrl) URL.revokeObjectURL(localUrl);
    };
  }, [localUrl]);

  const hint = useMemo(() => {
    return [
      "1) Si no aparece imagen, pulsa “Abrir” y mira si da 404.",
      "2) Puedes subir una imagen local (JPG/PNG) y se verá seguro.",
      "3) Luego integramos en PanelMedico solo cuando esto sea verde.",
    ].join(" ");
  }, []);

  function handlePickLocalFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;

    // revoca anterior si existía
    if (localUrl) URL.revokeObjectURL(localUrl);

    const url = URL.createObjectURL(f);
    setLocalUrl(url);
    setSrc(url);
  }

  function resetToDefault() {
    if (localUrl) {
      URL.revokeObjectURL(localUrl);
      setLocalUrl("");
    }
    setSrc(defaultSrc);
  }

  return (
    <main className="sr-container py-6 space-y-4">
      <header className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">MSK Atlas · Sandbox</h1>
          <p className="text-sm text-slate-600">
            Laboratorio aislado para validar el atlas (SVG) sin romper producción.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="sr-btn-secondary text-sm whitespace-nowrap"
        >
          Volver
        </button>
      </header>

      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3">
        <h2 className="text-sm font-semibold">Fuente de imagen</h2>

        <div className="grid md:grid-cols-3 gap-3 items-end">
          <div className="md:col-span-2 space-y-2">
            <div>
              <label className="sr-label">Ruta / URL (pública) de la imagen</label>
              <input
                type="text"
                className="sr-input w-full"
                value={src}
                onChange={(e) => setSrc(e.target.value)}
                placeholder={`${BASE}casa-diseno.jpg o https://...`}
              />
              <p className="text-xs text-slate-500 mt-1">{hint}</p>
            </div>

            <div>
              <label className="sr-label">O subir imagen local (recomendado para probar rápido)</label>
              <input
                type="file"
                accept="image/*"
                className="sr-input w-full"
                onChange={handlePickLocalFile}
              />
              <p className="text-[11px] text-slate-500 mt-1">
                La imagen local se carga con <span className="font-mono">URL.createObjectURL</span> (no hay CORS).
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={resetToDefault}
              className="sr-btn-secondary text-xs"
              title="Restaurar imagen por defecto"
            >
              Reset
            </button>
            <a
              href={src}
              target="_blank"
              rel="noreferrer"
              className="sr-btn-secondary text-xs"
              title="Abrir imagen en pestaña nueva (si da 404, esa es la causa)"
            >
              Abrir
            </a>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <h2 className="text-sm font-semibold mb-3">Vista</h2>

        <div className="w-full max-w-4xl mx-auto">
          <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
            <MuscleAtlasCanvas src={src} />
          </div>

          <p className="text-[11px] text-slate-500 mt-2">
            Si ves el SVG bien aquí (responsive, sin distorsión), estamos listos
            para integrarlo como overlay “msk-atlas” dentro del visor ampliado.
          </p>
        </div>
      </section>
    </main>
  );
}
