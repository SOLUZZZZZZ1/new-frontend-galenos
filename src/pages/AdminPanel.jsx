// src/pages/AdminPanel.jsx — Panel admin con listado de médicos · Galenos.pro
import React, { useEffect, useState } from "react";

const API =
  import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

export default function AdminPanel() {
  const email = localStorage.getItem("galenos_email") || "";
  const token = localStorage.getItem("galenos_token") || "";
  const isMaster = email === "soluzziona@gmail.com";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    async function loadDoctors() {
      if (!isMaster) {
        setLoading(false);
        return;
      }
      if (!token) {
        setError("No hay token de sesión. Inicia sesión como usuario maestro.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API}/admin/doctors`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const raw = await res.text();
        console.log("👉 [AdminPanel] /admin/doctors (raw):", raw);

        if (!res.ok) {
          let msg = "No se pudieron cargar los médicos.";
          try {
            const data = JSON.parse(raw);
            if (data.detail) msg = data.detail;
          } catch {}
          setError(msg);
          setLoading(false);
          return;
        }

        let data;
        try {
          data = JSON.parse(raw);
        } catch {
          data = { items: [] };
        }

        setDoctors(Array.isArray(data.items) ? data.items : []);
        setLoading(false);
      } catch (err) {
        console.error("❌ [AdminPanel] Error cargando médicos:", err);
        setError("Error de conexión al cargar el listado de médicos.");
        setLoading(false);
      }
    }

    loadDoctors();
  }, [isMaster, token]);

  if (!isMaster) {
    return (
      <main className="sr-container py-8">
        <section className="sr-card max-w-xl mx-auto space-y-3">
          <h1 className="sr-h1 text-2xl">Panel administrador</h1>
          <p className="sr-p text-sm text-slate-600">
            Este espacio está reservado para el usuario maestro de Galenos.pro.
          </p>
          <p className="sr-small text-slate-500">
            Has accedido con: <b>{email || "desconocido"}</b>.
          </p>
        </section>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="sr-container py-8">
        <section className="sr-card max-w-xl mx-auto space-y-3">
          <h1 className="sr-h1 text-2xl">Panel administrador</h1>
          <p className="sr-p text-sm text-slate-600">
            Cargando listado de médicos…
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="sr-container py-8 space-y-6">
      <section className="sr-card max-w-xl mx-auto space-y-3">
        <h1 className="sr-h1 text-2xl">Panel administrador</h1>
        <p className="sr-p text-sm text-slate-600">
          Estás dentro como usuario maestro (<b>{email}</b>).
        </p>
        <p className="sr-small text-slate-500">
          Esta vista muestra todos los médicos registrados en Galenos.pro, con
          su perfil médico si está creado.
        </p>
        {error && (
          <p className="sr-small text-red-600 mt-2">
            {error}
          </p>
        )}
      </section>

      <section className="sr-card space-y-3">
        <h2 className="sr-h2 text-lg">Médicos en la plataforma</h2>
        {doctors.length === 0 ? (
          <p className="sr-small text-slate-500">
            Todavía no hay médicos registrados en la plataforma.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-2 py-1 text-left">ID</th>
                  <th className="px-2 py-1 text-left">Email</th>
                  <th className="px-2 py-1 text-left">Alta</th>
                  <th className="px-2 py-1 text-left">Perfil</th>
                  <th className="px-2 py-1 text-left">Nombre</th>
                  <th className="px-2 py-1 text-left">Especialidad</th>
                  <th className="px-2 py-1 text-left">Colegiado</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((d) => (
                  <tr
                    key={d.user_id}
                    className="border-t border-slate-200 hover:bg-slate-50"
                  >
                    <td className="px-2 py-1 align-top">
                      <span className="font-mono">{d.user_id}</span>
                    </td>
                    <td className="px-2 py-1 align-top">
                      <span className="text-slate-800">{d.email}</span>
                    </td>
                    <td className="px-2 py-1 align-top text-slate-500">
                      {d.created_at
                        ? new Date(d.created_at).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-2 py-1 align-top">
                      {d.has_profile ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Perfil creado
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-200">
                          Sin perfil
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-1 align-top text-slate-700">
                      {d.first_name || d.last_name
                        ? `${d.first_name || ""} ${d.last_name || ""}`.trim()
                        : "-"}
                    </td>
                    <td className="px-2 py-1 align-top text-slate-700">
                      {d.specialty || "-"}
                    </td>
                    <td className="px-2 py-1 align-top text-slate-700">
                      {d.colegiado_number || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
