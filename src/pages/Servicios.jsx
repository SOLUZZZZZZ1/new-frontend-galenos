// src/pages/Servicios.jsx — con prólogo completo y contenedor ampliado
import React from "react";
import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";

export default function Servicios() {
  return (
    <>
      <Seo
        title="Servicios de mediación civil, mercantil y familiar · MEDIAZION"
        description="Mediación, conciliación y formación en gestión de conflictos. Civil, mercantil y familiar. Webinars y cursos de formación profesional."
        canonical="https://mediazion.eu/servicios"
      />
      <main
        className="min-h-[calc(100vh-80px)]"
        style={{
          backgroundImage: "url('/marmol.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          padding: "40px 20px 80px", // margen inferior extra
        }}
      >
        <div
          style={{
            maxWidth: "950px",
            margin: "0 auto",
            background: "rgba(255,255,255,0.95)",
            borderRadius: "20px",
            padding: "40px 36px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            border: "1px solid rgba(0,0,0,0.08)",
            color: "#0f172a",
          }}
        >
          {/* PRÓLOGO COMPLETO */}
          <section className="sr-card" style={{ background: "rgba(255,255,255,0.98)", marginBottom: 24 }}>
            <h2 className="sr-h2">Prólogo · Manual de Mediación y MASC</h2>

            <p className="sr-p">
              La sociedad moderna, en sus ámbitos civiles y mercantiles, es una sociedad dinámica a la vez que conflictiva.
              Necesita herramientas aceptadas que le ayuden a que el dinamismo no se atasque cuando un conflicto se produce.
              Los tribunales de Justicia antaño ponían paz —o estaban para eso— pero son lentos y costosos para ciertas
              necesidades actuales. Por eso tienen cabida los Métodos Adecuados de Solución de Controversias (MASC),
              entre los que destaca la Mediación.
            </p>

            <p className="sr-p">
              Es un método antiguo que, bien empleado, solucionará no pocos conflictos, descargando el sistema judicial y dando
              respuestas apropiadas a problemas que agilizan las relaciones civiles y mercantiles. Por ello es necesario formar
              mediadores y preparar a otros profesionales para que aprendan a emplear este método de resolución de controversias,
              pues la ley reconoce que un acta de mediación con avenencia tiene valor de sentencia y, en caso de incumplimiento,
              puede ser ejecutada judicialmente.
            </p>

            <p className="sr-p">
              En <strong>MEDIAZION</strong>, creemos que la excelencia profesional se alcanza cuando el conocimiento técnico se
              combina con una ética firme y una mirada humana. Este Manual de Mediación y Métodos Alternativos de Resolución de
              Conflictos nace con la vocación de ofrecer una guía clara, rigurosa y práctica para quienes trabajan cada día por
              la paz social: profesionales del Derecho, mediadores, psicólogos, trabajadores sociales, funcionarios públicos,
              directivos y cualquier persona comprometida con la transformación positiva de los conflictos.
            </p>

            <p className="sr-p">
              La obra que tiene en sus manos reúne fundamentos, metodologías y herramientas que dialogan con los estándares
              europeos y las mejores prácticas internacionales. Aborda la mediación como un proceso estructurado y flexible,
              analiza la conciliación y el arbitraje, ofrece modelos de actas y documentos esenciales, y explora los desafíos
              y oportunidades que plantean las tecnologías emergentes —incluida la inteligencia artificial— en el ecosistema
              de los MASC.
            </p>

            <p className="sr-p">
              Que estas páginas sirvan como brújula para navegar los desafíos del presente y como impulso para continuar
              construyendo entornos más justos, colaborativos y humanos. Desde MEDIAZION —con la mirada puesta en el interés
              superior de las personas y el bien común— reafirmamos nuestro compromiso con una cultura del entendimiento
              que honre la dignidad, la diversidad y la paz.
            </p>

            <p className="sr-p" style={{ textAlign: "right", marginTop: "12px" }}>
              <strong>Mario Rondán Braida</strong><br />
              Director de MEDIAZION – Centro de Mediación y Resolución de Conflictos
            </p>
          </section>

          {/* SERVICIOS */}
          <h1 className="sr-h1" style={{ marginBottom: 10 }}>Servicios</h1>
          <p className="sr-p">
            Intervenimos en ámbitos civiles, mercantiles y familiares, tanto en la prevención como en la resolución de conflictos.
          </p>

          <div className="sr-grid-3 mt-6">
            <div className="sr-card" style={{ background: "rgba(255,255,255,0.98)" }}>
              <h3 className="sr-h3">Mediación civil</h3>
              <p className="sr-p">Conflictos vecinales, arrendamientos, herencias y familia.</p>
            </div>
            <div className="sr-card" style={{ background: "rgba(255,255,255,0.98)" }}>
              <h3 className="sr-h3">Mediación mercantil</h3>
              <p className="sr-p">Societario, contratos, proveedores y clientes.</p>
            </div>
            <div className="sr-card" style={{ background: "rgba(255,255,255,0.98)" }}>
              <h3 className="sr-h3">Formación y prevención</h3>
              <p className="sr-p">Cultura del acuerdo, negociación y gestión temprana.</p>
            </div>
          </div>

          {/* CURSOS */}
          <section className="sr-card mt-6" style={{ background: "rgba(255,255,255,0.98)" }}>
            <h2 className="sr-h2">Cursos de formación</h2>

            <div className="sr-card" style={{ marginTop: 12 }}>
              <h3 className="sr-h3">Mediación aplicada (20h)</h3>
              <p className="sr-p"><strong>Técnicas de escucha, gestión emocional y redacción de acuerdos.</strong></p>
              <Link to="/servicios/curso/mediacion-aplicada-20h" className="text-blue-600 underline">Ver detalle</Link>
            </div>

            <div className="sr-card" style={{ marginTop: 18 }}>
              <h3 className="sr-h3">Negociación estratégica (12h)</h3>
              <p className="sr-p"><strong>Herramientas prácticas: preparación, comunicación, objeciones y cierre.</strong></p>
              <Link to="/servicios/curso/negociacion-estrategica-12h" className="text-blue-600 underline">Ver detalle</Link>
            </div>

            <div className="sr-card" style={{ marginTop: 18 }}>
              <h3 className="sr-h3">Compliance y resolución temprana (8h)</h3>
              <p className="sr-p"><strong>Integra la gestión de conflictos en programas de cumplimiento.</strong></p>
              <Link to="/servicios/curso/compliance-resolucion-8h" className="text-blue-600 underline">Ver detalle</Link>
            </div>
          </section>

          {/* WEBINARS */}
          <section className="sr-card mt-6" style={{ background: "rgba(255,255,255,0.98)" }}>
            <h2 className="sr-h2">Webinars</h2>

            <div className="sr-card" style={{ marginTop: 12 }}>
              <h3 className="sr-h3">Clínica de casos civiles</h3>
              <p className="sr-p"><strong>Buenas prácticas en mediación vecinal y familiar. 60 minutos.</strong></p>
              <Link to="/servicios/webinar/clinica-casos-civiles" className="text-blue-600 underline">Ver detalle</Link>
            </div>

            <div className="sr-card" style={{ marginTop: 18 }}>
              <h3 className="sr-h3">Mediación mercantil hoy</h3>
              <p className="sr-p"><strong>Tendencias y estrategias actuales. 45 minutos.</strong></p>
              <Link to="/servicios/webinar/mediacion-mercantil-hoy" className="text-blue-600 underline">Ver detalle</Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
