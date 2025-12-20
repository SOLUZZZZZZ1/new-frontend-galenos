import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL;

export default function ClinicalCase() {
  const token = localStorage.getItem("galenos_token");
  const [caso, setCaso] = useState(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    fetch(`${API}/clinical-cases/active`)
      .then(r => r.json())
      .then(setCaso);
  }, []);

  if (!caso) return <p>No hay caso activo.</p>;
  if (sent) return <p className="text-green-700">Respuesta enviada. Gracias.</p>;

  async function submit() {
    await fetch(`${API}/clinical-cases/${caso.id}/respond`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        diagnosis,
        reasoning,
      }),
    });
    setSent(true);
  }

  return (
    <div className="sr-container space-y-4">
      <h1 className="text-xl font-semibold">{caso.title}</h1>

      <p>{caso.description}</p>

      {caso.symptoms && (
        <>
          <h3 className="font-medium">Síntomas</h3>
          <p>{caso.symptoms}</p>
        </>
      )}

      {caso.tests && (
        <>
          <h3 className="font-medium">Pruebas</h3>
          <p>{caso.tests}</p>
        </>
      )}

      <textarea
        className="sr-input w-full"
        placeholder="Diagnóstico principal"
        value={diagnosis}
        onChange={e => setDiagnosis(e.target.value)}
      />

      <textarea
        className="sr-input w-full"
        placeholder="Razonamiento clínico (opcional)"
        value={reasoning}
        onChange={e => setReasoning(e.target.value)}
      />

      <button onClick={submit} className="sr-btn-primary">
        Enviar diagnóstico
      </button>
    </div>
  );
}
