// src/components/NavbarGalenos.jsx — Barra superior fija Galenos.pro
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
        <button
          type="button"
          onClick={() => nav("/")}
          className="flex items-center gap-2 group"
        >
          <div className="h-9 w-9 rounded-2xl bg-sky-600 flex items-center justify-center text-white font-bold text-xl shadow-sm group-hover:bg-sky-700 transition-colors">
            G
          </div>
          <div className="flex flex-col text-left leading-tight">
            <span className="text-sm font-semibold text-slate-900">
              Galenos.pro
            </span>
            <span className="text-[11px] text-slate-500">
              Copiloto de apoyo al médico
            </span>
          </div>
        </button>

        <nav className="flex items-center gap-3 text-sm">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-xl border text-xs sm:text-sm ${
              isActive("/")
                ? "border-sky-500 bg-sky-50 text-sky-700"
                : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50"
            }`}
          >
            Inicio
          </Link>

          <Link
            to="/panel-medico"
            className={`px-3 py-1.5 rounded-xl border text-xs sm:text-sm ${
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
              className={`px-3 py-1.5 rounded-xl border text-xs sm:text-sm ${
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
