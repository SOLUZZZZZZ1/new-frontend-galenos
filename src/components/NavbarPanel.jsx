// src/components/NavbarPanel.jsx — mini navbar interno del Panel (opcional)
import React from "react";
import { Link } from "react-router-dom";

export default function NavbarPanel({ onLogout }) {
  return (
    <div className="w-full bg-white/90 border-b">
      <div className="sr-row" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0" }}>
        <div className="flex items-center gap-3">
          <Link to="/"><img src="/logo.png" alt="MEDIAZION" style={{ height: 28 }} /></Link>
          <strong>Panel</strong>
        </div>
        <nav className="sr-tabs" style={{ display:"flex", gap: 8 }}>
          <Link className="sr-tab" to="/panel-mediador">Inicio</Link>
          <Link className="sr-tab" to="/panel-mediador/ai">IA</Link>
          <Link className="sr-tab" to="/panel-mediador/plantillas">Plantillas</Link>
          <Link className="sr-tab" to="/panel-mediador/pagos">Pagos</Link>
          <Link className="sr-tab" to="/panel-mediador/casos">Casos</Link>
          <Link className="sr-tab" to="/panel-mediador/agenda">Agenda</Link>
          <Link className="sr-tab" to="/panel-mediador/voces">Voces</Link>
          <Link className="sr-tab" to="/panel-mediador/perfil">Mi perfil</Link>
          <button className="sr-btn-secondary" onClick={onLogout}>Salir</button>
        </nav>
      </div>
    </div>
  );
}
