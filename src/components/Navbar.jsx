// src/components/Navbar.jsx
import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  const tab = ({ isActive }) => "sr-tab" + (isActive ? " active" : "");

  return (
    <header className="sr-navbar">
      <div className="sr-row">
        {/* Marca solo con texto MEDIAZION */}
        <Link to="/" aria-label="MEDIAZION" className="sr-brand">
          <span className="sr-brand-title">MEDIAZION</span>
        </Link>

        <nav className="sr-tabs" aria-label="Navegación principal">
          {/* Bloque principal sitio web */}
          <NavLink to="/" end className={tab}>
            Inicio
          </NavLink>
          <NavLink to="/quienes-somos" className={tab}>
            Quiénes somos
          </NavLink>
          <NavLink to="/servicios" className={tab}>
            Servicios
          </NavLink>
          <NavLink to="/mediadores" className={tab}>
            Mediadores
          </NavLink>
          <NavLink to="/mediadores/directorio" className={tab}>
            Directorio
          </NavLink>
          <NavLink to="/tarifas" className={tab}>
            Tarifas
          </NavLink>
          <NavLink to="/contacto" className={tab}>
            Contacto
          </NavLink>
          <NavLink to="/actualidad" className={tab}>
            Actualidad
          </NavLink>

          {/* Blog / ayuda / paneles */}
          <NavLink to="/voces" className={tab}>
            Voces
          </NavLink>
          <NavLink to="/ayuda" className={tab}>
            Ayuda
          </NavLink>
          <NavLink to="/panel-mediador" className={tab}>
            Panel
          </NavLink>
          <NavLink to="/admin" className={tab}>
            Admin
          </NavLink>

          {/* Antes era “Ayuntamientos” → ahora “Instituciones”, en el mismo sitio pero destacada */}
          <NavLink
            to="/instituciones"
            className={tab}
            style={{ marginLeft: "1.5rem", fontWeight: 700 }}
          >
            Instituciones
          </NavLink>
        </nav>
      </div>
      <div className="sr-navbar-underline" />
    </header>
  );
}
