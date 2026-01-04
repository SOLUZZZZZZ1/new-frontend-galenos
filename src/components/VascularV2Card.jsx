import React, { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

export default function VascularV2Card({ imagingId, token, onBaseUpdate }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [base, setBase] = useState(null);

  const [oracleOpen, setOracleOpen] = useState(false);
  const [oracleLoading, setOracleLoading] = useState(false);
  const [oracleErr, setOracleErr] = useState("");
  const [oracle, setOracle] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!imagingId || !token) {
        setBase(null);
        try { onBaseUpdate && onBaseUpdate(null); } catch {}
        return;
      }
      setErr("");
      setLoading(true);
      try {
        const res = await fetch(`${API}/imaging/vascular-v2/${imagingId}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.detail || "Error cargando Vascular V2.");
        if (!cancelled) {
          const b = data?.base || null;
          setBase(b);
          try { onBaseUpdate && onBaseUpdate(b); } catch {}
        }
      } catch (e) {
        if (!cancelled) setErr(String(e?.message || e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => { cancelled = true; };
  }, [imagingId, token]);

  async function openOracle() {
    setOracleErr("");
    setOracle(null);
    setOracleLoading(true);
    setOracleOpen(true);

    try {
      const res = await fetch(`${API}/imaging/vascular-v2/${imagingId}/oracle`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ context: null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Error en análisis avanzado.");
      setOracle(data);
    } catch (e) {
      setOracleErr(String(e?.message || e));
    } finally {
      setOracleLoading(false);
    }
  }

  if (!imagingId) return null;

  return (
    <div className="mt-3 rounded-xl border border-slate-200 bg-white/80 p-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold">🩸 Vascular V2 · Lo relevante en esta imagen</h4>
        {loading ? <span className="text-xs text-slate-500">Analizando…</span> : null}
      </div>

      {err ? <p className="text-xs text-red-600 mt-2">{err}</p> : null}

      {base ? (
        <div className="mt-2 space-y-1">
          {Array.isArray(base.facts) && base.facts.length ? (
            <p className="text-sm text-slate-900"><span className="font-semibold">Hecho:</span> {base.facts.join(" ")}</p>
          ) : null}
          {Array.isArray(base.patterns) && base.patterns.length ? (
            <p className="text-sm text-slate-900"><span className="font-semibold">Patrón:</span> {base.patterns.join(" ")}</p>
          ) : null}
          {Array.isArray(base.quality) && base.quality.length ? (
            <p className="text-xs text-slate-600">{base.quality.join(" ")}</p>
          ) : null}
          {base.disclaimer ? (
            <p className="text-[11px] text-slate-500 mt-1">{base.disclaimer}</p>
          ) : null}

          {base.oracle_available ? (
            <div className="mt-2">
              <button
                type="button"
                className="sr-btn-secondary text-xs"
                onClick={openOracle}
                disabled={oracleLoading}
              >
                {oracleLoading ? "🔮 Analizando..." : "🔮 Análisis orientativo avanzado (experimental)"}
              </button>
              <p className="text-[11px] text-slate-500 mt-1">
                Explora escenarios posibles a partir de patrones visuales. No constituye diagnóstico.
              </p>
            </div>
          ) : null}

          {oracleOpen ? (
            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50/70 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-slate-800">Oráculo (escenarios, no diagnóstico)</p>
                <button type="button" className="sr-btn-secondary text-xs" onClick={() => setOracleOpen(false)}>
                  Cerrar
                </button>
              </div>
              {oracleErr ? <p className="text-xs text-red-600 mt-2">{oracleErr}</p> : null}
              {oracle?.scenarios?.length ? (
                <ul className="list-disc list-inside text-sm text-slate-800 mt-2 space-y-1">
                  {oracle.scenarios.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              ) : null}
              {oracle?.disclaimer ? <p className="text-[11px] text-slate-500 mt-2">{oracle.disclaimer}</p> : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
