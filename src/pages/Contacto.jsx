import React from "react";

export default function Contacto() {
  return (
    <main className="sr-container py-10 max-w-3xl">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold text-slate-900">Contacto</h1>
        <p className="text-lg text-slate-700">
          Si eres médico/profesional sanitario y quieres conocer Galenos.pro, o necesitas soporte, puedes contactarnos.
        </p>
      </header>

      <section className="mt-8 space-y-4 text-slate-700">
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2">
          <p className="text-sm text-slate-600">Correo de contacto</p>
          <p className="text-base font-semibold text-slate-900">
            soporte@galenos.pro
          </p>
          <p className="text-sm text-slate-600">
            
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm text-slate-700">
            <strong>Uso profesional:</strong> Galenos.pro es una herramienta de apoyo al médico. No diagnostica ni prescribe.
            La decisión clínica final corresponde siempre al médico responsable.
          </p>
        </div>
      </section>
    </main>
  );
}
