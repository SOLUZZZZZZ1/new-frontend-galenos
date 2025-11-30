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

// Wrapper para rutas que requieren estar logueado (pero no necesariamente PRO)
function RequireAuth({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("galenos_token");

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// Wrapper para rutas SOLO PRO (requiere login + haber pasado por Stripe)
function RequirePro({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("galenos_token");
  const isPro = localStorage.getItem("galenos_is_pro") === "1";

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isPro) {
    // Si no es PRO, lo mandamos a inicio para que active Galenos PRO
    return <Navigate to="/" state={{ from: location }} replace />;
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

          {/* Registro médico desde invitación (modo antiguo, opcional) */}
          <Route path="/registro" element={<RegistroMedico />} />

          {/* Registro médico libre (sin invitación) */}
          <Route path="/alta-medico" element={<RegistroMedicoLibre />} />

          {/* Panel de ejemplo público (sin login) */}
          <Route path="/panel-demo" element={<PanelDemo />} />

          {/* Solicitud de acceso (sin invitación) */}
          <Route path="/solicitar-acceso" element={<SolicitarAcceso />} />

          {/* Panel médico — SOLO PRO (login + Stripe) */}
          <Route
            path="/panel-medico"
            element={
              <RequirePro>
                <PanelMedico />
              </RequirePro>
            }
          />

          {/* Panel administrador — solo requiere login (usuario master) */}
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
