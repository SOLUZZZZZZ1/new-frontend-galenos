// src/pages/Success.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import Seo from "../components/Seo.jsx";

export default function Success(){
  const q = new URLSearchParams(useLocation().search);
  const sessionId = q.get("session_id") || "";
  return (
    <>
      <Seo title="¡Suscripción activada!" />
      <main className="sr-container py-12" style={{ backgroundImage:"url('/marmol.jpg')", backgroundSize:"cover" }}>
        <div className="sr-card" style={{ maxWidth: 720, margin:"0 auto" }}>
          <h1 className="sr-h1">¡Suscripción activada!</h1>
          <p className="sr-p">Gracias. Hemos activado tu suscripción. Recibirás un correo con el comprobante.</p>
          {sessionId && <p className="sr-p">ID de sesión: <code>{sessionId}</code></p>}
          <div className="mt-4" style={{ display:"flex", gap:12 }}>
            <a className="sr-btn-primary" href="/panel-mediador">Ir a mi panel</a>
            <Link className="sr-btn-secondary" to="/">Volver al inicio</Link>
          </div>
        </div>
      </main>
    </>
  );
}
