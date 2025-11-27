// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import AvisoLegal from "./pages/AvisoLegal.jsx";
import Rgpd from "./pages/Rgpd.jsx";
import Cookies from "./pages/Cookies.jsx";

import Ayuntamientos from "./pages/Ayuntamientos.jsx";
import AyuntamientoLogin from "./pages/AyuntamientoLogin.jsx";
import PanelAyuntamiento from "./pages/PanelAyuntamiento.jsx";

import Instituciones from "./pages/Instituciones.jsx";
import Camaras from "./pages/Camaras.jsx";
import Colegios from "./pages/Colegios.jsx";
import RegistroInstitucion from "./pages/RegistroInstitucion.jsx";
import RegistroInstitucionOK from "./pages/RegistroInstitucionOK.jsx";
import AdminInstituciones from "./pages/admin/AdminInstituciones.jsx";
import InstitucionDashboard from "./components/InstitucionDashboard.jsx";

import Inicio from "./pages/Inicio.jsx";
import QuienesSomos from "./pages/QuienesSomos.jsx";
import Servicios from "./pages/Servicios.jsx";
import Mediadores from "./pages/Mediadores.jsx";
import Tarifas from "./pages/Tarifas.jsx";
import Contacto from "./pages/Contacto.jsx";
import Actualidad from "./pages/Actualidad.jsx";
import MediadorAlta from "./pages/MediadorAlta.jsx";
import Plantillas from "../Plantillas.jsx";
import Success from "./pages/Success.jsx";
import Cancel from "./pages/Cancel.jsx";
import Ayuda from "./pages/Ayuda.jsx";
import Documentos from "./pages/Documentos.jsx";
import InstruccionesPanel from "./pages/InstruccionesPanel.jsx";

import AdminLogin from "./pages/admin/Login.jsx";
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AdminIA from "./pages/admin/AdminIA.jsx";
import AdminMediadores from "./pages/admin/AdminMediadores.jsx";

import MediadoresDirectorio from "./pages/MediadoresDirectorio.jsx";
import PanelMediador from "./pages/PanelMediador.jsx";
import PanelMediadorDemo from "./pages/PanelMediadorDemo.jsx";

import CourseDetail from "./pages/CourseDetail.jsx";
import WebinarDetail from "./pages/WebinarDetail.jsx";

import LoginMediador from "./pages/LoginMediador.jsx";

import AiPanel from "./pages/AiPanel.jsx";
import AiPanelLegal from "./pages/AiPanelLegal.jsx";
import Casos from "./pages/Casos.jsx";
import Pagos from "./pages/Pagos.jsx";
import Agenda from "./pages/Agenda.jsx";
import PerfilMediador from "./pages/PerfilMediador.jsx";
import ActaNueva from "./pages/ActaNueva.jsx";

import VocesPublic from "./pages/VocesPublic.jsx";
import VocesDetalle from "./pages/VocesDetalle.jsx";
import VocesEditor from "./pages/VocesEditor.jsx";
import VocesListaPRO from "./pages/VocesListaPRO.jsx";

export default function App() {
  // ⚠️ De momento usamos valores neutros para el panel institucional.
  // Más adelante lo conectaremos al login de instituciones.
  const emailInstitucion = "";
  const nombreInstitucion = "Acceso institucional";
  const fechaExpiracion = null;

  function handleLogoutInstitucion() {
    // Aquí más adelante limpias storage/cookies específicas de instituciones.
    // De momento, redirigimos al acceso institucional.
    window.location.href = "/ayuntamientos/acceso";
  }

  return (
    <div
      className="min-h-screen text-zinc-900"
      style={{
        backgroundImage: "url('/marmol.jpg')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        backgroundPosition: "center center",
      }}
    >
      <Navbar />
      <Routes>
        {/* Básicas */}
        <Route path="/" element={<Inicio />} />
        <Route path="/quienes-somos" element={<QuienesSomos />} />
        <Route path="/servicios" element={<Servicios />} />
        <Route path="/tarifas" element={<Tarifas />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/actualidad" element={<Actualidad />} />
        <Route path="/ayuda" element={<Ayuda />} />

        {/* Ayuntamientos */}
        <Route path="/ayuntamientos" element={<Ayuntamientos />} />
        <Route path="/ayuntamientos/acceso" element={<AyuntamientoLogin />} />
        <Route path="/panel-ayuntamiento" element={<PanelAyuntamiento />} />

        {/* Instituciones */}
        <Route path="/instituciones" element={<Instituciones />} />
        <Route path="/instituciones/camaras" element={<Camaras />} />
        <Route path="/instituciones/colegios" element={<Colegios />} />
        <Route path="/instituciones/registro" element={<RegistroInstitucion />} />
        <Route
          path="/instituciones/registro/ok"
          element={<RegistroInstitucionOK />}
        />
        <Route
          path="/panel-institucion"
          element={
            <InstitucionDashboard
              who={emailInstitucion}
              institucion={nombreInstitucion}
              expiresAt={fechaExpiracion}
              onLogout={handleLogoutInstitucion}
            />
          }
        />

        {/* Legal */}
        <Route path="/aviso-legal" element={<AvisoLegal />} />
        <Route path="/rgpd" element={<Rgpd />} />
        <Route path="/cookies" element={<Cookies />} />

        {/* Mediadores */}
        <Route path="/mediadores" element={<Mediadores />} />
        <Route
          path="/mediadores/directorio"
          element={<MediadoresDirectorio />}
        />
        <Route path="/mediadores/alta" element={<MediadorAlta />} />
        <Route
          path="/panel-mediador/instrucciones"
          element={<InstruccionesPanel />}
        />

        {/* Acceso mediadores (login) */}
        <Route path="/acceso" element={<LoginMediador />} />

        {/* Panel mediador (normal) */}
        <Route path="/panel-mediador" element={<PanelMediador />} />
        <Route
          path="/panel-mediador-demo"
          element={<PanelMediadorDemo />}
        />
        <Route
          path="/panel-mediador/plantillas"
          element={<Plantillas />}
        />

        {/* Panel mediador · herramientas PRO */}
        <Route path="/panel-mediador/ai" element={<AiPanel />} />
        <Route path="/panel-mediador/ai-legal" element={<AiPanelLegal />} />
        <Route path="/panel-mediador/acta" element={<ActaNueva />} />
        <Route path="/panel-mediador/casos" element={<Casos />} />
        <Route path="/panel-mediador/pagos" element={<Pagos />} />
        <Route path="/panel-mediador/agenda" element={<Agenda />} />
        <Route path="/panel-mediador/perfil" element={<PerfilMediador />} />
        <Route path="/panel-mediador/voces" element={<VocesListaPRO />} />
        <Route path="/panel-mediador/voces/nuevo" element={<VocesEditor />} />
        <Route
          path="/panel-mediador/documentos"
          element={<Documentos />}
        />

        {/* Voces público */}
        <Route path="/voces" element={<VocesPublic />} />
        <Route path="/voces/:slug" element={<VocesDetalle />} />

        {/* Detalle formativo */}
        <Route path="/servicios/curso/:slug" element={<CourseDetail />} />
        <Route path="/servicios/webinar/:slug" element={<WebinarDetail />} />

        {/* Suscripción */}
        <Route path="/suscripcion/ok" element={<Success />} />
        <Route path="/suscripcion/cancel" element={<Cancel />} />

        {/* Admin clásico */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/ia" element={<AdminIA />} />
        <Route path="/admin/mediadores" element={<AdminMediadores />} />
        <Route
          path="/admin/instituciones"
          element={<AdminInstituciones />}
        />

        {/* Admin alternativo para pruebas: /nora-admin */}
        <Route path="/nora-admin" element={<AdminLogin />} />
        <Route
          path="/nora-admin/dashboard"
          element={<AdminDashboard />}
        />
      </Routes>
      <Footer />
    </div>
  );
}
