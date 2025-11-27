// src/pages/Ayuda.jsx — Manual de uso MEDIAZION
import React from "react";
import Seo from "../components/Seo.jsx";

export default function Ayuda() {
  return (
    <>
      <Seo
        title="Ayuda · Manual de uso MEDIAZION"
        description="Guía completa para usar MEDIAZION: panel profesional, IA, documentos, perfil, directorio y más."
      />

      <main className="sr-container py-10">
        <h1 className="sr-h1 mb-6">Ayuda / Manual de Usuario</h1>

        <p className="sr-p mb-8 text-zinc-700">
          Bienvenido/a a la guía oficial de uso de MEDIAZION. Aquí encontrarás
          explicaciones claras de cada sección: Panel del mediador, IA
          Profesional, Perfil, Directorio, Voces, Actualidad y mucho más.
        </p>

        {/* Secciones */}
        <div className="space-y-10">

          {/* 1. Acceso */}
          <section>
            <h2 className="sr-h2 mb-3">1. Acceso al Panel del Mediador</h2>
            <p className="sr-p">
              Para acceder al área profesional, utiliza la pestaña <b>Panel</b>.
              Si es tu primera vez, podrás registrarte desde la sección de{" "}
              <b>Mediadores → Alta gratuita</b>.
            </p>
            <p className="sr-p">
              Dentro del panel encontrarás la IA Profesional, tu perfil, agenda,
              casos, plantillas y herramientas exclusivas del servicio.
            </p>
          </section>

          {/* 2. Perfil */}
          <section>
            <h2 className="sr-h2 mb-3">2. Perfil del Mediador</h2>
            <p className="sr-p">
              En <b>Panel → Mi perfil</b> puedes editar tus datos profesionales,
              subir foto (avatar), curriculum, añadir tu provincia, especialidad
              y biografía. Estos datos son los que se muestran en el{" "}
              <b>Directorio</b>.
            </p>
            <ul className="sr-list">
              <li>La foto y los documentos se guardan de forma segura.</li>
              <li>Tu correo NO se muestra públicamente, solo tu alias.</li>
              <li>Puedes actualizar tu CV o avatar en cualquier momento.</li>
            </ul>
          </section>

          {/* 3. Directorio */}
          <section>
            <h2 className="sr-h2 mb-3">3. Directorio de Mediadores</h2>
            <p className="sr-p">
              El directorio reúne mediadores activos de MEDIAZION. Para aparecer
              correctamente:
            </p>
            <ul className="sr-list">
              <li>Completa tu perfil (alias, bio, provincia, especialidad).</li>
              <li>Sube tu avatar para una imagen más profesional.</li>
            </ul>
            <p className="sr-p">
              Desde aquí, otros profesionales y usuarios pueden encontrar tu
              perfil público y tu especialidad.
            </p>
          </section>

          {/* 4. IA Profesional */}
          <section>
            <h2 className="sr-h2 mb-3">4. IA Profesional</h2>
            <p className="sr-p">
              Esta herramienta te permite redactar actas, acuerdos, resúmenes de
              sesiones, comunicaciones y mucho más.
            </p>
            <ul className="sr-list">
              <li>Puedes escribir tu petición directamente.</li>
              <li>O usar los <b>presets</b> (Acta estándar, Resumen, Correo...).</li>
              <li>La IA recuerda el contexto de la conversación actual.</li>
              <li>
                El botón <b>“Limpiar conversación”</b> reinicia el chat.
              </li>
              <li>
                Puedes adjuntar documentos PDF/DOCX/TXT/MD para análisis y
                generación avanzada.
              </li>
            </ul>
            <p className="sr-p">
              Próximamente: análisis de imágenes y documentos escaneados. 
              
            </p>
          </section>

          {/* 5. Voces */}
          <section>
            <h2 className="sr-h2 mb-3">5. Voces</h2>
            <p className="sr-p">
              La sección <b>Voces</b> contiene artículos y reflexiones
              publicados por mediadores. Puedes:
            </p>
            <ul className="sr-list">
              <li>Publicar tus propias reflexiones desde el Panel.</li>
              <li>Leer artículos de otros profesionales.</li>
              <li>Comentar si eres usuario PRO.</li>
            </ul>
          </section>

          {/* 6. Actualidad */}
          <section>
            <h2 className="sr-h2 mb-3">6. Actualidad Jurídica</h2>
            <p className="sr-p">
              Esta sección muestra automáticamente noticias recientes relacionadas
              con mediación, procedentes del BOE, Confilegal, LegalToday y el CGPJ.
            </p>
            <p className="sr-p">
              Puedes filtrar noticias utilizando el buscador de la parte superior.
            </p>
          </section>

          {/* 7. Tarifas y PRO */}
          <section>
            <h2 className="sr-h2 mb-3">7. Suscripción PRO</h2>
            <p className="sr-p">
              La modalidad <b>PRO</b> activa:
            </p>
            <ul className="sr-list">
              <li>IA Profesional completa</li>
              <li>IA Legal</li>
              <li>Plantillas avanzadas</li>
              <li>Comentarios en Voces</li>
              <li>Análisis documental</li>
            </ul>
          </section>

          {/* 8. Contacto */}
          <section>
            <h2 className="sr-h2 mb-3">8. Soporte / Contacto</h2>
            <p className="sr-p">
              Si necesitas ayuda adicional o detectas algún error, puedes escribir
              desde la página de <b>Contacto</b> o desde tu Panel profesional.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
