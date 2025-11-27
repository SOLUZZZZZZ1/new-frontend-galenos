// src/pages/Cookies.jsx — Política de cookies
import React from "react";
import Seo from "../components/Seo.jsx";

export default function Cookies() {
  return (
    <>
      <Seo
        title="Política de cookies · Mediazion"
        description="Información sobre cookies utilizadas en este sitio web."
        canonical="https://mediazion.eu/cookies"
      />
      <main
        className="sr-container py-12"
        style={{ minHeight: "calc(100vh - 160px)" }}
      >
        <h1 className="sr-h1 mb-4">Política de cookies</h1>
        <p className="sr-small text-zinc-600 mb-6">
          Este texto es orientativo y debe ser revisado por tu asesoría
          jurídica antes de considerarse definitivo.
        </p>

        {/* Qué son las cookies */}
        <section className="sr-card mb-6">
          <h2 className="sr-h2 mb-2">¿Qué son las cookies?</h2>
          <p className="sr-p mb-2">
            Las cookies son pequeños archivos de datos que se descargan en el
            dispositivo de la persona usuaria cuando visita determinadas
            páginas web. Permiten, entre otras cosas, almacenar y recuperar
            información sobre los hábitos de navegación y, en ocasiones,
            utilizarse para reconocer al usuario.
          </p>
        </section>

        {/* Cookies utilizadas */}
        <section className="sr-card mb-6">
          <h2 className="sr-h2 mb-2">Cookies utilizadas en Mediazion</h2>
          <p className="sr-p mb-2">
            El sitio web y el Panel del Mediador de Mediazion utilizan
            principalmente cookies técnicas necesarias para:
          </p>
          <ul className="sr-p list-disc ml-6 mb-2">
            <li>Recordar la sesión iniciada de la persona usuaria.</li>
            <li>Gestionar preferencias básicas de navegación y seguridad.</li>
            <li>
              Garantizar el funcionamiento correcto del panel y sus
              herramientas.
            </li>
          </ul>
          <p className="sr-p mb-2">
            Adicionalmente, podrían emplearse cookies analíticas propias o de
            terceros para obtener estadísticas de uso anónimas y mejorar la
            experiencia, siempre respetando la legislación vigente y, en su
            caso, recabando el consentimiento informado cuando sea necesario.
          </p>
        </section>

        {/* Gestión */}
        <section className="sr-card mb-6">
          <h2 className="sr-h2 mb-2">Gestión y desactivación de cookies</h2>
          <p className="sr-p mb-2">
            La persona usuaria puede configurar su navegador para aceptar o
            rechazar cookies, así como para eliminar las ya instaladas. Los
            pasos para ello dependen del navegador utilizado (Chrome, Firefox,
            Edge, Safari, etc.).
          </p>
          <p className="sr-p mb-2">
            Ten en cuenta que la desactivación de determinadas cookies técnicas
            podría afectar al funcionamiento correcto de Mediazion, especialmente
            en lo relativo al inicio de sesión y uso del Panel del Mediador.
          </p>
        </section>

        {/* Actualización */}
        <section className="sr-card mb-6">
          <h2 className="sr-h2 mb-2">Actualización de esta política</h2>
          <p className="sr-p mb-2">
            LA TALAMANQUINA, S.L. podrá actualizar esta política de cookies en
            función de cambios en la normativa, en los servicios ofrecidos o en
            las tecnologías utilizadas. Cualquier modificación relevante será
            comunicada a través de este mismo apartado.
          </p>
        </section>
      </main>
    </>
  );
}
