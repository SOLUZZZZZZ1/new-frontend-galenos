import React, { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

export default function MedicalNewsLiveWidget({ token }) {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setErr("");
      setLoading(true);
      try {
        const res = await fetch(`${API}/medical-news/live?limit=10`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.detail || "Error cargando actualidad médica.");
        if (!cancelled) setItems(Array.isArray(data?.items) ? data.items : []);
      } catch (e) {
        if (!cancelled) setErr(String(e?.message || e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [token]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">🗞️ Actualidad médica (LIVE)</h3>
        {loading ? <span className="text-xs text-slate-500">Actualizando…</span> : null}
      </div>
      {err ? <p className="text-xs text-red-600">{err}</p> : null}
      {items.length ? (
        <ul className="space-y-2">
          {items.slice(0, 6).map((it, idx) => (
            <li key={idx} className="text-xs">
              <div className="font-semibold text-slate-900">{it.title}</div>
              <div className="text-slate-600">{it.source_name}{it.published_at ? ` · ${String(it.published_at).slice(0, 10)}` : ""}</div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-slate-600">Sin items por ahora.</p>
      )}
      <p className="text-[11px] text-slate-500">
        Fuente: RSS en directo. No se guarda en BD.
      </p>
    </div>
  );
}
