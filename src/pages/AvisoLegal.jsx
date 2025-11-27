// src/pages/AvisoLegal.jsx — Aviso legal de LA TALAMANQUINA, S.L.
import React from "react";
import Seo from "../components/Seo.jsx";

export default function AvisoLegal() {
  return (
    <>
      <Seo
        title="Aviso legal · Mediazion"
        description="Aviso legal y condiciones de uso del sitio web y plataforma Mediazion."
        canonical="https://mediazion.eu/aviso-legal"
      />
      <main
        className="sr-container py-12"
        style={{ minHeight: "calc(100vh - 160px)" }}
      >
        <h1 className="sr-h1 mb-4">Aviso legal</h1>
        <p className="sr-small text-zinc-600 mb-6">
          Este texto tiene carácter informativo y debe ser revisado por tu
          asesoría jurídica antes de considerarse versión definitiva.
        </p>

        {/* Titular */}
        <section className="sr-card mb-6">
          <h2 className="sr-h2 mb-2">Titular del sitio web</h2>
          <p className="sr-p mb-2">
            En cumplimiento de la normativa vigente, se informa de que el sitio
            web <span className="font-semibold">mediazion.eu</span> y la
            plataforma asociada Mediazion pertenecen a:
          </p>
          <ul className="sr-p list-disc ml-6 mb-2">
            <li>
              <b>Titular:</b> LA TALAMANQUINA, S.L.
            </li>
            <li>
              <b>NIF:</b> B75440115
            </li>
            <li>
              <b>Domicilio social:</b> Calle Velázquez, 15 – 28001 Madrid
              (España)
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
            Mediazion ofrece una plataforma profesional de apoyo a la mediación
            que pone a disposición de mediadores/as herramientas tecnológicas,
            pero no sustituye el criterio profesional del mediador ni el
            asesoramiento jurídico individualizado.
          </p>
        </section>

        {/* Uso del sitio */}
        <section className="sr-card mb-6">
          <h2 className="sr-h2 mb-2">
            Uso del sitio web y del Panel del Mediador
          </h2>
          <p className="sr-p mb-2">
            El acceso y uso de este sitio web y del Panel del Mediador atribuye
            la condición de persona usuaria e implica la aceptación de las
            condiciones recogidas en este aviso legal. La persona usuaria se
            compromete a hacer un uso adecuado de los contenidos y herramientas,
            evitando actividades ilícitas, contrarias a la buena fe o que
            puedan dañar la imagen de Mediazion o de terceros.
          </p>
          <p className="sr-p mb-2">
            El acceso al Panel del Mediador se realiza mediante credenciales
            personales (correo electrónico y contraseña u otros mecanismos de
            autenticación). La persona usuaria es responsable de la
            confidencialidad de sus credenciales y de todas las acciones que se
            realicen desde su cuenta.
          </p>
        </section>

        {/* Limitación de responsabilidad */}
        <section className="sr-card mb-6">
          <h2 className="sr-h2 mb-2">Limitación de responsabilidad</h2>
          <p className="sr-p mb-2">
            Mediazion procura que la información y las herramientas ofrecidas
            sean útiles y estén actualizadas, pero no puede garantizar la
            ausencia total de errores técnicos, interrupciones de servicio o
            inexactitudes puntuales.
          </p>
          <p className="sr-p mb-2">
            Mediazion no se hace responsable del uso que cada mediador/a
            realice de las herramientas ni de las decisiones o acuerdos
            alcanzados en los procesos de mediación, que son responsabilidad
            exclusiva de las partes y del profesional que interviene.
          </p>
          <p className="sr-p mb-2">
            En ningún caso Mediazion será responsable de daños indirectos,
            pérdida de datos o lucro cesante derivados del uso de la plataforma,
            salvo que la ley aplicable disponga expresamente lo contrario.
          </p>
        </section>

        {/* Propiedad intelectual */}
        <section className="sr-card mb-6">
          <h2 className="sr-h2 mb-2">Propiedad intelectual e industrial</h2>
          <p className="sr-p mb-2">
            La denominación Mediazion, el logotipo, el diseño del sitio web, los
            textos, imágenes, código fuente y el resto de elementos que
            conforman la plataforma están protegidos por derechos de propiedad
            intelectual e industrial. Salvo indicación en contrario, dichos
            derechos pertenecen a LA TALAMANQUINA, S.L. o se utilizan bajo
            licencia.
          </p>
          <p className="sr-p mb-2">
            No se permite la reproducción, distribución, transformación,
            comunicación pública o cualquier otro uso no autorizado de estos
            contenidos, salvo autorización expresa y por escrito del titular de
            los derechos o cuando la ley lo permita.
          </p>
        </section>

        {/* Enlaces a terceros */}
        <section className="sr-card mb-6">
          <h2 className="sr-h2 mb-2">Enlaces a terceros</h2>
          <p className="sr-p mb-2">
            El sitio web puede contener enlaces a páginas web de terceros,
            incluidos recursos oficiales, normativa y documentación. Estos
            enlaces se incluyen únicamente a efectos informativos. Mediazion no
            se responsabiliza de los contenidos, servicios o condiciones de uso
            que se ofrezcan en dichos sitios externos.
          </p>
        </section>

        {/* Fuero */}
        <section className="sr-card mb-6">
          <h2 className="sr-h2 mb-2">Legislación aplicable y fuero</h2>
          <p className="sr-p mb-2">
            Con carácter general, las relaciones entre LA TALAMANQUINA, S.L. y
            las personas usuarias de la plataforma se someten a la legislación
            española. Para cualquier controversia que pudiera derivarse del
            acceso o uso de este sitio web, y siempre que la normativa aplicable
            no disponga otra cosa, las partes se someten a los juzgados y
            tribunales de la ciudad de Madrid.
          </p>
        </section>
      </main>
    </>
  );
}
