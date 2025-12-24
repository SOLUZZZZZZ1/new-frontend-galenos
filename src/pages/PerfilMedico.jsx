// src/pages/PerfilMedico.jsx — Perfil médico (editable) con alias clínico bloqueado · Galenos.pro
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

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

  // ============================
  // Form states (crear / editar)
  // ============================
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [specialty, setSpecialty] = useState(specialtyLs || "");
  const [colegiadoNumber, setColegiadoNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [center, setCenter] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");

  // Alias clínico (solo se fija 1 vez)
  const [guardAlias, setGuardAlias] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveInfo, setSaveInfo] = useState("");

  // ============================
  // Cambio de contraseña
  // ============================
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwInfo, setPwInfo] = useState("");

  const aliasLocked = useMemo(() => {
    return Boolean(profile?.guard_alias_locked);
  }, [profile]);

  // ========================================================
  // LOAD PROFILE
  // ========================================================
  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError("");

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
          // Perfil NO existe todavía (modo creación)
          setProfile(null);

          // Prefill suave desde localStorage
          if (nameLs) {
            const parts = nameLs.split(" ");
            setFirstName(parts[0] || "");
            setLastName(parts.slice(1).join(" ") || "");
          }
          if (specialtyLs) setSpecialty(specialtyLs);

          setLoading(false);
          return;
        }

        if (!res.ok) {
          setError("No se pudo cargar el perfil médico.");
          setLoading(false);
          return;
        }

        const data = JSON.parse(raw);
        setProfile(data);

        // Prefill de edición
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setSpecialty(data.specialty || "");
        setColegiadoNumber(data.colegiado_number || "");
        setPhone(data.phone || "");
        setCenter(data.center || "");
        setCity(data.city || "");
        setBio(data.bio || "");

        // Alias (si existe)
        if (data.guard_alias) {
          localStorage.setItem("galenos_guard_alias", data.guard_alias);
        } else {
          const lsAlias = localStorage.getItem("galenos_guard_alias") || "";
          setGuardAlias(lsAlias);
        }

        setLoading(false);
      } catch (err) {
        console.error("❌ Error cargando perfil:", err);
        setError("No se pudo conectar con el servidor.");
        setLoading(false);
      }
    }

    loadProfile();
  }, [token, nameLs, specialtyLs]);

  // ========================================================
  // CREATE PROFILE (si no existe)
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

      // 2) Fijar alias clínico (1 sola vez)
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

      let aliasData = null;
      try {
        aliasData = JSON.parse(rawAlias);
      } catch {}

      const finalAlias = aliasData?.guard_alias || aliasClean;
      localStorage.setItem("galenos_guard_alias", finalAlias);

      // Refrescar perfil en UI (incluye lock)
      setProfile({
        ...data,
        guard_alias: finalAlias,
        guard_alias_locked: true,
      });

      setSaveInfo("Perfil médico creado y alias clínico fijado correctamente.");
    } catch (err) {
      console.error("❌ Error creando perfil:", err);
      setSaveError("No se pudo conectar con el servidor.");
    } finally {
      setSaving(false);
    }
  }

  // ========================================================
  // UPDATE PROFILE (editable, excepto alias)
  // ========================================================
  async function handleUpdateProfile(e) {
    e.preventDefault();
    setSaveError("");
    setSaveInfo("");

    if (!token) {
      setSaveError("No hay sesión activa. Inicia sesión de nuevo.");
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

      const res = await fetch(`${API}/doctor/profile/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const raw = await res.text();
      console.log("👉 [Perfil] PUT /doctor/profile/me (raw):", raw);

      if (!res.ok) {
        let msg = "No se pudo guardar el perfil médico.";
        try {
          const errData = JSON.parse(raw);
          if (errData.detail) msg = errData.detail;
        } catch {}
        setSaveError(msg);
        return;
      }

      const data = JSON.parse(raw);
      setProfile((prev) => ({
        ...(prev || {}),
        ...data,
        guard_alias: data.guard_alias ?? prev?.guard_alias ?? null,
        guard_alias_locked: data.guard_alias_locked ?? prev?.guard_alias_locked ?? false,
      }));

      setSaveInfo("Cambios guardados correctamente.");
    } catch (err) {
      console.error("❌ Error guardando perfil:", err);
      setSaveError("No se pudo conectar con el servidor.");
    } finally {
      setSaving(false);
    }
  }

  // ========================================================
  // SET ALIAS (si aún no está fijado)
  // ========================================================
  async function handleSetAliasOnce(e) {
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

    try {
      setSaving(true);
      const res = await fetch(`${API}/doctor/profile/guard-alias`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ guard_alias: aliasClean }),
      });

      const raw = await res.text();
      console.log("👉 [Perfil] POST /doctor/profile/guard-alias (raw):", raw);

      if (!res.ok) {
        let msg = "No se pudo fijar el alias clínico.";
        try {
          const errData = JSON.parse(raw);
          if (errData.detail) msg = errData.detail;
        } catch {}
        setSaveError(msg);
        return;
      }

      const data = JSON.parse(raw);
      const finalAlias = data.guard_alias || aliasClean;

      localStorage.setItem("galenos_guard_alias", finalAlias);
      setProfile((prev) => ({
        ...(prev || {}),
        guard_alias: finalAlias,
        guard_alias_locked: true,
      }));

      setSaveInfo("Alias clínico fijado correctamente. No podrá modificarse.");
    } catch (err) {
      console.error("❌ Error fijando alias clínico:", err);
      setSaveError("No se pudo conectar con el servidor.");
    } finally {
      setSaving(false);
    }
  }


  // ========================================================
  // CHANGE PASSWORD (ilimitado)
  // ========================================================
  async function handleChangePassword(e) {
    e.preventDefault();
    setPwError("");
    setPwInfo("");

    if (!token) {
      setPwError("No hay sesión activa. Inicia sesión de nuevo.");
      return;
    }

    const current = currentPassword;
    const next = newPassword;

    if (!current || current.length < 6) {
      setPwError("Introduce tu contraseña actual.");
      return;
    }
    if (!next || next.length < 10) {
      setPwError("La nueva contraseña debe tener al menos 10 caracteres.");
      return;
    }
    if (next !== confirmPassword) {
      setPwError("La confirmación no coincide con la nueva contraseña.");
      return;
    }
    if (next === current) {
      setPwError("La nueva contraseña debe ser distinta de la actual.");
      return;
    }

    try {
      setPwSaving(true);

      // Endpoint de cambio de contraseña (autenticado)
      // Nota: si en tu backend el endpoint se llama distinto, cambia SOLO esta URL.
      const res = await fetch(`${API}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: current,
          new_password: next,
        }),
      });

      const raw = await res.text();
      console.log("👉 [Perfil] POST /auth/change-password (raw):", raw);

      if (!res.ok) {
        let msg = "No se pudo cambiar la contraseña.";
        try {
          const errData = JSON.parse(raw);
          if (errData.detail) msg = errData.detail;
        } catch {}
        setPwError(msg);
        return;
      }

      setPwInfo("Contraseña actualizada correctamente.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("❌ Error cambiando contraseña:", err);
      setPwError("No se pudo conectar con el servidor.");
    } finally {
      setPwSaving(false);
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
        <button className="sr-btn-secondary mt-4" onClick={() => navigate("/dashboard")}>
          Volver al panel
        </button>
      </main>
    );
  }

  if (profile) {
    const showAliasSetter = !profile.guard_alias && !aliasLocked;

    return (
      <main className="sr-container py-8 space-y-6 max-w-xl">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">Perfil del médico</h1>
          <p className="text-sm text-slate-600">
            Puedes editar tus datos profesionales. El alias clínico (De guardia) es fijo una vez
            establecido.
          </p>
        </header>

        <section className="bg-white p-6 rounded-xl border space-y-4">
          <h2 className="text-lg font-semibold">Cuenta</h2>
          <p className="text-sm">
            <b>Email:</b> {profile.email || emailLs || "—"}
          </p>
          <p className="text-xs text-slate-500">
            Por ahora el correo se gestiona como dato de cuenta. Si necesitas cambiarlo, lo
            añadiremos en “Configuración de cuenta” (afecta también a Stripe).
          </p>
        </section>


        <section className="bg-white p-6 rounded-xl border space-y-4">
          <h2 className="text-lg font-semibold">Seguridad</h2>
          <p className="text-sm text-slate-600">
            Puedes cambiar tu contraseña <b>las veces que quieras</b>. Te recomendamos usar una contraseña larga y única.
          </p>

          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="sr-label">Contraseña actual</label>
              <input
                className="sr-input w-full"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Tu contraseña actual"
              />
            </div>

            <div>
              <label className="sr-label">Nueva contraseña</label>
              <input
                className="sr-input w-full"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 10 caracteres"
              />
              <p className="text-xs text-slate-500 mt-1">
                Consejo: 3–4 palabras + números o símbolos (sin reutilizar).
              </p>
            </div>

            <div>
              <label className="sr-label">Repite la nueva contraseña</label>
              <input
                className="sr-input w-full"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la nueva contraseña"
              />
            </div>

            {pwError && <p className="text-red-600 text-sm">{pwError}</p>}
            {pwInfo && <p className="text-emerald-700 text-sm">{pwInfo}</p>}

            <button
              type="submit"
              disabled={pwSaving}
              className="sr-btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {pwSaving ? "Actualizando..." : "Cambiar contraseña"}
            </button>
          </form>

          <p className="text-xs text-slate-500">
            Si no recuerdas tu contraseña, añadiremos “He olvidado mi contraseña” en la pantalla de login cuando quieras.
          </p>
        </section>

        <section className="bg-white p-6 rounded-xl border space-y-4">
          <h2 className="text-lg font-semibold">Alias clínico (De guardia)</h2>

          {!showAliasSetter ? (
            <>
              <p className="text-sm">
                <b>Alias:</b> {profile.guard_alias || "No definido"}
              </p>
              <p className="text-xs text-slate-500">
                Este alias identifica tu actividad en De guardia. Una vez fijado, no puede
                modificarse para proteger la coherencia de tu identidad en Galenos.
              </p>
            </>
          ) : (
            <form onSubmit={handleSetAliasOnce} className="space-y-2">
              <label className="sr-label">
                Define tu alias clínico <span className="text-red-600">*</span>
              </label>
              <input
                className="sr-input w-full"
                value={guardAlias}
                onChange={(e) => setGuardAlias(e.target.value)}
                placeholder="Ej. Internista Norte, MFyC Sur, NeuroDoc..."
              />
              <p className="text-xs text-slate-500">
                El alias se fija una sola vez y no podrá modificarse después.
              </p>
              <button
                type="submit"
                disabled={saving}
                className="sr-btn-secondary disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? "Guardando..." : "Fijar alias (una sola vez)"}
              </button>
            </form>
          )}
        </section>

        <section className="bg-white p-6 rounded-xl border space-y-4">
          <h2 className="text-lg font-semibold">Datos profesionales (editables)</h2>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="sr-label">Nombre</label>
                <input
                  className="sr-input w-full"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <label className="sr-label">Apellidos</label>
                <input
                  className="sr-input w-full"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="sr-label">Especialidad</label>
              <input
                className="sr-input w-full"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              />
            </div>

            <div>
              <label className="sr-label">Número de colegiado</label>
              <input
                className="sr-input w-full"
                value={colegiadoNumber}
                onChange={(e) => setColegiadoNumber(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="sr-label">Centro</label>
                <input
                  className="sr-input w-full"
                  value={center}
                  onChange={(e) => setCenter(e.target.value)}
                />
              </div>

              <div>
                <label className="sr-label">Ciudad</label>
                <input
                  className="sr-input w-full"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="sr-label">Teléfono</label>
              <input
                className="sr-input w-full"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="sr-label">Descripción profesional</label>
              <textarea
                className="sr-input w-full min-h-[90px]"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            {saveError && <p className="text-red-600 text-sm">{saveError}</p>}
            {saveInfo && <p className="text-emerald-700 text-sm">{saveInfo}</p>}

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={saving}
                className="sr-btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
              <button
                type="button"
                className="sr-btn-secondary"
                onClick={() => navigate("/dashboard")}
              >
                Volver al panel
              </button>
            </div>
          </form>
        </section>
      </main>
    );
  }

  // Perfil NO existe
  return (
    <main className="sr-container py-8 max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">Completa tu perfil médico</h1>

      <section className="bg-white p-6 rounded-xl border space-y-4">
        <form onSubmit={handleCreateProfile} className="space-y-4">
          <div>
            <label className="sr-label">
              Alias clínico (De guardia) <span className="text-red-600">*</span>
            </label>
            <input
              className="sr-input w-full"
              value={guardAlias}
              onChange={(e) => setGuardAlias(e.target.value)}
              placeholder="Ej. Internista Norte, MFyC Sur, NeuroDoc..."
            />
            <p className="text-xs text-slate-500 mt-1">
              Este alias será tu “marca clínica” en De guardia. <b>Piensa bien el alias</b>: debe
              ser único y <b>no se podrá cambiar después</b>.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="sr-label">Nombre</label>
              <input
                className="sr-input w-full"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            <div>
              <label className="sr-label">Apellidos</label>
              <input
                className="sr-input w-full"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="sr-label">Especialidad</label>
            <input
              className="sr-input w-full"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
            />
          </div>

          <div>
            <label className="sr-label">Número de colegiado</label>
            <input
              className="sr-input w-full"
              value={colegiadoNumber}
              onChange={(e) => setColegiadoNumber(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="sr-label">Centro</label>
              <input
                className="sr-input w-full"
                value={center}
                onChange={(e) => setCenter(e.target.value)}
              />
            </div>

            <div>
              <label className="sr-label">Ciudad</label>
              <input
                className="sr-input w-full"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="sr-label">Teléfono</label>
            <input
              className="sr-input w-full"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div>
            <label className="sr-label">Descripción profesional</label>
            <textarea
              className="sr-input w-full min-h-[90px]"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          {saveError && <p className="text-red-600 text-sm">{saveError}</p>}
          {saveInfo && <p className="text-emerald-700 text-sm">{saveInfo}</p>}

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={saving}
              className="sr-btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Guardando..." : "Crear perfil médico"}
            </button>
            <button
              type="button"
              className="sr-btn-secondary"
              onClick={() => navigate("/dashboard")}
            >
              Volver al panel
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
