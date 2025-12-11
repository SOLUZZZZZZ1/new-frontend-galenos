// src/pages/Patients.jsx — listado de pacientes Galenos.pro
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API =
  import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPatients() {
      const token = localStorage.getItem("galenos_token");
      if (!token) {
        setError("No hay sesión activa.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API}/patients`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const raw = await res.text();
        console.log("👉 [Patients] /patients (raw):", raw);

        if (!res.ok) {
          let msg = "No se ha podido cargar la lista de pacientes.";
          try {
            const err = JSON.parse(raw);
            if (err.detail) msg = err.detail;
          } catch {}
          setError(msg);
          return;
        }

        let data = [];
        try {
          data = JSON.parse(raw);
        } catch {
          setError("Respuesta inesperada del servidor.");
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

    loadPatients();
  }, []);

  if (loading) {
    return (
      <main className="sr-container py-6">
        <p className="text-sm text-slate-600">Cargando pacientes…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="sr-container py-6">
        <p className="text-sm text-red-600">{error}</p>
      </main>
    );
  }

  return (
    <main className="sr-container py-6 space-y-4">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Pacientes</h1>
          <p className="text-sm text-slate-600">
            Pacientes vinculados a tu usuario. El número clínico es local para
            cada médico. El ID interno es el identificador técnico que usa el
            sistema por debajo.
          </p>
        </div>
      </header>

      {patients.length === 0 ? (
        <p className="text-sm text-slate-600">
          Aún no tienes pacientes creados. Crea al menos uno desde Panel
          Médico o desde la opción correspondiente cuando esté disponible.
        </p>
      ) : (
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs md:text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-2 py-1 text-left">Nº Paciente</th>
                  <th className="px-2 py-1 text-left">Alias</th>
                  <th className="px-2 py-1 text-left">Fecha alta</th>
                  <th className="px-2 py-1 text-left">ID interno</th>
                  <th className="px-2 py-1 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.id} className="border-t border-slate-200">
                    <td className="px-2 py-1 font-mono">
                      {/* Nº clínico por médico */}
                      {p.patient_number ?? p.id}
                    </td>
                    <td className="px-2 py-1">{p.alias}</td>
                    <td className="px-2 py-1 text-slate-500">
                      {p.created_at
                        ? new Date(p.created_at).toLocaleString("es-ES")
                        : ""}
                    </td>
                    <td className="px-2 py-1 text-slate-500">
                      {/* ID interno de BD */}
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
      )}
    </main>
  );
}
