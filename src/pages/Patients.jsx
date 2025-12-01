import React, { useEffect, useState } from "react";

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
      setError("Introduce un alias para el paciente (ej. 0001 - Nombre Apellidos).");
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
          Aquí puedes dar de alta rápidamente pacientes (código + nombre) y ver sus IDs.
          Usa esos IDs en el panel para vincular analíticas e imágenes.
        </p>
      </header>

      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-3">
        <h2 className="text-lg font-semibold">Alta rápida de paciente</h2>
        <p className="text-sm text-slate-600">
          Ejemplo de alias: <code>0001 - Pedro López Sierra</code>. Este alias es lo que verás en los listados y timeline.
        </p>
        <form onSubmit={handleCreatePatient} className="flex flex-col sm:flex-row gap-2 mt-2">
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

      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Listado de pacientes</h2>
          <button
            type="button"
            onClick={loadPatients}
            disabled={loading}
            className="sr-btn-secondary disab
