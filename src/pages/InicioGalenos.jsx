// src/pages/InicioGalenos.jsx — Landing mínima de Galenos.pro
import React from "react";
import { useNavigate } from "react-router-dom";

export default function InicioGalenos() {
  const nav = useNavigate();

  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="max-w-xl text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Galenos.pro · Panel PRO para médicos
        </h1>
        <p className="text-slate-700 mb-4">
          Una herramienta de apoyo para médicos de cualquier especialidad:
          análisis inteligente de analíticas, lectura de informes con IA,
          organización de casos y agenda, todo en un solo lugar.
        </p>
        <p className="text-slate-600 mb-6">
          Esta es la versión inicial del proyecto. Desde aquí podrás acceder a
          tu cuenta de médico y empezar a gestionar tus casos.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => nav("/login")}
            className="px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700"
          >
            Acceder como médico
          </button>
          <button
            onClick={() => window.open("https://mediazion.eu", "_blank")}
            className="px-4 py-2 rounded-lg border border-sky-600 text-sky-700 hover:bg-sky-50"
          >
            Ver Mediazion (ejemplo en producción)
          </button>
        </div>
      </div>
    </main>
  );
}
