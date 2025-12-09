// src/pages/PerfilMedico.jsx — Perfil médico con alias clínico (De guardia) · Galenos.pro
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API =
  import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

export default function PerfilMedico() {
  const navigate = useNavigate();

  const token = localStorage.getItem("galenos_token") || "";
  const emailLs = localStorage.getItem("galenos_email") || "";
  const nameLs = localStorage.getItem("galenos_name") || "";
  const specialtyLs = localStorage.getItem("galenos_specialty") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Perfil médico real desde BBDD
  const [profile, setProfile] = useState(null);

  // Formulario creación
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [specialty, setSpecialty] = useState(specialtyLs || "");
  const [colegiadoNumber, setColegiadoNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [center, setCenter] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [guardAlias, setGuardAlias] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveInfo, setSaveInfo] = useState("");

  // ========================================================
  // LOAD PROFILE
  // ========================================================
  useEffect(() => {
    async function loadProfile() {
      setLoading(true);

      if (!token) {
        setError("No hay sesión activa. Inicia sesión para ver tu perfil.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API}/doctor/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const raw = await res.text();
        console.log("👉 [Perfil] /doctor/profile/me (raw):", raw);

        if (res.status === 404) {
          // Perfil NO existe todavía
          setProfile(null);
          setLoading(false);

          if (nameLs) {
            const parts = nameLs.split(" ");
            setFirstName(parts[0]);
            setLastName(parts.slice(1).join(" "));
          }
          return;
        }

        if (!res.ok) {
          setError("No se pudo cargar el perfil médico.");
          setLoading(false);
          return;
        }

        const data = JSON.parse(raw);
        setProfile(data);

        if (data.guard_alias) {
          localStorage.setItem("galenos_guard_alias", data.guard_alias);
        }

        setLoading(false);
      } catch (err) {
        console.error("❌ Error cargando perfil:", err);
        setError("No se pudo conectar con el servidor.");
        setLoading(false);
      }
    }

    loadProfile();
  }, [token, nameLs]);

  // ========================================================
  // CREATE PROFILE
  // ========================================================
  async function handleCreateProfile(e) {
    e.preventDefault();
    setSaveError("");
    setSaveInfo("");

    const aliasClean = guardAlias.trim();

    if (!aliasClean) {
      setSaveError("El alias clínico (De guardia) es obligatorio.");
      return;
    }
    if (aliasClean.length < 3 || aliasClean.length > 40) {
      setSaveError("El alias clínico debe tener entre 3 y 40 caracteres.");
      return;
    }

    const payload = {
      first_name: firstName.trim() || null,
      last_name: lastName.trim() || null,
      specialty: specialty.trim() || null,
      colegiado_number: colegiadoNumber.trim() || null,
      phone: phone.trim() || null,
      center: center.trim() || null,
      city: city.trim() || null,
      bio: bio.trim() || null,
    };

    try {
      setSaving(true);
      console.log("🩺 [Perfil] POST /doctor/profile/me");

      // 1) Crear perfil médico
      const res = await fetch(`${API}/doctor/profile/me`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const raw = await res.text();
      console.log("👉 [Perfil] POST /doctor/profile/me (raw):", raw);

      if (!res.ok) {
        let msg = "No se pudo crear el perfil médico.";
        try {
          const errData = JSON.parse(raw);
          if (errData.detail) msg = errData.detail;
        } catch {}
        setSaveError(msg);
        return;
      }

      const data = JSON.parse(raw);
      setProfile(data);

      // 2) Fijar alias clínico
      console.log("🩺 [Perfil] POST /doctor/profile/guard-alias");
      const resAlias = await fetch(`${API}/doctor/profile/guard-alias`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ guard_alias: aliasClean }),
      });

      const rawAlias = await resAlias.text();
      console.log("👉 [Perfil] POST /doctor/profile/guard-alias (raw):", rawAlias);

      if (!resAlias.ok) {
        let msg = "Perfil creado, pero no se pudo fijar el alias clínico.";
        try {
          const errData = JSON.parse(rawAlias);
          if (errData.detail) msg = errData.detail;
        } catch {}
        setSaveError(msg);
        return;
      }

      let aliasData;
      try {
        aliasData = JSON.parse(rawAlias);
      } catch {
        aliasData = null;
      }

      const finalAlias = aliasData?.guard_alias || aliasClean;
      localStorage.setItem("galenos_guard_alias", finalAlias);
      setSaveInfo("Perfil médico y alias clínico creados correctamente.");
    } catch (err) {
      console.error("❌ Error creando perfil:", err);
      setSaveError("No se pudo conectar con el servidor.");
    } finally {
      setSaving(false);
    }
  }

  // ========================================================
  // RENDER
  // ========================================================
  if (loading) {
    return (
      <main className="sr-container py-8">
        <p>Cargando tu perfil...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="sr-container py-8">
        <h1>Perfil del médico</h1>
        <p className="text-red-600">{error}</p>
      </main>
    );
  }

  // ----------------------------------------
  // PERFIL YA EXISTE → MODO SOLO LECTURA
  // ----------------------------------------
  if (profile) {
    return (
      <main className="sr-container py-8 space-y-6 max-w-xl">
        <h1 className="text-2xl font-semibold">Perfil del médico</h1>

        <section className="bg-white p-6 rounded-xl border space-y-4">
          <h2 className="text-lg font-semibold">Datos profesionales</h2>

          <p>
            <b>Nombre:</b> {profile.first_name} {profile.last_name}
          </p>
          <p>
            <b>Email:</b> {emailLs}
          </p>
          <p>
            <b>Especialidad:</b> {profile.specialty || "No indicada"}
          </p>

          <p>
            <b>Alias clínico (De guardia):</b>{" "}
            {profile.guard_alias || "No definido"}
          </p>
          <p className="text-xs text-slate-500">
            Este alias es tu marca profesional dentro de De guardia. Piensa bien
            el alias: una vez fijado no puede modificarse para proteger la
            coherencia de tu identidad en Galenos.
          </p>

          {profile.colegiado_number && (
            <p>
              <b>Colegiado:</b> {profile.colegiado_number}
            </p>
          )}
          {profile.phone && (
            <p>
              <b>Teléfono:</b> {profile.phone}
            </p>
          )}
          {profile.center && (
            <p>
              <b>Centro:</b> {profile.center}
            </p>
          )}
          {profile.city && (
            <p>
              <b>Ciudad:</b> {profile.city}
            </p>
          )}
          {profile.bio && (
            <p>
              <b>Descripción:</b>
              <br />
              {profile.bio}
            </p>
          )}
        </section>

        <button
          className="sr-btn-secondary"
          onClick={() => navigate("/dashboard")}
        >
          Volver al panel
        </button>
      </main>
    );
  }

  // ----------------------------------------
  // FORMULARIO CREACIÓN PERFIL (UNA VEZ)
  // ----------------------------------------
  return (
    <main className="sr-container py-8 max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">Completa tu perfil médico</h1>

      <section className="bg-white p-6 rounded-xl border space-y-4">
        <form onSubmit={handleCreateProfile} className="space-y-4">
          {/* Alias clínico (De guardia) */}
          <div>
            <label className="sr-label">
              Alias clínico (De guardia) <span className="text-red-600">*</span>
            </label>
            <input
              className="sr-input"
              value={guardAlias}
              onChange={(e) => setGuardAlias(e.target.value)}
              placeholder="Ej. ramoncito, cardio_md, derma_sur..."
            />
            <p className="text-xs text-slate-500 mt-1">
              Este alias será tu “marca clínica” en De guardia.{" "}
              <b>Piensa bien el alias</b>: debe ser único y{" "}
              <b>no se podrá cambiar después</b>. No puede ser igual ni
              confusamente similar al de otro médico.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="sr-label">Nombre</label>
              <input
                className="sr-input"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            <div>
              <label className="sr-label">Apellidos</label>
              <input
                className="sr-input"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="sr-label">Especialidad</label>
            <input
              className="sr-input"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
            />
          </div>

          <div>
            <label className="sr-label">Número de colegiado</label>
            <input
              className="sr-input"
              value={colegiadoNumber}
              onChange={(e) => setColegiadoNumber(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="sr-label">Centro</label>
              <input
                className="sr-input"
                value={center}
                onChange={(e) => setCenter(e.target.value)}
              />
            </div>

            <div>
              <label className="sr-label">Ciudad</label>
              <input
                className="sr-input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="sr-label">Teléfono</label>
            <input
              className="sr-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div>
            <label className="sr-label">Descripción profesional</label>
            <textarea
              className="sr-input min-h-[80px]"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          {saveError && <p className="text-red-600">{saveError}</p>}
          {saveInfo && <p className="text-emerald-700">{saveInfo}</p>}

          <button
            type="submit"
            disabled={saving}
            className="sr-btn-primary w-full"
          >
            {saving ? "Guardando..." : "Guardar perfil médico"}
          </button>
        </form>
      </section>
    </main>
  );
}
