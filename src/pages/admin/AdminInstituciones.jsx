// src/pages/admin/AdminInstituciones.jsx — Gestión de solicitudes institucionales
import React, { useEffect, useState } from "react";
import Seo from "../../components/Seo.jsx";
import { useNavigate } from "react-router-dom";

const LS_ADMIN_KEY = "mediazion_admin_auth";

export default function AdminInstituciones() {
  const nav = useNavigate();

  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [seleccionada, setSeleccionada] = useState(null);
  const [formUsuario, setFormUsuario] = useState({
    password: "",
    meses: 6,
    creado_por: "admin@mediazion.eu",
  });

  async function cargarSolicitudes() {
    setLoading(true);
    setMsg("");
    try {
      const resp = await fetch("/api/instituciones/admin/solicitudes");
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data?.ok) {
        throw new Error(data?.detail || data?.message || "No se pudo cargar la lista.");
      }
      setSolicitudes(data.items || []);
    } catch (e) {
      setMsg(e.message || "Error cargando solicitudes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Protección básica: sólo admin logueado puede ver esto
    const token = localStorage.getItem(LS_ADMIN_KEY);
    if (token !== "ok") {
      nav("/admin", { replace: true });
      return;
    }
    // Si está logueado, cargamos la lista
    cargarSolicitudes();
  }, [nav]);

  async function verDetalle(id) {
    setMsg("");
    try {
      const resp = await fetch(`/api/instituciones/admin/solicitudes/${id}`);
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data?.ok) {
        throw new Error(data?.detail || data?.message || "No se pudo cargar el detalle.");
      }
      setSeleccionada(data.item);
      // Reset form usuario
      setFormUsuario({
        password: "",
        meses: 6,
        creado_por: "admin@mediazion.eu",
      });
    } catch (e) {
      setMsg(e.message || "Error cargando detalle.");
    }
  }

  async function cambiarEstado(id, estado) {
    setMsg("");
    try {
      const resp = await fetch(`/api/instituciones/admin/solicitudes/${id}/estado`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data?.ok) {
        throw new Error(data?.detail || data?.message || "No se pudo actualizar el estado.");
      }
      setMsg(`Estado actualizado a "${estado}".`);
      cargarSolicitudes();
      if (seleccionada && seleccionada.id === id) {
        setSeleccionada({ ...seleccionada, estado });
      }
    } catch (e) {
      setMsg(e.message || "Error actualizando estado.");
    }
  }

  async function crearUsuarioDesdeSolicitud(e) {
    e.preventDefault();
    if (!seleccionada) return;
    if (!formUsuario.password) {
      setMsg("Introduce una contraseña temporal para la institución.");
      return;
    }

    setMsg("");
    try {
      const resp = await fetch("/api/instituciones/admin/crear_usuario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          solicitud_id: seleccionada.id,
          password: formUsuario.password,
          meses: formUsuario.meses,
          creado_por: formUsuario.creado_por,
        }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data?.ok) {
        throw new Error(
          data?.detail || data?.message || "No se pudo crear el usuario institucional."
        );
      }
      setMsg(
        `Usuario institucional creado para ${data.institucion} (${data.email}). Expira en ${new Date(
          data.fecha_expiracion
        ).toLocaleDateString("es-ES")}.`
      );
      // Recargar lista
      cargarSolicitudes();
      // Marcar la solicitud como aprobada localmente
      setSeleccionada({ ...seleccionada, estado: "aprobada" });
      // Limpiar password
      setFormUsuario({ ...formUsuario, password: "" });
    } catch (e) {
      setMsg(e.message || "Error creando usuario institucional.");
    }
  }

  function onChangeFormUsuario(e) {
    const { name, value } = e.target;
    setFormUsuario((prev) => ({
      ...prev,
      [name]: name === "meses" ? Number(value) : value,
    }));
  }

  return (
    <>
      <Seo
        title="Admin · Instituciones · Mediazion"
        description="Gestión de solicitudes institucionales (Ayuntamientos, Cámaras, Colegios)."
      />
      <main
        className="sr-container py-8"
        style={{ minHeight: "calc(100vh - 160px)" }}
      >
        <h1 className="sr-h1 mb-4">Solicitudes de instituciones</h1>
        <p className="sr-p mb-4">
          Desde aquí puedes ver las solicitudes de Ayuntamientos, Cámaras de Comercio
          y Colegios Profesionales, cambiar su estado y crear usuarios institucionales.
        </p>

        {msg && (
          <div
            className="sr-card mb-4"
            style={{ color: msg.includes("Error") ? "#991b1b" : "#166534" }}
          >
            <p className="sr-small">{msg}</p>
          </div>
        )}

        <section className="sr-card mb-6">
          <h2 className="sr-h2 mb-2">Listado de solicitudes</h2>
          {loading ? (
            <p className="sr-p">Cargando solicitudes…</p>
          ) : solicitudes.length === 0 ? (
            <p className="sr-p">No hay solicitudes registradas.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}
              >
                <thead>
                  <tr style={{ borderBottom: "1px solid #e5e7eb", textAlign: "left" }}>
                    <th style={{ padding: 8 }}>ID</th>
                    <th style={{ padding: 8 }}>Tipo</th>
                    <th style={{ padding: 8 }}>Institución</th>
                    <th style={{ padding: 8 }}>Nombre</th>
                    <th style={{ padding: 8 }}>Email</th>
                    <th style={{ padding: 8 }}>Provincia</th>
                    <th style={{ padding: 8 }}>Estado</th>
                    <th style={{ padding: 8 }}>Fecha</th>
                    <th style={{ padding: 8 }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudes.map((s) => (
                    <tr
                      key={s.id}
                      style={{
                        borderBottom: "1px solid #e5e7eb",
                        background:
                          seleccionada && seleccionada.id === s.id
                            ? "rgba(219,234,254,0.4)"
                            : "transparent",
                      }}
                    >
                      <td style={{ padding: 8 }}>{s.id}</td>
                      <td style={{ padding: 8 }}>{s.tipo}</td>
                      <td style={{ padding: 8 }}>{s.institucion}</td>
                      <td style={{ padding: 8 }}>{s.nombre}</td>
                      <td style={{ padding: 8 }}>{s.email}</td>
                      <td style={{ padding: 8 }}>{s.provincia || "—"}</td>
                      <td style={{ padding: 8 }}>{s.estado}</td>
                      <td style={{ padding: 8 }}>
                        {s.created_at
                          ? new Date(s.created_at).toLocaleString("es-ES")
                          : "—"}
                      </td>
                      <td style={{ padding: 8 }}>
                        <button
                          type="button"
                          className="sr-btn-secondary"
                          style={{ padding: "4px 8px", fontSize: 12 }}
                          onClick={() => verDetalle(s.id)}
                        >
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {seleccionada && (
          <section className="sr-card">
            <h2 className="sr-h2 mb-2">
              Detalle de solicitud #{seleccionada.id}
            </h2>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="sr-small">
                  <b>Tipo:</b> {seleccionada.tipo}
                </p>
                <p className="sr-small">
                  <b>Institución:</b> {seleccionada.institucion}
                </p>
                <p className="sr-small">
                  <b>Cargo:</b> {seleccionada.cargo}
                </p>
                <p className="sr-small">
                  <b>Nombre:</b> {seleccionada.nombre}
                </p>
                <p className="sr-small">
                  <b>Email:</b> {seleccionada.email}
                </p>
                <p className="sr-small">
                  <b>Teléfono:</b> {seleccionada.telefono || "—"}
                </p>
                <p className="sr-small">
                  <b>Provincia:</b> {seleccionada.provincia || "—"}
                </p>
              </div>
              <div>
                <p className="sr-small">
                  <b>Estado:</b> {seleccionada.estado}
                </p>
                <p className="sr-small">
                  <b>Fecha solicitud:</b>{" "}
                  {seleccionada.created_at
                    ? new Date(seleccionada.created_at).toLocaleString("es-ES")
                    : "—"}
                </p>
              </div>
            </div>
            <div className="mb-4">
              <p className="sr-label">Comentarios</p>
              <p className="sr-p">
                {seleccionada.comentarios && seleccionada.comentarios.trim()
                  ? seleccionada.comentarios
                  : "—"}
              </p>
            </div>

            {/* Cambiar estado */}
            <div className="mb-4 flex flex-wrap gap-3">
              <span className="sr-small mr-2">Cambiar estado a:</span>
              <button
                type="button"
                className="sr-btn-secondary"
                onClick={() => cambiarEstado(seleccionada.id, "pendiente")}
              >
                pendiente
              </button>
              <button
                type="button"
                className="sr-btn-secondary"
                onClick={() => cambiarEstado(seleccionada.id, "aprobada")}
              >
                aprobada
              </button>
              <button
                type="button"
                className="sr-btn-secondary"
                onClick={() => cambiarEstado(seleccionada.id, "rechazada")}
              >
                rechazada
              </button>
            </div>

            {/* Alta de usuario institucional */}
            <div className="mt-4 pt-4 border-t border-zinc-200">
              <h3 className="sr-h3 mb-2">Crear usuario institucional</h3>
              <p className="sr-small mb-3">
                Esto creará un usuario institucional para{" "}
                <b>{seleccionada.institucion}</b> y enviará las credenciales al
                email <b>{seleccionada.email}</b>.
              </p>
              <form
                onSubmit={crearUsuarioDesdeSolicitud}
                className="grid md:grid-cols-3 gap-3 items-end"
              >
                <div>
                  <label className="sr-label">Contraseña temporal</label>
                  <input
                    type="text"
                    name="password"
                    className="sr-input"
                    value={formUsuario.password}
                    onChange={onChangeFormUsuario}
                    placeholder="Ej. Ayto2025!"
                  />
                </div>
                <div>
                  <label className="sr-label">Duración (meses)</label>
                  <select
                    name="meses"
                    className="sr-input"
                    value={formUsuario.meses}
                    onChange={onChangeFormUsuario}
                  >
                    <option value={6}>6 meses</option>
                    <option value={12}>12 meses</option>
                  </select>
                </div>
                <div>
                  <label className="sr-label">Creado por</label>
                  <input
                    type="email"
                    name="creado_por"
                    className="sr-input"
                    value={formUsuario.creado_por}
                    onChange={onChangeFormUsuario}
                  />
                </div>
                <div className="md:col-span-3">
                  <button type="submit" className="sr-btn-primary mt-2">
                    Crear usuario institucional y enviar credenciales
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
