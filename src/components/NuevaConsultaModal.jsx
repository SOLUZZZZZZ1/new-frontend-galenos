// NuevaConsultaModal.jsx — Crear consulta De Guardia con adjuntos clínicos
import React, { useEffect, useState } from "react";

const API =
  import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

export default function NuevaConsultaModal({ isOpen, onClose, onCreated }) {
  const token = localStorage.getItem("galenos_token");

  const [title, setTitle] = useState("");
  const [original, setOriginal] = useState("");
  const [patientId, setPatientId] = useState("");
  const [authorAlias, setAuthorAlias] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Adjuntos
  const [options, setOptions] = useState(null);
  const [attachments, setAttachments] = useState([]);

  // ==========================
  // Cargar adjuntos al elegir paciente
  // ==========================
  useEffect(() => {
    if (!patientId) {
      setOptions(null);
      setAttachments([]);
      return;
    }

    const fetchOptions = async () => {
      try {
        const res = await fetch(
          `${API}/guard/attachments/options?patient_id=${patientId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        setOptions(data);
      } catch (e) {
        console.error("Error cargando adjuntos clínicos", e);
        setOptions(null);
      }
    };

    fetchOptions();
  }, [patientId]);

  // ==========================
  // Toggle adjuntos
  // ==========================
  function toggleAttachment(kind, id) {
    setAttachments((prev) => {
      const exists = prev.find(
        (a) => a.kind === kind && a.id === id
      );
      if (exists) {
        return prev.filter(
          (a) => !(a.kind === kind && a.id === id)
        );
      }
      return [...prev, { kind, id }];
    });
  }

  // ==========================
  // Enviar consulta
  // ==========================
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!title.trim() || !original.trim()) {
      setError("Título y descripción son obligatorios.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API}/guard/cases`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          original,
          patient_id: patientId ? Number(patientId) : null,
          author_alias: authorAlias || "anónimo",
          attachments,
        }),
      });

      if (!res.ok) {
        throw new Error("No se pudo crear la consulta.");
      }

      const data = await res.json();
      onCreated?.(data);
      onClose();
    } catch (e) {
      setError("Error creando la consulta.");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-xl rounded-xl p-6 shadow-lg overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-semibold mb-4">
          Nueva consulta de diagnóstico
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="sr-label">Título</label>
            <input
              className="sr-input w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Duda sobre insuficiencia renal"
            />
          </div>

          <div>
            <label className="sr-label">
              Describe el caso clínico (sin datos identificativos)
            </label>
            <textarea
              className="sr-input w-full min-h-[120px]"
              value={original}
              onChange={(e) => setOriginal(e.target.value)}
            />
          </div>

          <div>
            <label className="sr-label">
              ID interno del paciente (opcional)
            </label>
            <input
              className="sr-input w-full"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="Ej. 16"
            />
          </div>

          {/* ==========================
              ADJUNTOS CLÍNICOS
             ========================== */}
          {options && (
            <div className="border rounded-lg p-3 bg-slate-50 space-y-2">
              <h3 className="text-sm font-semibold">
                Adjuntar apoyo clínico (anonimizado)
              </h3>

              {options.analytics?.length > 0 && (
                <div>
                  <p className="text-xs font-medium mb-1">Analíticas</p>
                  {options.analytics.map((a) => (
                    <label
                      key={`a-${a.id}`}
                      className="flex items-start gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={attachments.some(
                          (x) => x.kind === "analytic" && x.id === a.id
                        )}
                        onChange={() =>
                          toggleAttachment("analytic", a.id)
                        }
                      />
                      <span>
                        {a.exam_date || "Fecha no especificada"} ·{" "}
                        {a.summary?.slice(0, 80)}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {options.imaging?.length > 0 && (
                <div>
                  <p className="text-xs font-medium mt-2 mb-1">Imágenes</p>
                  {options.imaging.map((i) => (
                    <label
                      key={`i-${i.id}`}
                      className="flex items-start gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={attachments.some(
                          (x) => x.kind === "imaging" && x.id === i.id
                        )}
                        onChange={() =>
                          toggleAttachment("imaging", i.id)
                        }
                      />
                      <span>
                        {i.type} · {i.summary?.slice(0, 80)}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {options.analytics?.length === 0 &&
                options.imaging?.length === 0 && (
                  <p className="text-xs text-slate-500">
                    No hay analíticas ni imágenes para este paciente.
                  </p>
                )}
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="sr-btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="sr-btn-primary"
            >
              {loading ? "Publicando..." : "Publicar consulta"}
            </button>
          </div>
        </form>

        <p className="text-xs text-slate-400 mt-4 text-center">
          © 2025 Galenos.pro · Herramienta de apoyo al médico
        </p>
      </div>
    </div>
  );
}
