import React from "react";

export default function AvisoLegal() {
  return (
    <main className="sr-container py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Aviso Legal</h1>

      <section className="space-y-4 text-slate-700">
        <p>
          En cumplimiento de la normativa vigente, se informa de que el presente
          sitio web <strong>galenos.pro</strong> es titularidad de:
        </p>

        <ul className="list-disc list-inside">
          <li><strong>Titular:</strong> LA TALAMANQUINA, S.L.</li>
          <li><strong>NIF:</strong> B75440115</li>
          <li><strong>Domicilio social:</strong> Calle Velázquez, 15 – 28001 Madrid (España)</li>
          <li><strong>Correo electrónico:</strong> admin@galenos.pro</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">Objeto</h2>
        <p>
          El sitio web galenos.pro ofrece información y acceso a una plataforma
          digital dirigida a profesionales sanitarios, destinada a apoyar la
          organización y análisis de información clínica de forma orientativa.
        </p>

        <h2 className="text-xl font-semibold mt-6">Condiciones de uso</h2>
        <p>
          El acceso y uso de este sitio web atribuye la condición de usuario e
          implica la aceptación plena de las presentes condiciones. El usuario
          se compromete a hacer un uso adecuado, lícito y responsable del sitio
          web y de la plataforma.
        </p>

        <h2 className="text-xl font-semibold mt-6">Responsabilidad</h2>
        <p>
          Galenos.pro es una herramienta de apoyo al médico. No diagnostica, no
          prescribe ni sustituye el criterio clínico profesional. La decisión
          clínica final corresponde siempre al médico responsable.
        </p>

        <h2 className="text-xl font-semibold mt-6">Propiedad intelectual</h2>
        <p>
          Todos los contenidos, textos, diseños, código y elementos del sitio
          web son titularidad de LA TALAMANQUINA, S.L. o de terceros autorizados,
          quedando prohibida su reproducción sin autorización expresa.
        </p>
      </section>
    </main>
  );
}
