import React from "react";

export default function QueEsGalenos() {
  return (
    <main className="sr-container py-10 max-w-4xl">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold text-slate-900">Qué es Galenos.pro</h1>
        <p className="text-lg text-slate-700">
          Galenos.pro es una plataforma clínica para médicos que ayuda a organizar información,
          interpretar analíticas e imágenes médicas y mantener un timeline por paciente de forma
          prudente y segura.
        </p>
      </header>

      <section className="mt-8 space-y-4 text-slate-700">
        <h2 className="text-xl font-semibold text-slate-900">Para qué sirve</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong>Historias clínicas extensas:</strong> resume texto clínico largo y extrae puntos clave para
            facilitar la lectura.
          </li>
          <li>
            <strong>Analíticas:</strong> identifica marcadores, rangos y valores relevantes y genera un resumen orientativo.
          </li>
          <li>
            <strong>Imágenes médicas (RX/TAC/RM/ECO):</strong> organiza y aporta un resumen prudente para apoyar la valoración.
          </li>
          <li>
            <strong>Timeline:</strong> reúne analíticas, imágenes y notas clínicas en una cronología clara por paciente.
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-slate-900 mt-8">Filosofía clínica</h2>
        <p>
          Galenos.pro está diseñado como <strong>herramienta de apoyo</strong>. No sustituye la exploración, el juicio
          clínico, la indicación terapéutica ni la responsabilidad del médico. Su objetivo es reducir burocracia,
          mejorar la organización y ayudar a interpretar información de forma más rápida y estructurada.
        </p>

        <h2 className="text-xl font-semibold text-slate-900 mt-8">Para quién es</h2>
        <p>
          Para médicos y profesionales sanitarios que trabajan con pacientes y necesitan una forma segura de
          gestionar documentación clínica, analíticas e informes de imagen en un entorno digital moderno.
        </p>

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-700">
            <strong>Nota:</strong> Galenos.pro no diagnostica ni prescribe. La decisión clínica final corresponde
            siempre al médico responsable.
          </p>
        </div>
      </section>
    </main>
  );
}
