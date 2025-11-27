// PERFIL MEDIADOR — AVATAR + CV + CONTRASEÑA LISTO PARA TU BACKEND REAL
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../components/Seo.jsx";

const LS_EMAIL = "mediador_email";

export default function PerfilMediador() {
  const nav = useNavigate();
  const email = localStorage.getItem(LS_EMAIL) || "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  const [name, setName] = useState("");
  const [provincia, setProvincia] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [cvUrl, setCvUrl] = useState("");

  const [oldPass, setOldPass] = useState("");
  const [newPass1, setNewPass1] = useState("");
  const [newPass2, setNewPass2] = useState("");
  const [savingPass, setSavingPass] = useState(false);

  const avatarInput = useRef(null);
  const cvInput = useRef(null);

  useEffect(() => {
    if (!email) {
      nav("/acceso");
      return;
    }
    loadPerfil();
  }, [email, nav]);

  async function loadPerfil() {
    setLoading(true);
    try {
      const resp = await fetch(`/api/perfil?email=${encodeURIComponent(email)}`);
      const data = await resp.json();

      if (!resp.ok || !data?.ok) {
        throw new Error(data?.detail || "No se pudo cargar el perfil.");
      }

      const p = data.perfil || {};
      setName(p.name || "");
      setProvincia(p.provincia || "");
      setEspecialidad(p.especialidad || "");
      setBio(p.bio || "");
      setWebsite(p.website || "");
      setPhotoUrl(p.photo_url || "");
      setCvUrl(p.cv_url || "");
    } catch (e) {
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function savePerfil(e) {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    setInfoMsg("");

    try {
      const resp = await fetch("/api/perfil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          bio,
          website,
          photo_url: photoUrl,
          cv_url: cvUrl,
        }),
      });

      const data = await resp.json();
      if (!resp.ok || !data?.ok) {
        throw new Error(data?.detail || "No se pudo guardar.");
      }

      setInfoMsg("Perfil actualizado correctamente.");
    } catch (e) {
      setErrorMsg(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    setSavingPass(true);
    setErrorMsg("");
    setInfoMsg("");

    try {
      if (!oldPass || !newPass1 || !newPass2) {
        throw new Error("Rellena todos los campos.");
      }
      if (newPass1 !== newPass2) {
        throw new Error("Las nuevas contraseñas no coinciden.");
      }
      if (newPass1.length < 8) {
        throw new Error("La nueva contraseña debe tener al menos 8 caracteres.");
      }

      const resp = await fetch("/api/mediadores/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          old_password: oldPass,
          new_password: newPass1,
        }),
      });

      const data = await resp.json();

      if (!resp.ok || !data?.ok) {
        throw new Error(data?.detail || "No se pudo cambiar la contraseña.");
      }

      setInfoMsg("Contraseña actualizada correctamente.");
      setOldPass("");
      setNewPass1("");
      setNewPass2("");
    } catch (e) {
      setErrorMsg(e.message);
    } finally {
      setSavingPass(false);
    }
  }

  // ----------- SUBIDA DE ARCHIVOS (AVATAR + CV) -----------
  async function uploadFile(e, type) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setErrorMsg("");
      setInfoMsg("Subiendo archivo…");

      const fd = new FormData();
      fd.append("file", file);

      const resp = await fetch("/api/upload/file", {
        method: "POST",
        body: fd,
      });

      const data = await resp.json();
      if (!resp.ok || !data?.ok || !data?.url) {
        throw new Error(data?.detail || "No se pudo subir el archivo.");
      }

      if (type === "avatar") setPhotoUrl(data.url);
      if (type === "cv") setCvUrl(data.url);

      setInfoMsg("Archivo subido correctamente.");
    } catch (e) {
      setErrorMsg(e.message);
    } finally {
      if (avatarInput.current) avatarInput.current.value = "";
      if (cvInput.current) cvInput.current.value = "";
    }
  }

  function triggerAvatar() {
    avatarInput.current?.click();
  }
  function triggerCv() {
    cvInput.current?.click();
  }

  return (
    <>
      <Seo title="Perfil del mediador · Mediazion" />
      <main className="sr-container py-8" style={{ minHeight: "calc(100vh - 160px)" }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="sr-h1">👤 Mi Perfil</h1>
          <button className="sr-btn-secondary" onClick={() => nav("/panel-mediador")}>
            ← Volver al Panel PRO
          </button>
        </div>

        {loading && <p className="sr-p">Cargando perfil…</p>}

        {!loading && (
          <>
            {/* MENSAJES */}
            {errorMsg && (
              <div
                className="sr-card mb-4"
                style={{ borderColor: "#fecaca", color: "#991b1b" }}
              >
                <p className="sr-small">❌ {errorMsg}</p>
              </div>
            )}
            {infoMsg && (
              <div
                className="sr-card mb-4"
                style={{ borderColor: "#bbf7d0", color: "#166534" }}
              >
                <p className="sr-small">✅ {infoMsg}</p>
              </div>
            )}

            {/* AVATAR */}
            <section className="sr-card mb-4">
              <h2 className="sr-h2 mb-2">📷 Foto (Avatar)</h2>

              {photoUrl && (
                <img
                  src={photoUrl}
                  alt="Avatar"
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "100%",
                    objectFit: "cover",
                    border: "2px solid #ccc",
                    marginBottom: "10px",
                  }}
                />
              )}

              <button className="sr-btn-secondary" onClick={triggerAvatar}>
                Subir foto
              </button>
              <input
                type="file"
                ref={avatarInput}
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => uploadFile(e, "avatar")}
              />

              <label className="sr-label mt-3">URL de la foto</label>
              <input
                className="sr-input"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
              />
            </section>

            {/* CV */}
            <section className="sr-card mb-4">
              <h2 className="sr-h2 mb-2">📄 Curriculum (CV)</h2>

              {cvUrl && (
                <p className="sr-small mb-2">
                  CV actual:{" "}
                  <a href={cvUrl} className="sr-link" target="_blank">
                    Ver PDF
                  </a>
                </p>
              )}

              <button className="sr-btn-secondary" onClick={triggerCv}>
                Subir CV (PDF)
              </button>
              <input
                type="file"
                ref={cvInput}
                accept="application/pdf"
                style={{ display: "none" }}
                onChange={(e) => uploadFile(e, "cv")}
              />

              <label className="sr-label mt-3">URL del CV</label>
              <input
                className="sr-input"
                value={cvUrl}
                onChange={(e) => setCvUrl(e.target.value)}
              />
            </section>

            {/* CAMBIO DE CONTRASEÑA */}
            <section className="sr-card mb-4">
              <h2 className="sr-h2 mb-2">🔒 Cambio de contraseña</h2>

              <form className="grid gap-3" onSubmit={changePassword}>
                <div>
                  <label className="sr-label">Contraseña actual</label>
                  <input
                    type="password"
                    className="sr-input"
                    value={oldPass}
                    onChange={(e) => setOldPass(e.target.value)}
                  />
                </div>

                <div>
                  <label className="sr-label">Nueva contraseña</label>
                  <input
                    type="password"
                    className="sr-input"
                    value={newPass1}
                    onChange={(e) => setNewPass1(e.target.value)}
                  />
                </div>

                <div>
                  <label className="sr-label">Repite la nueva contraseña</label>
                  <input
                    type="password"
                    className="sr-input"
                    value={newPass2}
                    onChange={(e) => setNewPass2(e.target.value)}
                  />
                </div>

                <button className="sr-btn-secondary" type="submit" disabled={savingPass}>
                  {savingPass ? "Guardando…" : "Actualizar contraseña"}
                </button>
              </form>
            </section>

            {/* DATOS PROFESIONALES */}
            <section className="sr-card mb-6">
              <h2 className="sr-h2 mb-2">Datos profesionales</h2>

              <form className="grid gap-3" onSubmit={savePerfil}>
                <label className="sr-label">Web profesional</label>
                <input
                  className="sr-input"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />

                <label className="sr-label">Bio</label>
                <textarea
                  className="sr-input"
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />

                <button className="sr-btn-primary" type="submit" disabled={saving}>
                  {saving ? "Guardando…" : "Guardar cambios"}
                </button>
              </form>
            </section>
          </>
        )}
      </main>
    </>
  );
}
