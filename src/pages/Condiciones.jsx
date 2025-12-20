import React from "react";

export default function Condiciones() {
  return (
    <main className="sr-container py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Condiciones de Uso</h1>

      <section className="space-y-4 text-slate-700">
        <p>
          Galenos.pro es una plataforma dirigida exclusivamente a profesionales
          sanitarios, diseñada como herramienta de apoyo al análisis y
          organización de información clínica.
        </p>

        <h2 className="text-xl font-semibold mt-6">Uso profesional</h2>
        <p>
          El usuario declara que utiliza la plataforma en el ejercicio de su
          actividad profesional y que asume íntegramente la responsabilidad
          derivada de las decisiones clínicas adoptadas.
        </p>

        <h2 className="text-xl font-semibold mt-6">Limitación de responsabilidad</h2>
        <p>
          Galenos.pro no ofrece diagnósticos, tratamientos ni prescripciones.
          Cualquier información generada tiene carácter orientativo y debe ser
          validada por el profesional sanitario.
        </p>

        <h2 className="text-xl font-semibold mt-6">Prohibiciones</h2>
        <ul className="list-disc list-inside">
          <li>Uso contrario a la ley o a la buena fe</li>
          <li>Introducción de datos sin legitimación legal</li>
          <li>Uso de la plataforma con fines ilícitos</li>
        </ul>

        <p className="mt-6">
          El incumplimiento de estas condiciones podrá dar lugar a la suspensión
          o cancelación del acceso a la plataforma.
        </p>
      </section>
    </main>
  );
}
