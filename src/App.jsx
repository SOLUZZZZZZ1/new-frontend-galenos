// src/App.jsx — Router principal Galenos.pro con navbar fijo
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import NavbarGalenos from "./components/NavbarGalenos.jsx";
import InicioGalenos from "./pages/InicioGalenos.jsx";
import LoginMedico from "./pages/LoginMedico.jsx";
import PanelMedico from "./pages/PanelMedico.jsx";

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <NavbarGalenos />
      <div className="flex-1">
        <Routes>
          {/* Landing Galenos */}
          <Route path="/" element={<InicioGalenos />} />

          {/* Login médico */}
          <Route path="/login" element={<LoginMedico />} />

          {/* Panel médico — versión accesible (luego se puede proteger) */}
          <Route path="/panel-medico" element={<PanelMedico />} />

          {/* Cualquier ruta rara → inicio */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <footer className="border-t border-slate-200 py-4 mt-8">
        <div className="sr-container flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="sr-small">
            © {new Date().getFullYear()} Galenos.pro · Herramienta de apoyo al médico.
          </p>
          <p className="sr-small text-slate-500">
            La decisión clínica final corresponde siempre al médico responsable.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
