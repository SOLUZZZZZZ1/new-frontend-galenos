// src/pages/InstruccionesPanel.jsx — Guía de uso del Panel del Mediador
import React from "react";
import Seo from "../components/Seo.jsx";
import { Link } from "react-router-dom";

export default function InstruccionesPanel() {
  return (
    <>
      <Seo
        title="Instrucciones Panel Mediador · Mediazion"
        description="Guía práctica para sacar todo el partido al Panel PRO de Mediazion."
        canonical="https://mediazion.eu/panel-mediador/instrucciones"
      />
      <main
        className="sr-container py-8"
        style={{ minHeight: "calc(100vh - 160px)" }}
      >
        <div className="mb-6">
          <h1 className="sr-h1 mb-2">Instrucciones de uso · Panel del Mediador</h1>
          <p className="sr-p text-zinc-700">
            Aquí tienes una guía rápida para sacar el máximo partido al Panel del
            Mediador. Es distinta a la ayuda general de la web: aquí hablamos de
            IA, actas, agenda, recursos… todo lo que solo ve quien está dentro.
          </p>
        </div>

        {/* 1. Acceso y estados PRO/BASIC */}
        <section className="sr-card mb-6">
          <h2 className="sr-h2 mb-2">1. Acceso y estados PRO / Básico</h2>
          <p className="sr-p mb-2">
            Accedes al panel desde <b>“Acceso mediadores”</b> con tu email y la
            contraseña que te hemos enviado (o la que hayas cambiado).
          </p>
          <ul className="sr-list">
            <li>
              <b>PRO (trial):</b> durante los primeros días verás el panel en modo
              PRO en prueba. Tienes acceso a todas las herramientas.
            </li>
            <li>
              <b>PRO activo:</b> si tienes suscripción, seguirás viendo todo el
              panel PRO sin restricciones.
            </li>
            <li>
              <b>Panel Básico:</b> cuando termina la prueba y no hay suscripción,
              las herramientas avanzadas (IA, actas, recursos, agenda…) se
              desactivan y verás el botón para suscribirte.
            </li>
          </ul>
        </section>

        {/* 2. IA Profesional (incluida visión sobre imágenes) */}
        <section className="sr-card mb-6">
          <h2 className="sr-h2 mb-2">2. IA Profesional (con visión de documentos)</h2>
          <p className="sr-p mb-2">
            La <b>IA Profesional</b> es tu asistente para redactar, resumir,
            revisar y preparar documentos. Además, puede leer <b>imágenes y
            fotos de documentos</b> y extraer el texto para trabajar con él.
          </p>

          <h3 className="sr-h3 mt-2 mb-1">2.1. Cómo usar IA Profesional con texto</h3>
          <ol className="sr-list">
            <li>En el panel, haz clic en <b>🤖 IA Profesional</b>.</li>
            <li>
              Escribe tu consulta: por ejemplo “Redáctame un email para informar
              a las partes de la fecha de la sesión” o “Reescribe este texto en
              un tono más formal”.
            </li>
            <li>
              Si ya tienes un texto, puedes pegarlo directamente y pedir:
              <i> “Revísalo”, “Simplifícalo”, “Resume los puntos clave”, etc.</i>
            </li>
          </ol>

          <h3 className="sr-h3 mt-3 mb-1">2.2. Cómo usar IA Profesional con imágenes (visión)</h3>
          <p className="sr-small text-zinc-700 mb-2">
            Puedes subir <b>fotos de documentos, pantallazos, PDFs convertidos en
            imagen</b>, y la IA es capaz de leerlos y trabajar con el contenido.
          </p>
          <ol className="sr-list">
            <li>En <b>🤖 IA Profesional</b>, utiliza la opción de subir archivo o imagen (icono de clip 📎 o botón “Subir archivo”).</li>
            <li>Selecciona la imagen: una foto de un contrato, un acuerdo firmado, un documento escaneado, etc.</li>
            <li>
              En el mensaje, indica lo que quieres hacer, por ejemplo:
              <ul className="sr-list mt-1">
                <li>“Extrae el texto completo del documento que te adjunto.”</li>
                <li>“Resume el documento en 5 puntos.”</li>
                <li>“Dime las cláusulas importantes y los riesgos para las partes.”</li>
              </ul>
            </li>
            <li>
              La IA leerá la imagen, extraerá el texto y te responderá como si
              hubieras pegado el documento a mano.
            </li>
          </ol>

          <p className="sr-small text-zinc-600 mt-2">
            ➜ Ejemplos de uso: escritos de abogados, correos impresos, acuerdos
            manuscritos, actas antiguas escaneadas, etc.
          </p>
        </section>

        {/* 3. IA Legal */}
        <section className="sr-card mb-6">
          <h2 className="sr-h2 mb-2">3. IA Legal (⚖️)</h2>
          <p className="sr-p mb-2">
            La <b>IA Legal</b> está pensada para consultas más técnicas
            relacionadas con normativa, cláusulas y enfoque jurídico. No sustituye
            al asesoramiento legal, pero te ayuda a:
          </p>
          <ul className="sr-list">
            <li>Plantear mejor las alternativas de acuerdo.</li>
            <li>Detectar puntos delicados en contratos o propuestas.</li>
            <li>Preparar explicaciones claras para las partes.</li>
          </ul>
          <p className="sr-small text-zinc-600 mt-2">
            ➜ Usa IA Legal cuando necesites una visión más estructurada desde el
            punto de vista normativo, y IA Profesional para redacción y estilo.
          </p>
        </section>

        {/* 4. Actas */}
        <section className="sr-card mb-6">
          <h2 className="sr-h2 mb-2">4. Actas 📝</h2>
          <p className="sr-p mb-2">
            En <b>Actas</b> puedes generar borradores de actas de sesión, actas
            finales o documentos internos:
          </p>
          <ol className="sr-list">
            <li>Haz clic en <b>📝 Actas</b> desde el panel.</li>
            <li>Rellena los campos básicos (partes, fecha, tipo de sesión…).</li>
            <li>
              Puedes pedirle a la IA que te proponga un texto base y luego
              ajustarlo tú.
            </li>
          </ol>
        </section>

        {/* 5. Casos */}
        <section className="sr-card mb-6">
          <h2 className="sr-h2 mb-2">5. Casos 🗂️</h2>
          <p className="sr-p mb-2">
            En <b>Casos</b> tendrás la vista de tus expedientes: cada conflicto,
            con su información, documentos y evolución.
          </p>
          <ul className="sr-list">
            <li>Crear un nuevo caso con los datos esenciales.</li>
            <li>Asociar notas, ideas y próximos pasos.</li>
            <li>
              Vincular la agenda y, próximamente, videollamadas y documentos
              directamente al caso.
            </li>
          </ul>
        </section>

        {/* 6. Agenda */}
        <section className="sr-card mb-6">
          <h2 className="sr-h2 mb-2">6. Agenda 🗓️</h2>
          <p className="sr-p mb-2">
            La <b>Agenda</b> te sirve para marcar sesiones, recordatorios y
            tareas relacionadas con tus casos:
          </p>
          <ol className="sr-list">
            <li>Haz clic en <b>🗓️ Agenda</b>.</li>
            <li>Crea citas con fecha, hora y descripción.</li>
            <li>
              Cuando esté activado el enlace con <b>Casos</b>, podrás escoger a
              qué caso pertenece cada cita, para ver todo unificado.
            </li>
          </ol>
        </section>

                {/* 7. Recursos */}
        <section className="sr-card mb-6">
          <h2 className="sr-h2 mb-2">7. Recursos 💳</h2>
          <p className="sr-p mb-2">
            La sección <b>Recursos</b> agrupa herramientas y enlaces útiles para
            tu práctica profesional.
          </p>
          <ul className="sr-list">
            <li>Acceso a materiales, utilidades y enlaces que iremos activando.</li>
            <li>Modelos, plantillas y documentación de apoyo para tu trabajo diario.</li>
            <li>En el futuro, accesos directos a opciones de cobro y otras integraciones.</li>
          </ul>
        </section>

        {/* 8. Perfil y seguridad */}
        <section className="sr-card mb-6">
          <h2 className="sr-h2 mb-2">8. Perfil y seguridad 👤</h2>
          <p className="sr-p mb-2">
            En <b>Perfil</b> puedes completar tu ficha profesional (foto, bio,
            web, especialidad…) y cambiar tu contraseña.
          </p>
          <ul className="sr-list">
            <li>
              <b>Foto y CV:</b> sube tu avatar y tu CV en PDF para mostrar una
              imagen profesional.
            </li>
            <li>
              <b>Contraseña:</b> usa el bloque “Cambio de contraseña” para
              actualizarla cuando quieras.
            </li>
          </ul>
        </section>

        {/* 9. Voces */}
        <section className="sr-card mb-6">
          <h2 className="sr-h2 mb-2">9. Voces 🖊️ / 📰</h2>
          <p className="sr-p mb-2">
            La sección <b>Voces</b> te permite escribir contenidos (artículos,
            reflexiones, casos de éxito…) y aparecer en el blog público:
          </p>
          <ul className="sr-list">
            <li>
              <b>Voces (publicar) 🖊️:</b> crear un nuevo artículo desde tu
              panel. Puedes usar IA para ayudarte a redactar y pulir el texto.
            </li>
            <li>
              <b>Voces (público) 📰:</b> ver cómo se muestran tus artículos y
              los de otros mediadores.
            </li>
            <li>
              <b>Moderación IA:</b> antes de publicar, puedes pedir a la IA que
              revise el texto (tono, claridad, posibles datos sensibles) para
              asegurarte de que refleja bien tu trabajo.
            </li>
          </ul>
        </section>

        {/* Próximamente: videollamadas */}
        <section className="sr-card mb-6">
          <h2 className="sr-h2 mb-2">Próximamente: Videollamadas integradas</h2>
          <p className="sr-p mb-2">
            Está previsto integrar <b>videollamadas</b> directamente en el Panel
            del Mediador, de forma que puedas:
          </p>
          <ul className="sr-list">
            <li>Agendar videollamadas desde la Agenda.</li>
            <li>Vincular cada videollamada a un Caso concreto.</li>
            <li>
              Tener en un solo lugar: datos del caso, actas, IA y enlace a
              videollamada.
            </li>
          </ul>
          <p className="sr-small text-zinc-600 mt-2">
            ➜ Cuando esté activo, lo verás como una opción más dentro de Agenda
            y Casos.
          </p>
        </section>

        {/* Enlace de retorno al panel */}
        <section className="sr-card mb-10">
          <p className="sr-p mb-2">
            Cuando quieras volver al panel principal, puedes usar el menú o este
            enlace:
          </p>
          <Link to="/panel-mediador" className="sr-btn-secondary">
            ← Volver al Panel del Mediador
          </Link>
        </section>
      </main>
    </>
  );
}
