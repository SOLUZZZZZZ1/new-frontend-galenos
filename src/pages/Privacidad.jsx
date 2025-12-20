import React from "react";

export default function Privacidad() {
  return (
    <main className="sr-container py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Política de Privacidad</h1>

      <section className="space-y-4 text-slate-700">
        <p>
          LA TALAMANQUINA, S.L. se compromete a tratar los datos personales de
          conformidad con el Reglamento (UE) 2016/679 (RGPD) y la normativa
          española vigente en materia de protección de datos.
        </p>

        <h2 className="text-xl font-semibold mt-6">Responsable del tratamiento</h2>
        <ul className="list-disc list-inside">
          <li><strong>Responsable:</strong> LA TALAMANQUINA, S.L.</li>
          <li><strong>Email:</strong> admin@galenos.pro</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">Datos tratados</h2>
        <p>
          Se tratan únicamente los datos necesarios para la gestión del acceso,
          uso de la plataforma y comunicaciones con el usuario profesional
          (correo electrónico, datos profesionales, mensajes enviados).
        </p>

        <p>
          Galenos.pro está destinada a uso profesional sanitario. El usuario es
          responsable de no introducir datos identificativos de pacientes salvo
          que sea legalmente responsable de su tratamiento.
        </p>

        <h2 className="text-xl font-semibold mt-6">Finalidad</h2>
        <ul className="list-disc list-inside">
          <li>Gestión de cuentas y acceso a la plataforma</li>
          <li>Soporte y comunicaciones relacionadas con el servicio</li>
          <li>Mejora y mantenimiento del sistema</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">Derechos</h2>
        <p>
          El usuario puede ejercer sus derechos de acceso, rectificación,
          supresión, limitación u oposición mediante solicitud a
          <strong> admin@galenos.pro</strong>.
        </p>

        <h2 className="text-xl font-semibold mt-6">Conservación</h2>
        <p>
          Los datos se conservarán mientras exista relación con el usuario o
          durante el tiempo necesario para cumplir obligaciones legales.
        </p>
      </section>
    </main>
  );
}
