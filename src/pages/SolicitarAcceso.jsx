// src/pages/SolicitarAcceso.jsx — Solicitud de acceso sin invitación · Galenos.pro
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// URL del backend de Galenos (Render)
const API = import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

export default function SolicitarAcceso() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [speciality, setSpeciality] = useState("");
  const [center, setCenter] = useState("");
  const [phone, setPhone] = useState("");
  const [howHeard, setHowHeard] = useState("");
  const [message, setMessage] = useState("");

  const [accept, setAccept] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !email || !country || !city) {
      setError("Por favor, rellena al menos nombre, correo, país y ciudad.");
      return;
    }
    if (!accept) {
      setError("Debes aceptar la política de privacidad para enviar la solicitud.");
      return;
    }

    try {
      setLoading(true);

      const body = {
        name,
        email,
        country,
        city,
        speciality: speciality || null,
        center: center || null,
        phone: phone || null,
        how_heard: howHeard || null,
        message: message || null,
      };

      console.log("🔥 Enviando solicitud de acceso a:", `${API}/access-requests`);

      const res = await fetch(`${API}/access-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const raw = await res.text();
      console.log("👉 Respuesta solicitud acceso (raw):", raw);

      if (!res.ok) {
        try {
          const errData = JSON.parse(raw);
          setError(errData.detail || "No se ha podido registrar la solicitud de acceso.");
        } catch (err) {
          setError("No se ha podido registrar la solicitud de acceso.");
        }
        return;
      }

      setSuccess("Gracias. Hemos recibido tu solicitud de acceso. Nos pondremos en contacto contigo o te enviaremos un enlace cuando se apruebe.");
      setName("");
      setEmail("");
      setCountry("");
      setCity("");
      setSpeciality("");
      setCenter("");
      setPhone("");
      setHowHeard("");
      setMessage("");
      setAccept(false);
    } catch (err) {
      console.error("❌ Error en solicitud de acceso:", err);
      setError("No se ha podido conectar con el servidor. Inténtalo de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="sr-container py-8 flex items-center justify-center">
      <section className="sr-card max-w-2xl w-full space-y-6">
        <header className="space-y-1">
          <h1 className="sr-h1 text-2xl">Solicitar acceso a Galenos.pro</h1>
          <p className="sr-p text-sm text-slate-600">
            Si aún no conoces a ningún colega que use Galenos.pro, puedes solicitar acceso directo.
            Cuéntanos quién eres y cómo trabajas para revisar tu solicitud.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="sr-label">
                Nombre y apellidos
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="sr-input w-full"
                placeholder="Dr./Dra. Nombre Apellidos"
              />
            </div>

            <div>
              <label htmlFor="email" className="sr-label">
                Correo profesional
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="sr-input w-full"
                placeholder="tu.correo@hospital.com"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="country" className="sr-label">
                País
              </label>
              <input
                id="country"
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="sr-input w-full"
                placeholder="Ej. España"
              />
            </div>

            <div>
              <label htmlFor="city" className="sr-label">
                Ciudad
              </label>
              <input
                id="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="sr-input w-full"
                placeholder="Ej. Madrid"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="speciality" className="sr-label">
                Especialidad (opcional)
              </label>
              <input
                id="speciality"
                type="text"
                value={speciality}
                onChange={(e) => setSpeciality(e.target.value)}
                className="sr-input w-full"
                placeholder="Medicina Interna, AP, etc."
              />
            </div>

            <div>
              <label htmlFor="center" className="sr-label">
                Centro / hospital / consulta (opcional)
              </label>
              <input
                id="center"
                type="text"
                value={center}
                onChange={(e) => setCenter(e.target.value)}
                className="sr-input w-full"
                placeholder="Nombre del centro"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="sr-label">
                Teléfono de contacto (opcional)
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="sr-input w-full"
                placeholder="+34 ..."
              />
            </div>

            <div>
              <label htmlFor="howHeard" className="sr-label">
                ¿Cómo nos has conocido? (opcional)
              </label>
              <input
                id="howHeard"
                type="text"
                value={howHeard}
                onChange={(e) => setHowHeard(e.target.value)}
                className="sr-input w-full"
                placeholder="Colega, congreso, redes, etc."
              />
            </div>
          </div>

          <div>
            <label htmlFor="message" className="sr-label">
              Cuéntanos brevemente tu contexto (opcional)
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="sr-input w-full h-24"
              placeholder="Ej. tipo de pacientes que ves, cómo te gustaría usar Galenos.pro, etc."
            />
          </div>

          <div className="flex items-start gap-2">
            <input
              id="accept"
              type="checkbox"
              checked={accept}
              onChange={(e) => setAccept(e.target.checked)}
              className="mt-1"
            />
            <label htmlFor="accept" className="sr-small text-slate-600">
              Acepto que mis datos se utilicen para gestionar mi solicitud de acceso a Galenos.pro. 
              Entiendo que esto no implica la creación automática de una cuenta.
            </label>
          </div>

          {error && (
            <p className="sr-small text-red-600">
              {error}
            </p>
          )}

          {success && (
            <p className="sr-small text-emerald-600">
              {success}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="sr-btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Enviando solicitud..." : "Enviar solicitud de acceso"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="sr-btn-secondary text-sm"
            >
              Volver al inicio
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
