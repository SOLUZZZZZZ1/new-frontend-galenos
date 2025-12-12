// src/pages/PanelDemo.jsx — Panel de ejemplo público · Galenos.pro
import React from "react";
import { useNavigate } from "react-router-dom";

const demoResult = {
  patient_alias: "Paciente DEMO",
  file_name: "analitica_demo.pdf",
  markers: [
    { name: "Hemoglobina", value: 13.4, range: "12.0 – 16.0 g/dL", status: "normal" },
    { name: "Leucocitos", value: 11.2, range: "4.0 – 10.0 x10^9/L", status: "alto" },
    { name: "PCR", value: 12.5, range: "< 5 mg/L", status: "alto" },
    { name: "Creatinina", value: 1.1, range: "0.6 – 1.2 mg/dL", status: "normal" },
  ],
  summary: "Analítica demo con leve elevación de leucocitos y PCR, compatible con un contexto inflamatorio o infeccioso leve a valorar. El resto de parámetros mostrados se encuentran dentro de la normalidad.",
  differential: "Posibles causas generales a valorar en este ejemplo DEMO:\n- Infección leve de vías respiratorias altas u otro foco localizado.\n- Proceso inflamatorio autolimitado.\n- Otras causas inespecíficas de elevación de reactantes de fase aguda.\n\nEs necesaria siempre la correlación con clínica, exploración física y, si procede, más pruebas.",
};

const demoChat = [
  {
    from: "doctor",
    text: "¿Qué es lo que más te llama la atención en esta analítica demo?",
  },
  {
    from: "ia",
    text: "En esta analítica de ejemplo destacan la leucocitosis y la PCR elevada, hallazgos compatibles con un contexto inflamatorio o infeccioso leve, siempre a valorar junto con la clínica.",
  },
  {
    from: "doctor",
    text: "¿Ves algún dato de alarma evidente en este ejemplo DEMO?",
  },
  {
    from: "ia",
    text: "En esta demo no se observan alteraciones marcadas en función renal ni anemia significativa. Aun así, cualquier interpretación debe confirmarse por el médico responsable.",
  },
];

export default function PanelDemo() {
  const nav = useNavigate();

  return (
    <main className="sr-container py-8">
      <section className="space-y-4">
        <div className="border-b border-slate-200 pb-3 mb-3 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xl">
            <h1 className="sr-h1 text-2xl mb-1">Panel de ejemplo · IA Médica con Visión</h1>
            <p className="sr-p text-sm text-sky-700 font-medium mb-2">
              Aquí puedes ver cómo Galenos.pro interpreta una analítica de ejemplo, genera un resumen clínico
              orientativo y permite un mini chat sobre el caso. Sin registro y sin datos reales.
            </p>
            <p className="sr-p text-sm text-slate-600">
              En la versión real, subes una analítica en PDF o imagen y la IA extrae marcadores, detecta tendencias
              y redacta un resumen prudente para ayudarte en la valoración. La decisión final es siempre tuya.
            </p>
          </div>

          <div className="sr-card max-w-sm w-full">
            <h2 className="sr-h1 text-sm mb-1">¿Qué estás viendo ahora?</h2>
            <ul className="sr-list text-sm space-y-1">
              <li>✔ Analítica demo ya procesada.</li>
              <li>✔ Tabla de marcadores con colores.</li>
              <li>✔ Resumen clínico orientativo.</li>
              <li>✔ Ejemplo de conversación médico · IA.</li>
            </ul>
            <p className="sr-small text-slate-500 mt-2">
              En producción, este mismo panel funciona con tus pacientes y tus propios documentos.
            </p>
          </div>
        </div>

        <div className="sr-card space-y-4">
          <div>
            <h3 className="sr-h1 text-lg mb-1">Resultado para {demoResult.patient_alias}</h3>
            <p className="sr-small text-slate-500">
              Fichero: <span className="font-mono text-xs">{demoResult.file_name}</span>
            </p>
          </div>

          <div>
            <h4 className="sr-h1 text-base mb-1">Marcadores (demo)</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left border-b border-slate-200">Parámetro</th>
                    <th className="px-3 py-2 text-left border-b border-slate-200">Valor</th>
                    <th className="px-3 py-2 text-left border-b border-slate-200">Rango</th>
                    <th className="px-3 py-2 text-left border-b border-slate-200">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {demoResult.markers.map((m, idx) => (
                    <tr key={idx} className="odd:bg-white even:bg-slate-50">
                      <td className="px-3 py-2 border-b border-slate-100">{m.name}</td>
                      <td className="px-3 py-2 border-b border-slate-100">{m.value}</td>
                      <td className="px-3 py-2 border-b border-slate-100">{m.range}</td>
                      <td className="px-3 py-2 border-b border-slate-100">
                        <span
                          className={
                            m.status === "normal"
                              ? "text-emerald-600"
                              : "text-amber-700 font-medium"
                          }
                        >
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="sr-h1 text-base mb-1">Resumen orientativo (demo)</h4>
            <p className="sr-p text-sm whitespace-pre-line">
              {demoResult.summary}
            </p>
          </div>

          <div>
            <h4 className="sr-h1 text-base mb-1">Diagnóstico diferencial (orientativo · demo)</h4>
            <p className="sr-p text-sm whitespace-pre-line">
              {demoResult.differential}
            </p>
          </div>

          <div className="mt-4 border-t border-slate-200 pt-3 space-y-2">
            <h4 className="sr-h1 text-base mb-1">Ejemplo de conversación médico · IA</h4>
            <p className="sr-small text-slate-500 mb-1">
              En la versión real puedes hacer preguntas sobre la analítica de tu paciente. Aquí mostramos un ejemplo.
            </p>

            <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-lg p-2 bg-slate-50 space-y-2 text-sm">
              {demoChat.map((m, idx) => (
                <div
                  key={idx}
                  className={m.from === "doctor" ? "text-right" : "text-left"}
                >
                  <div
                    className={
                      m.from === "doctor"
                        ? "inline-block rounded-xl bg-sky-600 text-white px-3 py-1.5 mb-0.5 max-w-[80%] text-left"
                        : "inline-block rounded-xl bg-white text-slate-900 px-3 py-1.5 mb-0.5 border border-slate-200 max-w-[80%]"
                    }
                  >
                    <span className="block whitespace-pre-line">{m.text}</span>
                  </div>
                  <div className="sr-small text-slate-500">
                    {m.from === "doctor" ? "Tú (médico)" : "IA (demo)"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-3 mt-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <p className="sr-small text-slate-500">
              ¿Te gustaría usar Galenos.pro con tus propios pacientes?
            </p>
            <button
              type="button"
              onClick={() => nav("/solicitar-acceso")}
              className="sr-btn-secondary text-sm"
            >
              Solicitar acceso sin invitación
            </button>
          </div>

          <p className="sr-small text-slate-500 mt-2">
            Galenos.pro no diagnostica ni prescribe. Es una herramienta de apoyo al médico. Los datos mostrados aquí
            son exclusivamente de ejemplo.
          </p>
        </div>
      </section>
    </main>
  );
}
