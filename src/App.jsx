import React from "react";
import { Routes, Route, Navigate, useLocation, Link } from "react-router-dom";

import NavbarGalenos from "./components/NavbarGalenos.jsx";
import InicioGalenos from "./pages/InicioGalenos.jsx";
import LoginMedico from "./pages/LoginMedico.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
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
import ComunidadPage from "./pages/ComunidadPage.jsx";

// Páginas públicas SEO
import QueEsGalenos from "./pages/QueEsGalenos.jsx";
import Seguridad from "./pages/Seguridad.jsx";
import Contacto from "./pages/Contacto.jsx";

// Páginas legales
import AvisoLegal from "./pages/AvisoLegal.jsx";
import Privacidad from "./pages/Privacidad.jsx";
import Cookies from "./pages/Cookies.jsx";
import Condiciones from "./pages/Condiciones.jsx";

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

          {/* Páginas públicas (SEO / confianza) */}
          <Route path="/que-es-galenos" element={<QueEsGalenos />} />
          <Route path="/seguridad" element={<Seguridad />} />
          <Route path="/contacto" element={<Contacto />} />

          {/* Páginas legales */}
          <Route path="/aviso-legal" element={<AvisoLegal />} />
          <Route path="/privacidad" element={<Privacidad />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/condiciones" element={<Condiciones />} />

          {/* Login médico */}
          <Route path="/login" element={<LoginMedico />} />

          {/* Recuperación de contraseña (público) */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

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

          {/* Comunidad — requiere login */}
          <Route
            path="/comunidad"
            element={
              <RequireAuth>
                <ComunidadPage />
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

      {/* Footer con enlaces SEO + legales (visible en toda la web) */}
      <footer className="border-t border-slate-200 py-4 mt-8">
        <div className="sr-container flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="sr-small text-center sm:text-left">
            © {new Date().getFullYear()} Galenos.pro · Herramienta de apoyo al médico.
          </p>

          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
            {/* SEO / confianza */}
            <Link to="/que-es-galenos" className="text-slate-600 hover:text-slate-900">
              Qué es Galenos
            </Link>
            <Link to="/seguridad" className="text-slate-600 hover:text-slate-900">
              Seguridad
            </Link>
            <Link to="/contacto" className="text-slate-600 hover:text-slate-900">
              Contacto
            </Link>

            <span className="text-slate-300 hidden sm:inline">|</span>

            {/* Legal */}
            <Link to="/aviso-legal" className="text-slate-500 hover:text-slate-900">
              Aviso legal
            </Link>
            <Link to="/privacidad" className="text-slate-500 hover:text-slate-900">
              Privacidad(RGPD)
            </Link>
            <Link to="/cookies" className="text-slate-500 hover:text-slate-900">
              Cookies
            </Link>
            <Link to="/condiciones" className="text-slate-500 hover:text-slate-900">
              Condiciones
            </Link>
          </nav>
        </div>

        <div className="sr-container mt-2">
          <p className="sr-small text-slate-500 text-center sm:text-left">
            La decisión clínica final corresponde siempre al médico responsable.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
