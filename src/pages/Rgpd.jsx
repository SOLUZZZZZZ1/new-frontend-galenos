// src/pages/Rgpd.jsx — Política de protección de datos (RGPD)
import React from "react";
import Seo from "../components/Seo.jsx";

export default function Rgpd() {
  return (
    <>
      <Seo
        title="Protección de datos (RGPD) · Mediazion"
        description="Información sobre el tratamiento de datos personales conforme al RGPD."
        canonical="https://mediazion.eu/rgpd"
      />
      <main
        className="sr-container py-12"
        style={{ minHeight: "calc(100vh - 160px)" }}
      >
        <h1 className="sr-h1 mb-4">Protección de datos (RGPD)</h1>
        <p className="sr-small text-zinc-600 mb-6">
          Esta política de privacidad es orientativa y debe ser revisada por tu
          asesoría jurídica antes de su publicación definitiva.
        </p>

        {/* Responsable */}
        <section className="sr-card mb-6">
          <h2 className="sr-h2 mb-2">Responsable del tratamiento</h2>
          <ul className="sr-p list-disc ml-6 mb-2">
            <li>
              <b>Responsable:</b> LA TALAMANQUINA, S.L.
            </li>
            <li>
              <b>NIF:</b> B75440115
            </li>
            <li>
              <b>Domicilio:</b> Calle Velázquez, 15 – 28001 Madrid (España)
            </li>
            <li>
              <b>Correo electrónico de contacto:</b>{" "}
              <a
                href="mailto:admin@mediazion.eu"
                className="text-sky-700 underline"
              >
                admin@mediazion.eu
              </a>
            </li>
          </ul>
          <p className="sr-p">
            LA TALAMANQUINA, S.L. trata los datos personales de las personas
            usuarias de Mediazion de forma lícita, leal y transparente, de
            acuerdo con el Reglamento (UE) 2016/679 (RGPD) y la normativa
            española de protección de datos.
          </p>
        </section>

        {/* Finalidades */}
        <section className="sr-card mb-6">
          <h2 className="sr-h2 mb-2">Finalidades del tratamiento</h2>
          <p className="sr-p mb-2">
            Los datos personales podrán tratarse para las siguientes
            finalidades:
          </p>
          <ul className="sr-p list-disc ml-6 mb-2">
            <li>
              Gestionar el alta, acceso y uso del Panel del Mediador y de los
              servicios ofrecidos.
            </li>
            <li>Gestionar la facturación y el cobro de los servicios.</li>
            <li>
              Proporcionar soporte técnico y resolver consultas relacionadas con
              Mediazion.
            </li>
            <li>
              Enviar comunicaciones informativas relacionadas con el
              funcionamiento de la plataforma y mejoras de servicio.
            </li>
            <li>
              Cumplir obligaciones legales y requerimientos de las
              administraciones públicas y órganos judiciales.
            </li>
          </ul>
        </section>

        {/* Legitimación */}
        <section className="sr-card mb-6">
          <h2 className="sr-h2 mb-2">Legitimación del tratamiento</h2>
          <p className="sr-p mb-2">
            La base jurídica para el tratamiento de los datos es, según el
            caso:
          </p>
          <ul className="sr-p list-disc ml-6 mb-2">
            <li>
              La ejecución de un contrato o la aplicación de medidas
              precontractuales (acceso al Panel del Mediador y uso de los
              servicios).
            </li>
            <li>
              El cumplimiento de obligaciones legales (obligaciones fiscales,
              contables o de prevención del fraude).
            </li>
            <li>
              El consentimiento de la persona interesada, cuando sea necesario
              (por ejemplo, para determinadas comunicaciones).
            </li>
            <li>
              El interés legítimo de LA TALAMANQUINA, S.L. en mantener la
              seguridad de la plataforma y mejorar sus funcionalidades.
            </li>
          </ul>
        </section>

        {/* Destinatarios */}
        <section className="sr-card mb-6">
          <h2 className="sr-h2 mb-2">Destinatarios de los datos</h2>
          <p className="sr-p mb-2">
            Con carácter general, los datos no se cederán a terceros, salvo
            obligación legal o cuando sea necesario para la correcta prestación
            del servicio (por ejemplo, proveedores tecnológicos que alojan la
            plataforma o prestan servicios de correo, siempre bajo contrato de
            encargo de tratamiento).
          </p>
          <p className="sr-p">
            No se prevén transferencias internacionales de datos fuera del
            Espacio Económico Europeo, salvo que se utilicen servicios de
            proveedores ubicados en terceros países con garantías adecuadas
            conforme al RGPD.
          </p>
        </section>

        {/* Conservación */}
        <section className="sr-card mb-6">
          <h2 className="sr-h2 mb-2">Plazo de conservación</h2>
          <p className="sr-p mb-2">
            Los datos se conservarán mientras exista una relación activa con la
            persona usuaria (cuenta de mediador/a o servicios contratados) y,
            posteriormente, durante los plazos necesarios para cumplir con las
            obligaciones legales y atender posibles responsabilidades derivadas
            del tratamiento.
          </p>
        </section>

        {/* Derechos */}
        <section className="sr-card mb-6">
          <h2 className="sr-h2 mb-2">Derechos de las personas interesadas</h2>
          <p className="sr-p mb-2">
            Las personas usuarias pueden ejercer los siguientes derechos en
            relación con sus datos personales:
          </p>
          <ul className="sr-p list-disc ml-6 mb-2">
            <li>Derecho de acceso a sus datos personales.</li>
            <li>Derecho de rectificación de los datos inexactos.</li>
            <li>Derecho de supresión cuando los datos ya no sean necesarios.</li>
            <li>
              Derecho de oposición y limitación del tratamiento en determinadas
              circunstancias.
            </li>
            <li>Derecho a la portabilidad de los datos cuando sea aplicable.</li>
          </ul>
          <p className="sr-p mb-2">
            Para ejercer estos derechos, la persona interesada puede contactar
            en el correo{" "}
            <a
              href="mailto:admin@mediazion.eu"
              className="text-sky-700 underline"
            >
              admin@mediazion.eu
            </a>
            , indicando claramente su identidad y el derecho que desea ejercer.
          </p>
          <p className="sr-p">
            Asimismo, tiene derecho a presentar una reclamación ante la
            autoridad de control competente (en España, la Agencia Española de
            Protección de Datos) si considera que se ha vulnerado su derecho a
            la protección de datos.
          </p>
        </section>

        {/* Seguridad */}
        <section className="sr-card mb-6">
          <h2 className="sr-h2 mb-2">Seguridad de la información</h2>
          <p className="sr-p mb-2">
            LA TALAMANQUINA, S.L. aplica medidas técnicas y organizativas
            apropiadas para proteger los datos personales frente a accesos no
            autorizados, pérdidas, destrucción o divulgación indebida. No
            obstante, ninguna medida de seguridad en Internet es totalmente
            infalible, por lo que no puede garantizarse una protección absoluta
            frente a todas las amenazas posibles.
          </p>
        </section>
      </main>
    </>
  );
}
