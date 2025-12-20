import React from "react";

export default function Cookies() {
  return (
    <main className="sr-container py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Política de Cookies</h1>

      <section className="space-y-4 text-slate-700">
        <p>
          El sitio web galenos.pro utiliza únicamente cookies técnicas y de
          sesión necesarias para el funcionamiento de la plataforma.
        </p>

        <h2 className="text-xl font-semibold mt-6">Tipos de cookies</h2>
        <ul className="list-disc list-inside">
          <li>Cookies técnicas necesarias para la navegación</li>
          <li>Cookies de sesión para mantener la autenticación del usuario</li>
        </ul>

        <p>
          En la actualidad, galenos.pro no utiliza cookies publicitarias ni de
          seguimiento de terceros.
        </p>

        <h2 className="text-xl font-semibold mt-6">Gestión de cookies</h2>
        <p>
          El usuario puede configurar su navegador para bloquear o eliminar
          cookies. La desactivación de cookies técnicas puede afectar al
          funcionamiento del sitio.
        </p>
      </section>
    </main>
  );
}
