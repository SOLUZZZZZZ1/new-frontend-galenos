// src/pages/Patients.jsx — listado de pacientes Galenos.pro
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

  async function loadPatients() {
    setError("");
    const token = localStorage.getItem("galenos_token");
    if (!token) {
      setError("No hay sesión activa. Vuelve a iniciar sesión.");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API}/patients`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const raw = await res.text();
      console.log("👉 [Patients] /patients (raw):", raw);
      if (!res.ok) {
        let msg = "No se han podido cargar los pacientes.";
        try {
          const errData = JSON.parse(raw);
          if (errData.detail) msg = errData.detail;
        } catch {}
        setError(msg);
        return;
      }
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        setError("Respuesta inesperada al listar pacientes.");
        return;
      }
      setPatients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Error cargando pacientes:", err);
      setError("Error de conexión al cargar pacientes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPatients();
  }, []);

  async function handleCreatePatient(e) {
    e.preventDefault();
    setError("");
    if (!aliasNew.trim()) {
      setError(
        "Introduce un alias para el paciente (ej. 0001 - Nombre Apellidos)."
      );
      return;
    }
    const token = localStorage.getItem("galenos_token");
    if (!token) {
      setError("No hay sesión activa. Vuelve a iniciar sesión.");
      return;
    }
    try {
      setCreating(true);
      const body = { alias: aliasNew.trim() };
      const res = await fetch(`${API}/patients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const raw = await res.text();
      console.log("👉 [Patients] POST /patients (raw):", raw);
      if (!res.ok) {
        let msg = "No se ha podido crear el paciente.";
        try {
          const errData = JSON.parse(raw);
          if (errData.detail) msg = errData.detail;
        } catch {}
        setError(msg);
        return;
      }
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        setError("Respuesta inesperada al crear paciente.");
        return;
      }
      setAliasNew("");
      setPatients((prev) => [data, ...prev]);
    } catch (err) {
      console.error("❌ Error creando paciente:", err);
      setError("Error de conexión al crear paciente.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="sr-container py-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Pacientes</h1>
        <p className="text-sm text-slate-600">
          Aquí puedes dar de alta rápidamente pacientes (código + nombre) y ver
          su número clínico e ID interno. Usa el número clínico en tu trabajo
          diario y el ID interno solo cuando lo necesites para soporte técnico
          o para vincular analíticas/imágenes mientras terminamos de pulir el
          flujo.
        </p>
      </header>

      {/* Alta rápida */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-3">
        <h2 className="text-lg font-semibold">Alta rápida de paciente</h2>
        <p className="text-sm text-slate-600">
          Ejemplo de alias:{" "}
          <code className="font-mono">
            0001 - Pedro López Sierra
          </code>
          . Este alias es lo que verás en los listados y timeline.
        </p>
        <form
          onSubmit={handleCreatePatient}
          className="flex flex-col sm:flex-row gap-2 mt-2"
        >
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
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      </section>

      {/* Listado */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Listado de pacientes</h2>
          <button
            type="button"
            onClick={loadPatients}
            disabled={loading}
            className="sr-btn-secondary disabled:opacity-60 disabled:cursor-not-allowed text-xs"
          >
            {loading ? "Actualizando..." : "Actualizar"}
          </button>
        </div>
        <p className="text-sm text-slate-600">
          Usa la columna <strong>Nº Paciente</strong> como número clínico
          local. El <strong>ID interno</strong> es el identificador técnico que
          hoy usa el sistema para las analíticas, imágenes, notas y timeline.
        </p>

        <div className="overflow-x-auto mt-2">
          <table className="min-w-full text-sm border border-slate-200 rounded-md overflow-hidden">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-2 py-1 text-left w-24">Nº Paciente</th>
                <th className="px-2 py-1 text-left">Alias</th>
                <th className="px-2 py-1 text-left w-40">Creado</th>
                <th className="px-2 py-1 text-left w-32">ID interno</th>
                <th className="px-2 py-1 text-left w-24">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {patients.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-2 py-3 text-center text-slate-500"
                  >
                    Aún no hay pacientes dados de alta.
                  </td>
                </tr>
              )}

              {patients.map((p) => (
                <tr key={p.id} className="border-t border-slate-200">
                  <td className="px-2 py-1 font-mono">
                    {p.patient_number ?? p.id}
                  </td>
                  <td className="px-2 py-1">{p.alias}</td>
                  <td className="px-2 py-1 text-xs text-slate-500">
                    {p.created_at
                      ? new Date(p.created_at).toLocaleString("es-ES")
                      : ""}
                  </td>
                  <td className="px-2 py-1 text-xs text-slate-700">
                    <span className="font-mono">{p.id}</span>
                  </td>
                  <td className="px-2 py-1">
                    <Link
                      to={`/PacienteDetalle/${p.id}`}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium underline"
                    >
                      Ver ficha
                    </Link>
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
