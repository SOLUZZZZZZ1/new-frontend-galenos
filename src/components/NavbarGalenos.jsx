// src/components/NavbarGalenos.jsx — Barra superior Galenos.pro con logo 3D
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function NavbarGalenos() {
  const loc = useLocation();
  const nav = useNavigate();

  const loggedIn = Boolean(localStorage.getItem("galenos_token"));
  const email = localStorage.getItem("galenos_email") || "";

  function isActive(path) {
    if (path === "/panel-medico") {
      return loc.pathname.startsWith("/panel-medico");
    }
    return loc.pathname === path;
  }

  function handleLogout() {
    localStorage.removeItem("galenos_token");
    localStorage.removeItem("galenos_email");
    nav("/login");
  }

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="sr-container flex items-center justify-between py-3 gap-4">
        {/* Logo + marca */}
        <button
          type="button"
          onClick={() => nav("/")}
          className="flex items-center gap-3 group"
        >
          {/* Logo imagen 3D */}
          <div className="h-10 w-10 rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-slate-50 flex items-center justify-center">
            <img
              src="/galenos-logo.png"
              alt="Galenos.pro"
              className="h-10 w-10 object-contain group-hover:scale-105 transition-transform duration-150"
              onError={(e) => {
                // Fallback elegante si el logo no carga
                e.currentTarget.style.display = "none";
              }}
            />
          </div>

          {/* Texto de marca */}
          <div className="flex flex-col text-left leading-tight">
            <span className="text-sm font-semibold tracking-tight text-slate-900">
              GALENOS<span className="text-sky-700">.pro</span>
            </span>
            <span className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
              Copiloto clínico para médicos
            </span>
          </div>
        </button>

        {/* Navegación */}
        <nav className="flex items-center gap-3 text-sm">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-full border text-xs sm:text-sm ${
              isActive("/")
                ? "border-sky-500 bg-sky-50 text-sky-700"
                : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50"
            }`}
          >
            Inicio
          </Link>

          <Link
            to="/panel-medico"
            className={`px-3 py-1.5 rounded-full border text-xs sm:text-sm ${
              isActive("/panel-medico")
                ? "border-sky-500 bg-sky-50 text-sky-700"
                : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50"
            }`}
          >
            Panel médico
          </Link>

          {!loggedIn ? (
            <Link
              to="/login"
              className={`px-3 py-1.5 rounded-full border text-xs sm:text-sm ${
                isActive("/login")
                  ? "border-sky-500 bg-sky-50 text-sky-700"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              Acceder
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline sr-small text-slate-500">
                {email}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="sr-btn-secondary text-xs sm:text-sm"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
