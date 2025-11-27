// src/App.jsx — Router principal Galenos.pro (mínimo viable)
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import InicioGalenos from "./pages/InicioGalenos.jsx";
import LoginMedico from "./pages/LoginMedico.jsx";
import PanelMedico from "./pages/PanelMedico.jsx";

function App() {
  // En el futuro aquí podremos leer un token para proteger rutas
  const isLogged = !!localStorage.getItem("galenos_token");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Aquí más adelante pondremos un NavbarGalenos y FooterGalenos */}
      <Routes>
        <Route path="/" element={<InicioGalenos />} />
        <Route path="/login" element={<LoginMedico />} />
        <Route
          path="/panel-medico"
          element={isLogged ? <PanelMedico /> : <Navigate to="/login" replace />}
        />
        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
