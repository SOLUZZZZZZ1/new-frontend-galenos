// src/pages/AtlasMskSandbox.jsx
// Sandbox seguro para validar el MSK Atlas sin tocar PanelMedico.jsx
// Objetivo: que compile siempre y sirva como laboratorio visual aislado.

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// Ajusta la ruta si tu componente está en otra carpeta:
// - recomendado: src/components/MuscleAtlasCanvas.jsx
import MuscleAtlasCanvas from "../components/MuscleAtlasCanvas";

export default function AtlasMskSandbox() {
  const navigate = useNavigate();

  // ✅ Imagen de prueba:
  // - Si quieres probar con la imagen real analizada, cambia a `imagenFilePath` desde tu panel.
  // - Para el sandbox, usa una imagen pública simple o una de tu /public
  const defaultSrc = "/casa-diseno.jpg"; // cambia por "/atlas/muscle_base.png" si lo tienes

  const [src, setSrc] = useState(defaultSrc);

  const hint = useMemo(() => {
    return [
      "Este sandbox NO toca PanelMedico.jsx.",
      "Si aquí compila y se ve bien, luego integramos en el visor ampliado.",
      "Recomendación: prueba con una imagen cuadrada y otra panorámica para ver escalado.",
    ].join(" ");
  }, []);

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
          <div className="md:col-span-2">
            <label className="sr-label">Ruta / URL (pública) de la imagen</label>
            <input
              type="text"
              className="sr-input w-full"
              value={src}
              onChange={(e) => setSrc(e.target.value)}
              placeholder="/atlas/muscle_base.png o https://..."
            />
            <p className="text-xs text-slate-500 mt-1">{hint}</p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSrc(defaultSrc)}
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
              title="Abrir imagen en pestaña nueva"
            >
              Abrir
            </a>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <h2 className="text-sm font-semibold mb-3">Vista</h2>

        <div className="w-full max-w-4xl mx-auto">
          {/* Marco para ver el escalado */}
          <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
            <MuscleAtlasCanvas src={src} />
          </div>

          <p className="text-[11px] text-slate-500 mt-2">
            Si ves el SVG bien aquí (responsive, sin “saltos”, sin distorsión), estamos listos
            para integrarlo como overlay “msk-atlas” dentro del visor ampliado.
          </p>
        </div>
      </section>
    </main>
  );
}
