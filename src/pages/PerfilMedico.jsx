
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API =
  import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

export default function PerfilMedico() {
  const navigate = useNavigate();

  const token = localStorage.getItem("galenos_token") || "";
  const emailLs = localStorage.getItem("galenos_email") || "";
  const nameLs = localStorage.getItem("galenos_name") || "";
  const aliasLs = localStorage.getItem("galenos_alias") || "";
  const specialtyLs = localStorage.getItem("galenos_specialty") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Perfil médico desde backend (doctor_profiles)
  const [profile, setProfile] = useState(null);

  // Estado del formulario de creación
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [specialty, setSpecialty] = useState(specialtyLs || "");
  const [colegiadoNumber, setColegiadoNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [center, setCenter] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveInfo, setSaveInfo] = useState("");

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
        console.log("👉 [/perfil] /doctor/profile/me (raw):", raw);

        if (res.status === 404) {
          // No existe perfil aún → modo creación
          setProfile(null);
          setLoading(false);
          // Opcional: intentar partir el nombre local en nombre / apellidos
          if (nameLs && !firstName && !lastName) {
            const parts = nameLs.split(" ");
            setFirstName(parts[0] || "");
            setLastName(parts.slice(1).join(" ") || "");
          }
          return;
        }

        if (!res.ok) {
          setError("No se pudo cargar tu perfil médico.");
          setLoading(false);
          return;
        }

        let data;
        try {
          data = JSON.parse(raw);
        } catch (err) {
          console.error("❌ [/perfil] Error parseando perfil:", err);
          setError("Respuesta inesperada del servidor de perfil.");
          setLoading(false);
          return;
        }

        setProfile(data);
        setLoading(false);
      } catch (err) {
        console.error("❌ [/perfil] Error cargando perfil:", err);
        setError("No se pudo conectar con el servidor de perfil.");
        setLoading(false);
      }
    }

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleCreateProfile(e) {
    e.preventDefault();
    setSaveError("");
    setSaveInfo("");

    if (!firstName.trim() && !lastName.trim()) {
      setSaveError("Introduce al menos el nombre o apellidos.");
      return;
    }

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
      console.log("🩺 [/perfil] Creando perfil médico en:", `${API}/doctor/profile`);

      const res = await fetch(`${API}/doctor/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const raw = await res.text();
      console.log("👉 [/perfil] Respuesta creación perfil (raw):", raw);

      if (!res.ok) {
        let msg = "No se ha podido crear tu perfil médico.";
        try {
          const errData = JSON.parse(raw);
          if (errData.detail) msg = errData.detail;
        } catch {}
        setSaveError(msg);
        return;
      }

      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        // Si el backend no devuelve el objeto completo, usamos el payload
        data = {
          ...payload,
        };
      }

      setProfile(data);
      setSaveInfo("Perfil médico creado correctamente.");
    } catch (err) {
      console.error("❌ [/perfil] Error creando perfil médico:", err);
      setSaveError("No se ha podido conectar con el servidor de perfil.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="sr-container py-8">
        <p className="text-sm text-slate-600">
          Cargando tu perfil médico...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="sr-container py-8 space-y-4 max-w-xl">
        <h1 className="text-2xl font-semibold text-slate-900">
          Perfil del médico
        </h1>
        <p className="text-sm text-red-600">{error}</p>
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="sr-btn-secondary text-sm"
        >
          Ir al inicio de sesión
        </button>
      </main>
    );
  }

  // ============================
  // PERFIL YA EXISTE → SOLO LECTURA
  // ============================
  if (profile) {
    const displayName =
      (profile.first_name || "") +
      (profile.last_name ? ` ${profile.last_name}` : "") ||
      nameLs ||
      "Sin especificar";

    return (
      <main className="sr-container py-8 max-w-xl space-y-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          Perfil del médico
        </h1>

        {/* Datos profesionales */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Datos profesionales
          </h2>

          <div className="space-y-3 text-sm text-slate-700">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.16em]">
                Nombre profesional
              </p>
              <p className="mt-0.5">{displayName}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.16em]">
                Correo electrónico
              </p>
              <p className="mt-0.5">
                {emailLs || (
                  <span className="text-slate-400">Sin especificar</span>
                )}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.16em]">
                Especialidad
              </p>
              <p className="mt-0.5">
                {profile.specialty || specialtyLs || (
                  <span className="text-slate-400">No indicada</span>
                )}
              </p>
            </div>

            {profile.colegiado_number && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.16em]">
                  Nº de colegiado
                </p>
                <p className="mt-0.5">{profile.colegiado_number}</p>
              </div>
            )}

            {(profile.center || profile.city) && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.16em]">
                  Centro / Ciudad
                </p>
                <p className="mt-0.5">
                  {profile.center || ""}
                  {profile.center && profile.city ? " · " : ""}
                  {profile.city || ""}
                </p>
              </div>
            )}

            {profile.phone && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.16em]">
                  Teléfono de contacto
                </p>
                <p className="mt-0.5">{profile.phone}</p>
              </div>
            )}
          </div>
        </section>

        {/* Alias profesional (para De Guardia) */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">
            Alias profesional
          </h2>
          <p className="text-slate-800 text-sm font-medium">
            {aliasLs || <span className="text-slate-400">Sin alias definido</span>}
          </p>
          <p className="sr-small text-slate-500 text-xs">
            Este alias se utilizará en el futuro módulo <strong>De Guardia</strong>{" "}
            para identificar tus aportes de forma anónima ante otros médicos. Por motivos
            de coherencia y reputación, no se podrá cambiar libremente.
          </p>
        </section>

        {/* Bio / descripción opcional */}
        {profile.bio && (
          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">
              Descripción profesional
            </h2>
            <p className="text-sm text-slate-700 whitespace-pre-line">
              {profile.bio}
            </p>
          </section>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="sr-btn-secondary text-sm"
          >
            Volver al panel
          </button>
        </div>
      </main>
    );
  }

  // ============================
  // NO HAY PERFIL → FORMULARIO DE CREACIÓN (UNA VEZ)
  // ============================
  return (
    <main className="sr-container py-8 max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">
        Completa tu perfil médico
      </h1>

      <p className="text-sm text-slate-600">
        Antes de activar Galenos PRO y utilizar módulos avanzados (analíticas, imágenes,
        De Guardia), necesitamos unos datos básicos para tu perfil profesional.
      </p>

      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <form onSubmit={handleCreateProfile} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="sr-label">Nombre</label>
              <input
                type="text"
                className="sr-input w-full"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ej. Marta"
              />
            </div>
            <div>
              <label className="sr-label">Apellidos</label>
              <input
                type="text"
                className="sr-input w-full"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Ej. López García"
              />
            </div>
          </div>

          <div>
            <label className="sr-label">Especialidad</label>
            <input
              type="text"
              className="sr-input w-full"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder="Medicina de familia, interna, urgencias..."
            />
          </div>

          <div>
            <label className="sr-label">Número de colegiado (opcional)</label>
            <input
              type="text"
              className="sr-input w-full"
              value={colegiadoNumber}
              onChange={(e) => setColegiadoNumber(e.target.value)}
              placeholder="Ej. 28/1234567"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="sr-label">Centro / Hospital (opcional)</label>
              <input
                type="text"
                className="sr-input w-full"
                value={center}
                onChange={(e) => setCenter(e.target.value)}
                placeholder="Centro de salud / Hospital"
              />
            </div>
            <div>
              <label className="sr-label">Ciudad (opcional)</label>
              <input
                type="text"
                className="sr-input w-full"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Madrid, Barcelona..."
              />
            </div>
          </div>

          <div>
            <label className="sr-label">Teléfono de contacto (opcional)</label>
            <input
              type="text"
              className="sr-input w-full"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+34 ..."
            />
          </div>

          <div>
            <label className="sr-label">Descripción profesional (opcional)</label>
            <textarea
              className="sr-input w-full min-h-[80px]"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Breve resumen de tu experiencia, perfil clínico, tipo de pacientes que ves habitualmente..."
            />
          </div>

          {saveError && (
            <p className="text-sm text-red-600">{saveError}</p>
          )}
          {saveInfo && !saveError && (
            <p className="text-sm text-emerald-700">{saveInfo}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="sr-btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {saving ? "Guardando perfil..." : "Guardar perfil médico"}
          </button>
        </form>
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="sr-btn-secondary text-sm"
        >
          Volver al panel
        </button>
      </div>
    </main>
  );
}
