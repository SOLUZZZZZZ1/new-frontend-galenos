// src/pages/Contacto.jsx — Formulario de contacto conectado a /api/contact
import React, { useState } from "react";
import Seo from "../components/Seo.jsx";

export default function Contacto() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [status, setStatus] = useState({
    sending: false,
    ok: null,
    msg: "",
  });

  async function onSubmit(e) {
    e.preventDefault();
    setStatus({ sending: true, ok: null, msg: "" });

    if (!nombre.trim() || !email.trim() || !mensaje.trim()) {
      setStatus({
        sending: false,
        ok: false,
        msg: "Por favor, rellena al menos nombre, email y mensaje.",
      });
      return;
    }

    try {
      // 👇 IMPORTANTE: aquí tiene que ir EXACTAMENTE /api/contact
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nombre,
          email,
          subject: asunto || "Contacto desde la web",
          message: mensaje,
          accept: true, // aceptación RGPD (ya marcamos true al enviar)
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.ok) {
        const errMsg =
          data?.detail ||
          data?.message ||
          data?.error ||
          "No se pudo enviar el mensaje. Inténtalo más tarde.";
        throw new Error(errMsg);
      }

      setStatus({
        sending: false,
        ok: true,
        msg:
          "Hemos recibido tu mensaje. Te responderemos y te hemos enviado un correo de confirmación.",
      });

      setNombre("");
      setEmail("");
      setAsunto("");
      setMensaje("");
    } catch (e) {
      setStatus({
        sending: false,
        ok: false,
        msg: e.message || "Error de red al enviar el mensaje.",
      });
    }
  }

  return (
    <>
      <Seo
        title="Contacto · Mediazion"
        description="Ponte en contacto con Mediazion para información sobre mediación y panel de mediadores."
        canonical="https://mediazion.eu/contacto"
      />
      <main
        className="sr-container py-12"
        style={{ minHeight: "calc(100vh - 160px)" }}
      >
        <h1 className="sr-h1 mb-2">Contacto</h1>
        <p className="sr-p mb-6">
          Cuéntanos brevemente en qué podemos ayudarte. Si eres mediador o
          estás interesado en el Panel PRO, indícalo. Si buscas ayuda para un
          conflicto concreto, puedes describirlo de forma general.
        </p>

        <form
          onSubmit={onSubmit}
          className="sr-card"
          style={{ maxWidth: 680 }}
        >
          <div className="grid gap-4">
            <div>
              <label className="sr-label">Nombre</label>
              <input
                className="sr-input"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre"
                required
              />
            </div>

            <div>
              <label className="sr-label">Email</label>
              <input
                type="email"
                className="sr-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@ejemplo.com"
                required
              />
            </div>

            <div>
              <label className="sr-label">Asunto (opcional)</label>
              <input
                className="sr-input"
                value={asunto}
                onChange={(e) => setAsunto(e.target.value)}
                placeholder="Información, consulta, mediación..."
              />
            </div>

            <div>
              <label className="sr-label">Mensaje</label>
              <textarea
                className="sr-input"
                rows={5}
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder="Explica brevemente si eres mediador o cliente, y qué necesitas."
                required
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="submit"
              className="sr-btn-primary"
              disabled={status.sending}
            >
              {status.sending ? "Enviando…" : "Enviar mensaje"}
            </button>

            {status.ok === true && (
              <span style={{ color: "#166534" }} className="sr-small">
                ✅ {status.msg}
              </span>
            )}
            {status.ok === false && (
              <span style={{ color: "#991b1b" }} className="sr-small">
                ❌ {status.msg}
              </span>
            )}
          </div>
        </form>
      </main>
    </>
  );
}
