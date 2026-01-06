// src/pages/Patients.jsx — listado de pacientes Galenos.pro (con archivado)
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API =
  import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aliasNew, setAliasNew] = useState("");
  const [creating, setCreating] = useState(false);

  // 🔁 Vista: activos / archivados
  const [showArchived, setShowArchived] = useState(false);

  async function loadPatients() {
    setError("");
    const token = localStorage.getItem("galenos_token");
    if (!token) {
      setError("No hay sesión activa. Vuelve a iniciar sesión.");
      return;
    }
    try {
      setLoading(true);
      const url = showArchived
        ? `${API}/patients?archived_only=true`
        : `${API}/patients`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const raw = await res.text();
      if (!res.ok) {
        let msg = "No se han podido cargar los pacientes.";
        try {
          const errData = JSON.parse(raw);
          if (errData.detail) msg = errData.detail;
        } catch {}
        setError(msg);
        return;
      }
      const data = JSON.parse(raw || "[]");
      setPatients(Array.isArray(data) ? data : []);
    } catch (err) {
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
    if (!aliasNew.trim()) {
      setError("Introduce un alias para el paciente.");
      return;
    }
    const token = localStorage.getItem("galenos_token");
    if (!token) return;

    try {
      setCreating(true);
      const res = await fetch(`${API}/patients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ alias: aliasNew.trim() }),
      });
      const raw = await res.text();
      if (!res.ok) throw new Error(raw);
      const data = JSON.parse(raw);
      setAliasNew("");
      setPatients((prev) => [data, ...prev]);
    } catch {
      setError("No se ha podido crear el paciente.");
    } finally {
      setCreating(false);
    }
  }

  async function handleRestorePatient(id) {
    const token = localStorage.getItem("galenos_token");
    if (!token) return;

    if (!window.confirm("¿Restaurar este paciente? Volverá a la lista activa.")) return;

    try {
      await fetch(`${API}/patients/${id}/unarchive`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      loadPatients();
    } catch {
      alert("No se pudo restaurar el paciente.");
    }
  }

  return (
    <main className="sr-container py-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Pacientes</h1>
        <p className="text-sm text-slate-600">
          Gestión de pacientes activos y archivados.
        </p>
      </header>

      {/* Toggle Activos / Archivados */}
      <div className="flex gap-2">
        <button
          className={`sr-btn-secondary text-xs ${!showArchived ? "bg-slate-200" : ""}`}
          onClick={() => setShowArchived(false)}
        >
          Pacientes activos
        </button>
        <button
          className={`sr-btn-secondary text-xs ${showArchived ? "bg-slate-200" : ""}`}
          onClick={() => setShowArchived(true)}
        >
          Archivados
        </button>
      </div>

      {!showArchived && (
        <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <h2 className="text-lg font-semibold">Alta rápida de paciente</h2>
          <form onSubmit={handleCreatePatient} className="flex gap-2">
            <input
              className="sr-input flex-1"
              value={aliasNew}
              onChange={(e) => setAliasNew(e.target.value)}
              placeholder="0001 - Nombre Apellidos"
            />
            <button
              type="submit"
              disabled={creating}
              className="sr-btn-primary text-xs"
            >
              {creating ? "Creando..." : "Crear"}
            </button>
          </form>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </section>
      )}

      <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
        <h2 className="text-lg font-semibold">
          {showArchived ? "Pacientes archivados" : "Listado de pacientes"}
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-slate-200 rounded-md">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-2 py-1 text-left">Nº</th>
                <th className="px-2 py-1 text-left">Alias</th>
                <th className="px-2 py-1 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {patients.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-2 py-3 text-center text-slate-500">
                    No hay pacientes.
                  </td>
                </tr>
              )}
              {patients.map((p) => (
                <tr key={p.id} className="border-t border-slate-200">
                  <td className="px-2 py-1 font-mono">{p.patient_number ?? p.id}</td>
                  <td className="px-2 py-1">{p.alias}</td>
                  <td className="px-2 py-1 flex gap-2">
                    {!showArchived && (
                      <Link
                        to={`/PacienteDetalle/${p.id}`}
                        className="text-blue-600 text-xs underline"
                      >
                        Ver ficha
                      </Link>
                    )}
                    {showArchived && (
                      <button
                        onClick={() => handleRestorePatient(p.id)}
                        className="text-emerald-700 text-xs underline"
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
      </section>
    </main>
  );
}
