// src/pages/RegistroInstitucion.jsx — Registro de Instituciones
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../components/Seo.jsx";

export default function RegistroInstitucion() {
  const nav = useNavigate();

  const [form, setForm] = useState({
    tipo: "",
    institucion: "",
    cargo: "",
    nombre: "",
    email: "",
    telefono: "",
    provincia: "",
    comentarios: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Validación mínima
    if (!form.tipo || !form.institucion || !form.nombre || !form.cargo || !form.email) {
      setError("Todos los campos obligatorios deben rellenarse.");
      return;
    }

    try {
      setLoading(true);

      const resp = await fetch("/api/instituciones/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!resp.ok) throw new Error("Error enviando datos.");

      nav("/instituciones/registro/ok");
    } catch (e) {
      setError(e.message || "Error enviando el formulario.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Seo title="Registro Institucional · Mediazion" />

      <main className="sr-container py-12" style={{ maxWidth: 700 }}>
        <h1 className="sr-h1 mb-6">Registro Institucional</h1>

        {error && (
          <div className="sr-card mb-4" style={{ color: "#991b1b" }}>
            <p className="sr-small">❌ {error}</p>
          </div>
        )}

        <form className="sr-card p-6 grid gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="sr-label">Tipo de institución *</label>
            <select name="tipo" value={form.tipo} onChange={update} className="sr-input">
              <option value="">Selecciona…</option>
              <option value="ayuntamiento">Ayuntamiento</option>
              <option value="camara">Cámara de Comercio</option>
              <option value="colegio">Colegio Profesional</option>
              <option value="otra">Otra</option>
            </select>
          </div>

          <div>
            <label className="sr-label">Nombre de la institución *</label>
            <input
              name="institucion"
              className="sr-input"
              value={form.institucion}
              onChange={update}
            />
          </div>

          <div>
            <label className="sr-label">Cargo de la persona *</label>
            <input
              name="cargo"
              className="sr-input"
              value={form.cargo}
              onChange={update}
            />
          </div>

          <div>
            <label className="sr-label">Nombre y apellidos *</label>
            <input
              name="nombre"
              className="sr-input"
              value={form.nombre}
              onChange={update}
            />
          </div>

          <div>
            <label className="sr-label">Email institucional *</label>
            <input
              type="email"
              name="email"
              className="sr-input"
              value={form.email}
              onChange={update}
            />
          </div>

          <div>
            <label className="sr-label">Teléfono</label>
            <input
              name="telefono"
              className="sr-input"
              value={form.telefono}
              onChange={update}
            />
          </div>

          <div>
            <label className="sr-label">Provincia</label>
            <input
              name="provincia"
              className="sr-input"
              value={form.provincia}
              onChange={update}
            />
          </div>

          <div>
            <label className="sr-label">Comentarios</label>
            <textarea
              name="comentarios"
              className="sr-input"
              value={form.comentarios}
              onChange={update}
            />
          </div>

          <button className="sr-btn-primary" disabled={loading}>
            {loading ? "Enviando…" : "Enviar solicitud"}
          </button>
        </form>
      </main>
    </>
  );
}
