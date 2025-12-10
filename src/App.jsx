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
import Patients from "./pages/Patients.jsx";
import PacienteDetalle from "./pages/PacienteDetalle.jsx";
import DashboardMedico from "./pages/DashboardMedico.jsx";
import PerfilMedico from "./pages/PerfilMedico.jsx";
import DeGuardiaPage from "./pages/DeGuardiaPage.jsx";
import ActualidadMedica from "./pages/ActualidadMedica.jsx";

// Wrapper para rutas que requieren estar logueado (cualquier médico)
function RequireAuth({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("galenos_token");

  if (!token) {
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

          {/* Registro médico desde invitación (modo antiguo, opcional) */}
          <Route path="/registro" element={<RegistroMedico />} />

          {/* Registro médico libre (sin invitación) */}
          <Route path="/alta-medico" element={<RegistroMedicoLibre />} />

          {/* Panel de ejemplo público (sin login) */}
          <Route path="/panel-demo" element={<PanelDemo />} />

          {/* Solicitud de acceso (sin invitación) */}
          <Route path="/solicitar-acceso" element={<SolicitarAcceso />} />

          {/* Pacientes — requiere login */}
          <Route
            path="/pacientes"
            element={
              <RequireAuth>
                <Patients />
              </RequireAuth>
            }
          />

          <Route
            path="/PacienteDetalle/:id"
            element={
              <RequireAuth>
                <PacienteDetalle />
              </RequireAuth>
            }
          />

          {/* Panel médico — requiere login */}
          <Route
            path="/panel-medico"
            element={
              <RequireAuth>
                <PanelMedico />
              </RequireAuth>
            }
          />

          {/* Dashboard médico — requiere login */}
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardMedico />
              </RequireAuth>
            }
          />

          {/* Perfil médico — requiere login */}
          <Route
            path="/perfil"
            element={
              <RequireAuth>
                <PerfilMedico />
              </RequireAuth>
            }
          />

          {/* De guardia — requiere login */}
          <Route
            path="/de-guardia"
            element={
              <RequireAuth>
                <DeGuardiaPage />
              </RequireAuth>
            }
          />

          {/* Actualidad médica — requiere login */}
          <Route
            path="/actualidad-medica"
            element={
              <RequireAuth>
                <ActualidadMedica />
              </RequireAuth>
            }
          />

          {/* Panel administrador — requiere login */}
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
            La decisión clínica final corresponde siempre al médico responsable
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
