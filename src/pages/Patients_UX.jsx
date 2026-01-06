// src/pages/Patients.jsx — listado de pacientes Galenos.pro (UX fino: Activos/Archivados + búsqueda + restore seguro)
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [aliasNew, setAliasNew] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [q, setQ] = useState("");

  const [toast, setToast] = useState(null); // {type,msg}

  function pushToast(type, msg) {
    setToast({ type, msg });
    window.clearTimeout(pushToast._t);
    pushToast._t = window.setTimeout(() => setToast(null), 3000);
  }

  async function loadPatients() {
    setError("");
    const token = localStorage.getItem("galenos_token");
    if (!token) {
      setError("No hay sesión activa. Vuelve a iniciar sesión.");
      return;
    }

    try {
      setLoading(true);
      const url = showArchived ? `${API}/patients?archived_only=true` : `${API}/patients`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const raw = await res.text();

      if (!res.ok) {
        let msg = "No se han podido cargar los pacientes.";
        try {
          const errData = JSON.parse(raw);
          if (errData?.detail) msg = errData.detail;
        } catch {}
        setError(msg);
        return;
      }

      let data = [];
      try { data = JSON.parse(raw || "[]"); } catch { data = []; }
      setPatients(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("❌ Error cargando pacientes:", e);
      setError("Error de conexión al cargar pacientes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showArchived]);

  async function handleCreatePatient(e) {
    e.preventDefault();
    setError("");

    const token = localStorage.getItem("galenos_token");
    if (!token) {
      setError("No hay sesión activa. Vuelve a iniciar sesión.");
      return;
    }

    if (!aliasNew.trim()) {
      setError("Introduce un alias (ej. 0001 - Nombre Apellidos).");
      return;
    }

    try {
      setCreating(true);
      const res = await fetch(`${API}/patients`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ alias: aliasNew.trim() }),
      });
      const raw = await res.text();

      if (!res.ok) {
        let msg = "No se ha podido crear el paciente.";
        try {
          const errData = JSON.parse(raw);
          if (errData?.detail) msg = errData.detail;
        } catch {}
        setError(msg);
        return;
      }

      const data = JSON.parse(raw || "{}");
      setAliasNew("");
      pushToast("success", "Paciente creado.");
      // lo añadimos arriba (solo en activos)
      if (!showArchived) setPatients((prev) => [data, ...prev]);
      else {
        // si estamos viendo archivados, no toca mezclar: recargamos en background
        setShowArchived(false);
      }
    } catch (e) {
      console.error("❌ Error creando paciente:", e);
      setError("Error de conexión al crear paciente.");
    } finally {
      setCreating(false);
    }
  }

  async function handleRestore(id, alias) {
    setError("");
    const token = localStorage.getItem("galenos_token");
    if (!token) return;

    const ok = window.confirm(`¿Restaurar "${alias}"? Volverá a la lista de pacientes activos.`);
    if (!ok) return;

    try {
      const res = await fetch(`${API}/patients/${id}/unarchive`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const raw = await res.text();
      if (!res.ok) throw new Error(raw);
      pushToast("success", "Paciente restaurado.");
      loadPatients();
    } catch (e) {
      console.error("❌ Error restaurando:", e);
      setError("No se pudo restaurar el paciente.");
    }
  }

  const filtered = useMemo(() => {
    const term = (q || "").trim().toLowerCase();
    if (!term) return patients;

    return (patients || []).filter((p) => {
      const alias = (p?.alias || "").toString().toLowerCase();
      const pn = (p?.patient_number ?? "").toString().toLowerCase();
      const id = (p?.id ?? "").toString().toLowerCase();
      return alias.includes(term) || pn.includes(term) || id.includes(term);
    });
  }, [patients, q]);

  return (
    <main className="sr-container py-6 space-y-6">
      {/* Toast */}
      {toast?.msg && (
        <div className="fixed top-4 right-4 z-[60] max-w-[360px]">
          <div
            className={[
              "rounded-xl border shadow-sm px-4 py-3 text-sm",
              toast.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800",
            ].join(" ")}
          >
            {toast.msg}
          </div>
        </div>
      )}

      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Pacientes</h1>
        <p className="text-sm text-slate-600">
          Gestiona pacientes activos y archivados. Archivar conserva el historial; el borrado permanente solo se hace desde la ficha.
        </p>
      </header>

      {/* Segmented control + búsqueda + refrescar */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="inline-flex rounded-xl border border-slate-200 overflow-hidden w-fit">
            <button
              type="button"
              onClick={() => setShowArchived(false)}
              className={`px-4 py-2 text-sm ${!showArchived ? "bg-slate-900 text-white" : "bg-white text-slate-700 hover:bg-slate-50"}`}
            >
              Activos
            </button>
            <button
              type="button"
              onClick={() => setShowArchived(true)}
              className={`px-4 py-2 text-sm ${showArchived ? "bg-slate-900 text-white" : "bg-white text-slate-700 hover:bg-slate-50"}`}
            >
              Archivados
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              className="sr-input w-full md:w-[320px]"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por alias, nº paciente o ID…"
            />
            <button
              type="button"
              onClick={loadPatients}
              disabled={loading}
              className="sr-btn-secondary text-xs disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </div>

        {!showArchived && (
          <form onSubmit={handleCreatePatient} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              className="sr-input flex-1"
              value={aliasNew}
              onChange={(e) => setAliasNew(e.target.value)}
              placeholder="0001 - Nombre Apellidos"
            />
            <button
              type="submit"
              disabled={creating}
              className="sr-btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {creating ? "Creando..." : "Crear paciente"}
            </button>
          </form>
        )}

        {error && <p className="text-sm text-rose-700">{error}</p>}
      </section>

      {/* Tabla */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">
            {showArchived ? "Archivados" : "Listado de pacientes"}{" "}
            <span className="text-xs font-normal text-slate-500">({filtered.length})</span>
          </h2>
        </div>

        <div className="overflow-x-auto mt-2">
          <table className="min-w-full text-sm border border-slate-200 rounded-md overflow-hidden">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-2 py-1 text-left w-24">Nº</th>
                <th className="px-2 py-1 text-left">Alias</th>
                <th className="px-2 py-1 text-left w-40">Creado</th>
                <th className="px-2 py-1 text-left w-28">ID</th>
                <th className="px-2 py-1 text-left w-32">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-2 py-3 text-center text-slate-500">
                    {q.trim()
                      ? "No hay resultados para esa búsqueda."
                      : (showArchived ? "No hay pacientes archivados." : "Aún no hay pacientes dados de alta.")}
                  </td>
                </tr>
              )}

              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-slate-200">
                  <td className="px-2 py-1 font-mono">{p.patient_number ?? p.id}</td>
                  <td className="px-2 py-1">{p.alias}</td>
                  <td className="px-2 py-1 text-xs text-slate-500">
                    {p.created_at ? new Date(p.created_at).toLocaleString("es-ES") : ""}
                  </td>
                  <td className="px-2 py-1 text-xs text-slate-700">
                    <span className="font-mono">{p.id}</span>
                  </td>
                  <td className="px-2 py-1">
                    {!showArchived ? (
                      <Link
                        to={`/PacienteDetalle/${p.id}`}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium underline"
                      >
                        Ver ficha
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRestore(p.id, p.alias)}
                        className="text-emerald-700 hover:text-emerald-900 text-xs font-medium underline"
                      >
                        Restaurar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-500">
          Consejo: usa <b>Archivar</b> para ocultar sin perder historial. El borrado permanente se hace solo desde la ficha del paciente.
        </p>
      </section>
    </main>
  );
}
