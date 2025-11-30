// src/App.jsx — Router principal Galenos.pro con login protegido + registro (invitación y libre) + solicitud de acceso
import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import NavbarGalenos from "./components/NavbarGalenos.jsx";
import InicioGalenos from "./pages/InicioGalenos.jsx";
import LoginMedico from "./pages/LoginMedico.jsx";
import PanelMedico from "./pages/PanelMedico.jsx";
import RegistroMedico from "./pages/RegistroMedico.jsx";
import RegistroMedicoLibre from "./pages/RegistroMedicoLibre.jsx";
import PanelDemo from "./pages/PanelDemo.jsx";
import SolicitarAcceso from "./pages/SolicitarAcceso.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";

// Pequeño wrapper para proteger rutas que requieren login
function RequireAuth({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("galenos_token");

  if (!token) {
    // Si no hay token, redirigimos a /login guardando la ruta de origen
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

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

          {/* Registro médico desde invitación */}
          <Route path="/registro" element={<RegistroMedico />} />

          {/* Registro médico libre (sin invitación) */}
          <Route path="/alta-medico" element={<RegistroMedicoLibre />} />

          {/* Panel de ejemplo público (sin login) */}
          <Route path="/panel-demo" element={<PanelDemo />} />

          {/* Solicitud de acceso (sin invitación) */}
          <Route path="/solicitar-acceso" element={<SolicitarAcceso />} />

          {/* Panel médico — protegido por login */}
          <Route
            path="/panel-medico"
            element={
              <RequireAuth>
                <PanelMedico />
              </RequireAuth>
            }
          />

          {/* Panel administrador — solo para usuario master (mismo login, filtro interno) */}
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <AdminPanel />
              </RequireAuth>
            }
          />

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
