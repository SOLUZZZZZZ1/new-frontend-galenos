import React from "react";

export default function Seguridad() {
  return (
    <main className="sr-container py-10 max-w-4xl">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold text-slate-900">Seguridad y privacidad</h1>
        <p className="text-lg text-slate-700">
          En Galenos.pro priorizamos la seguridad y el uso responsable. El sistema está pensado para trabajar con
          información clínica de forma profesional, evitando riesgos y promoviendo buenas prácticas.
        </p>
      </header>

      <section className="mt-8 space-y-4 text-slate-700">
        <h2 className="text-xl font-semibold text-slate-900">Buenas prácticas</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong>No subas datos identificativos</strong> si no es estrictamente necesario. Prioriza el uso de alias.
          </li>
          <li>
            Usa <strong>contraseñas robustas</strong> y no compartas credenciales.
          </li>
          <li>
            Mantén el acceso controlado: Galenos.pro está orientado a uso profesional sanitario.
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-slate-900 mt-8">Apoyo al médico, no sustitución</h2>
        <p>
          Los resúmenes, marcadores y respuestas generadas tienen carácter <strong>orientativo</strong>. No sustituyen
          la valoración clínica completa ni la responsabilidad del profesional. El médico debe revisar siempre el
          contexto, la exploración, pruebas complementarias y guías clínicas aplicables.
        </p>

        <h2 className="text-xl font-semibold text-slate-900 mt-8">Transparencia y control</h2>
        <p>
          Galenos.pro está diseñado para que el médico mantenga el control del proceso: organización,
          visualización y apoyo a la interpretación, con foco en reducir carga administrativa y mejorar claridad.
        </p>

        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm text-slate-700">
            <strong>Recordatorio:</strong> la decisión clínica final corresponde siempre al médico responsable.
            Si tienes dudas, contrasta con protocolos, especialistas y el contexto del paciente.
          </p>
        </div>
      </section>
    </main>
  );
}
