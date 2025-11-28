// src/App.jsx — Router principal Galenos.pro (sin protección de momento)
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import InicioGalenos from "./pages/InicioGalenos.jsx";
import LoginMedico from "./pages/LoginMedico.jsx";
import PanelMedico from "./pages/PanelMedico.jsx";

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Routes>
        {/* Landing Galenos */}
        <Route path="/" element={<InicioGalenos />} />

        {/* Login médico */}
        <Route path="/login" element={<LoginMedico />} />

        {/* Panel médico SIEMPRE accesible (luego ya protegeremos) */}
        <Route path="/panel-medico" element={<PanelMedico />} />

        {/* Cualquier ruta rara → inicio */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
