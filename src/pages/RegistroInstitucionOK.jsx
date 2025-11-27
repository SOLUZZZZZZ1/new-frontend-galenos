// src/pages/RegistroInstitucionOK.jsx
import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";

export default function RegistroInstitucionOK() {
  return (
    <>
      <Seo title="Solicitud enviada · Mediazion" />
      <main className="sr-container py-12" style={{ maxWidth: 700 }}>
        <h1 className="sr-h1 mb-3">Solicitud enviada</h1>
        <p className="sr-p mb-4">
          Gracias. Hemos recibido la solicitud de tu institución.  
          Te contactaremos en breve para activar tu acceso.
        </p>
        <Link to="/instituciones" className="sr-btn-secondary">
          ← Volver a Instituciones
        </Link>
      </main>
    </>
  );
}
