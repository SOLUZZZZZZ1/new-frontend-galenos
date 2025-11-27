// src/pages/Pagos.jsx — Recursos para mediadores (Modelos + Enlaces + IA)
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../components/Seo.jsx";

const LS_EMAIL = "mediador_email";

function ModeloCard({ titulo, descripcion, children }) {
  const [open, setOpen] = useState(false);

  return (
    <article className="sr-card">
      <div className="flex items-center justify-between gap-2 mb-1">
        <h3 className="sr-h3">{titulo}</h3>
        <button
          type="button"
          className="sr-btn-secondary"
          onClick={() => setOpen(!open)}
        >
          {open ? "Ocultar modelo" : "Ver modelo"}
        </button>
      </div>
      {descripcion && (
        <p className="sr-small text-zinc-600 mb-2">{descripcion}</p>
      )}
      {open && (
        <div className="mt-2">
          <pre className="sr-p whitespace-pre-wrap text-sm bg-zinc-50 p-3 rounded-lg border border-zinc-200">
            {children}
          </pre>
        </div>
      )}
    </article>
  );
}

export default function Pagos() {
  const nav = useNavigate();
  const email = localStorage.getItem(LS_EMAIL) || "";

  function goPanel() {
    if (!email) {
      nav("/acceso");
      return;
    }
    nav("/panel-mediador");
  }

  function goIA() {
    if (!email) {
      nav("/acceso");
      return;
    }
    nav("/panel-mediador/ai");
  }

  return (
    <>
      <Seo
        title="Recursos para mediadores · Panel PRO"
        description="Modelos y recursos básicos para la práctica diaria de mediación."
      />
      <main
        className="sr-container py-8"
        style={{ minHeight: "calc(100vh - 160px)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="sr-h1">📚 Recursos para mediadores</h1>
          <button className="sr-btn-secondary" onClick={goPanel}>
            ← Volver al Panel PRO
          </button>
        </div>

        <p className="sr-p text-zinc-700 mb-6">
          En esta sección encontrarás recursos básicos que te pueden ayudar en
          tu práctica diaria como mediador: modelos orientativos y guías que
          puedes adaptar a cada caso. Te recomendamos combinarlos con la{" "}
          <button
            type="button"
            className="sr-link"
            style={{ textDecoration: "underline" }}
            onClick={goIA}
          >
            IA Profesional
          </button>{" "}
          para personalizarlos.
        </p>

        {/* MODELOS DE DOCUMENTOS */}
        <section className="sr-card mb-6">
          <h2 className="sr-h2 mb-3">📄 Modelos de documentos</h2>
          <p className="sr-small text-zinc-600 mb-4">
            Estos modelos son orientativos. No sustituyen asesoramiento
            jurídico. Úsalos como base y adapta siempre el contenido a la
            situación concreta.
          </p>

          <div className="grid gap-3">
            <ModeloCard
              titulo="Acta inicial de mediación"
              descripcion="Modelo orientativo de acta para la sesión inicial."
            >
{`ACTA INICIAL DE MEDIACIÓN

En [lugar], a [fecha].

REUNIDOS

De una parte, D./Dª [Nombre Parte A], con DNI [número], en lo sucesivo “Parte A”.
De otra parte, D./Dª [Nombre Parte B], con DNI [número], en lo sucesivo “Parte B”.
Y actuando como mediador/a, D./Dª [Nombre del mediador], con número de registro [número].

MANIFIESTAN

1. Que las partes han decidido acudir voluntariamente al procedimiento de mediación para intentar resolver el conflicto relativo a:
   [Descripción breve del conflicto].

2. Que han sido informadas de la naturaleza del procedimiento, su carácter voluntario y confidencial, así como del papel neutral del mediador/a.

3. Que han sido informadas de la duración aproximada, costes y funcionamiento básico de las sesiones.

ACUERDAN

1. Iniciar el procedimiento de mediación con fecha [fecha].
2. Comprometerse a participar de buena fe y con respeto mutuo.
3. Mantener la confidencialidad de la información compartida durante el proceso, en los términos previstos en la normativa vigente.
4. Abonar los honorarios acordados, que serán de [importe y forma de pago], salvo que se pacte otra cosa por escrito.

Y en prueba de conformidad, firman la presente acta inicial en el lugar y fecha indicados.

La Parte A: _______________________

La Parte B: _______________________

El/La mediador/a: __________________
`}
            </ModeloCard>

            <ModeloCard
              titulo="Acta final de mediación"
              descripcion="Modelo orientativo para cierre de proceso, con o sin acuerdo."
            >
{`ACTA FINAL DE MEDIACIÓN

En [lugar], a [fecha].

REUNIDOS

D./Dª [Nombre Parte A] y D./Dª [Nombre Parte B], asistidos por el/la mediador/a D./Dª [Nombre del mediador].

EXPONEN

1. Que el proceso de mediación se ha desarrollado entre las fechas [fecha inicio] y [fecha fin].
2. Que se han llevado a cabo [número] sesiones, en las que las partes han tenido oportunidad de exponer sus posiciones e intereses.

RESULTADO

[Seleccionar la opción que proceda:]

A) CON ACUERDO
Las partes han alcanzado un acuerdo respecto de:
[Descripción del acuerdo alcanzado].

Las partes manifiestan que el acuerdo ha sido libremente aceptado, que comprenden su contenido y que se ajusta a sus intereses.

B) SIN ACUERDO
Las partes no han alcanzado un acuerdo, manteniéndose la posibilidad de acudir a otros medios de resolución de conflictos (negociación directa, arbitraje, vía judicial, etc.).

Y en prueba de conformidad, firman la presente acta final en el lugar y fecha arriba indicados.

La Parte A: _______________________

La Parte B: _______________________

El/La mediador/a: __________________
`}
            </ModeloCard>

            <ModeloCard
              titulo="Acuerdo de mediación"
              descripcion="Modelo orientativo de acuerdo entre las partes."
            >
{`ACUERDO DE MEDIACIÓN

En [lugar], a [fecha].

REUNIDOS

D./Dª [Nombre Parte A], con DNI [número].
D./Dª [Nombre Parte B], con DNI [número].

EXPONEN

1. Que las partes han participado en un procedimiento de mediación relativo a:
   [Descripción del conflicto].

2. Que, tras las sesiones celebradas, han alcanzado voluntariamente el siguiente acuerdo:

ACUERDOS

Primero: [Cláusula 1 – obligación concreta de una o ambas partes].
Segundo: [Cláusula 2 – plazos, cantidades, actuaciones].
Tercero: [Forma de cumplimiento, garantías, seguimiento].
Cuarto: [Cualquier otra cláusula que las partes estimen conveniente].

Las partes reconocen que:

- Han intervenido libremente.
- Comprenden el alcance del acuerdo.
- Se comprometen a cumplirlo de buena fe.

Y en prueba de conformidad, firman el presente acuerdo por duplicado ejemplar.

La Parte A: _______________________

La Parte B: _______________________
`}
            </ModeloCard>

            <ModeloCard
              titulo="Correo de confirmación / convocatoria"
              descripcion="Texto base para citar a las partes a una sesión."
            >
{`ASUNTO: Convocatoria a sesión de mediación

Estimado/a [Nombre]:

En relación con el procedimiento de mediación sobre [breve referencia del asunto], le confirmamos la celebración de la sesión de mediación en la fecha y hora:

Día: [día]
Hora: [hora]
Lugar / Enlace videollamada: [dirección física o enlace online]

Le recordamos que la mediación es un procedimiento voluntario y confidencial, en el que el mediador/a actúa de forma neutral para ayudar a las partes a alcanzar, si es posible, un acuerdo beneficioso para todos.

Le rogamos que confirme su asistencia respondiendo a este correo.

Atentamente,

[Nombre y apellidos del mediador/a]
[Datos de contacto]
[Información de Mediazion, si procede]
`}
            </ModeloCard>
          </div>
        </section>

        {/* ENLACES RECOMENDADOS */}
        <section className="sr-card mb-6">
          <h2 className="sr-h2 mb-3">📚 Enlaces recomendados</h2>
          <p className="sr-small text-zinc-600 mb-3">
            Selección de normativa y recursos oficiales sobre mediación civil, mercantil y comunitaria.
          </p>
          <ul className="list-disc ml-6 text-sm text-zinc-700 space-y-1">
            <li>
              <a
                href="https://www.boe.es/buscar/act.php?id=BOE-A-2012-9112"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-700 underline"
              >
                Ley 5/2012, de mediación en asuntos civiles y mercantiles (BOE)
              </a>
            </li>
            <li>
              <a
                href="https://www.boe.es/buscar/doc.php?id=BOE-A-2013-13316"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-700 underline"
              >
                Real Decreto 980/2013, de desarrollo de la Ley 5/2012 (BOE)
              </a>
            </li>
            <li>
              <a
                href="https://www.mjusticia.gob.es/es/AreaTematica/Documentacion/Documents/GuiaBuenasPracticas.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-700 underline"
              >
                Guía de Buenas Prácticas en Mediación · Ministerio de Justicia
              </a>
            </li>
            <li>
              <a
                href="https://www.mjusticia.gob.es/es/AreaTematica/Documentacion/Documents/GuiaPartesMediacion.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-700 underline"
              >
                Guía para las partes en mediación · Ministerio de Justicia
              </a>
            </li>
            <li>
              <a
                href="https://www.poderjudicial.es/cgpj/es/Temas/Mediacion/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-700 underline"
              >
                Información y recursos sobre mediación · Consejo General del Poder Judicial
              </a>
            </li>
            <li>
              <a
                href="https://ec.europa.eu/info/policies/justice-and-fundamental-rights/civil-justice/alternative-dispute-resolution-mediation_es"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-700 underline"
              >
                Mediación y resolución alternativa de litigios · Comisión Europea
              </a>
            </li>
          </ul>
        </section>
      </main>
    </>
  );
}
