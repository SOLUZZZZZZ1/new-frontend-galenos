import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

function authHeaders() {
  const token = localStorage.getItem("galenos_token") || "";
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json; charset=utf-8",
  };
}

export default function ComunidadPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [items, setItems] = useState([]);
  const [status, setStatus] = useState(params.get("status") || "open");
  const [search, setSearch] = useState("");

  const selectedId = params.get("id") ? Number(params.get("id")) : null;

  // detalle
  const [detailLoading, setDetailLoading] = useState(false);
  const [caseData, setCaseData] = useState(null);
  const [responses, setResponses] = useState([]);

  // responder
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  // nuevo caso (simple)
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContext, setNewContext] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [newVisibility, setNewVisibility] = useState("public");
  const [creating, setCreating] = useState(false);

  const token = localStorage.getItem("galenos_token") || "";

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    loadList(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, token]);

  async function loadList(nextStatus) {
    setLoading(true);
    setError("");
    try {
      const url = `${API}/community/cases?status=${encodeURIComponent(nextStatus || "open")}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const raw = await res.text();
      if (!res.ok) {
        setError("No se pudieron cargar los casos de Comunidad.");
        setLoading(false);
        return;
      }
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        data = { items: [] };
      }
      setItems(Array.isArray(data.items) ? data.items : []);
      setLoading(false);
    } catch (e) {
      setError("Error de conexión al cargar Comunidad.");
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!selectedId) {
      setCaseData(null);
      setResponses([]);
      return;
    }
    loadDetail(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  async function loadDetail(id) {
    setDetailLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/community/cases/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const raw = await res.text();
      if (!res.ok) {
        setError("No se pudo cargar el caso seleccionado.");
        setDetailLoading(false);
        return;
      }
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        data = null;
      }
      setCaseData(data?.case || null);
      setResponses(Array.isArray(data?.responses) ? data.responses : []);
      setDetailLoading(false);
    } catch (e) {
      setError("Error de conexión al cargar el caso.");
      setDetailLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    if (!q) return items;
    return (items || []).filter((c) => {
      const hay = `${c.title || ""} ${c.clinical_context || ""} ${c.question || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, search]);

  function selectCase(id) {
    const next = new URLSearchParams(params);
    next.set("id", String(id));
    next.set("status", status);
    setParams(next);
  }

  async function sendReply() {
    if (!selectedId) return;
    const text = (reply || "").trim();
    if (!text) return;

    setSending(true);
    setError("");
    try {
      const res = await fetch(`${API}/community/cases/${selectedId}/responses`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ content: text }),
      });
      const raw = await res.text();
      if (!res.ok) {
        setError("No se pudo enviar la respuesta.");
        setSending(false);
        return;
      }
      setReply("");
      // recargar detalle
      await loadDetail(selectedId);
      setSending(false);
    } catch (e) {
      setError("Error de conexión al enviar la respuesta.");
      setSending(false);
    }
  }

  async function createNewCase() {
    const title = (newTitle || "").trim();
    const clinical_context = (newContext || "").trim();
    const question = (newQuestion || "").trim();

    if (!title && !clinical_context && !question) return;

    setCreating(true);
    setError("");
    try {
      const res = await fetch(`${API}/community/cases`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ title, clinical_context, question, visibility: newVisibility }),
      });
      const raw = await res.text();
      if (!res.ok) {
        setError("No se pudo crear el caso.");
        setCreating(false);
        return;
      }
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        data = null;
      }
      setShowNew(false);
      setNewTitle("");
      setNewContext("");
      setNewQuestion("");
      setNewVisibility("public");
      await loadList(status);
      if (data?.id) selectCase(data.id);
      setCreating(false);
    } catch (e) {
      setError("Error de conexión al crear el caso.");
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <main className="sr-container py-8">
        <p className="text-slate-600">Cargando Comunidad…</p>
      </main>
    );
  }

  return (
    <main className="sr-container py-6 space-y-4">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Comunidad · “¿Qué harías tú?”</h1>
          <p className="text-sm text-slate-600">
            Casos formativos entre médicos. Sin datos identificativos. Enfoques, no “aciertos”.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="sr-btn-primary text-sm"
            onClick={() => setShowNew((v) => !v)}
          >
            Nuevo caso
          </button>
        </div>
      </header>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {showNew && (
        <section className="p-4 rounded-xl border bg-white space-y-3">
          <h2 className="font-semibold">Crear nuevo caso</h2>

          <input
            className="sr-input w-full"
            placeholder="Título (opcional)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />

          <textarea
            className="sr-input w-full min-h-[90px]"
            placeholder="Contexto clínico (sin datos identificativos)"
            value={newContext}
            onChange={(e) => setNewContext(e.target.value)}
          />

          <textarea
            className="sr-input w-full min-h-[80px]"
            placeholder="Pregunta central: “¿Qué harías tú?”"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
          />

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Visibilidad:</span>
              <select
                className="sr-input"
                value={newVisibility}
                onChange={(e) => setNewVisibility(e.target.value)}
              >
                <option value="public">Público</option>
                <option value="private">Privado</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="sr-btn"
                onClick={() => setShowNew(false)}
                disabled={creating}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="sr-btn-primary"
                onClick={createNewCase}
                disabled={creating}
              >
                {creating ? "Creando…" : "Crear"}
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)] gap-4 min-h-[520px]">
        {/* LISTA */}
        <aside className="p-4 rounded-xl border bg-white space-y-3">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <select
                className="sr-input w-full"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  const next = new URLSearchParams(params);
                  next.set("status", e.target.value);
                  setParams(next);
                }}
              >
                <option value="open">Abiertos</option>
                <option value="closed">Cerrados</option>
                <option value="all">Todos</option>
              </select>

              <button
                type="button"
                className="sr-btn"
                onClick={() => loadList(status)}
                title="Recargar"
              >
                ↻
              </button>
            </div>

            <input
              className="sr-input w-full"
              placeholder="Buscar…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            {filtered.length === 0 ? (
              <p className="text-sm text-slate-500">No hay casos.</p>
            ) : (
              filtered.map((c) => {
                const active = selectedId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selectCase(c.id)}
                    className={`w-full text-left p-3 rounded-lg border transition ${
                      active ? "border-slate-900" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm line-clamp-1">{c.title || "Caso sin título"}</p>
                      <span className="text-[11px] text-slate-500">
                        {c.visibility === "private" ? "Privado" : "Público"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                      {c.question || c.clinical_context || ""}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* DETALLE */}
        <section className="p-4 rounded-xl border bg-white space-y-3">
          {!selectedId ? (
            <p className="text-sm text-slate-600">Selecciona un caso para verlo.</p>
          ) : detailLoading ? (
            <p className="text-sm text-slate-600">Cargando caso…</p>
          ) : !caseData ? (
            <p className="text-sm text-red-600">No se pudo cargar el caso.</p>
          ) : (
            <>
              <div className="space-y-1">
                <h2 className="text-xl font-bold">{caseData.title || "Caso sin título"}</h2>
                <p className="text-xs text-slate-500">
                  {caseData.visibility === "private" ? "Privado" : "Público"} ·{" "}
                  {caseData.status === "closed" ? "Cerrado" : "Abierto"}
                </p>
              </div>

              {caseData.clinical_context && (
                <div className="space-y-1">
                  <h3 className="font-semibold">Contexto</h3>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{caseData.clinical_context}</p>
                </div>
              )}

              {caseData.question && (
                <div className="space-y-1">
                  <h3 className="font-semibold">Pregunta</h3>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{caseData.question}</p>
                </div>
              )}

              <hr className="my-2" />

              <div className="space-y-2">
                <h3 className="font-semibold">Respuestas</h3>

                {responses.length === 0 ? (
                  <p className="text-sm text-slate-500">Aún no hay respuestas.</p>
                ) : (
                  <div className="space-y-2">
                    {responses.map((r) => (
                      <div key={r.id} className="p-3 rounded-lg border border-slate-200">
                        <p className="text-xs text-slate-500 mb-1">
                          <span className="font-semibold text-slate-700">{r.author_alias || "anónimo"}</span>
                        </p>
                        <p className="text-sm text-slate-800 whitespace-pre-wrap">{r.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 space-y-2">
                <textarea
                  className="sr-input w-full min-h-[90px]"
                  placeholder="Tu enfoque… (sin datos identificativos)"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="sr-btn-primary"
                    onClick={sendReply}
                    disabled={sending || !(reply || "").trim()}
                  >
                    {sending ? "Enviando…" : "Enviar respuesta"}
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                Este espacio es formativo. No sustituye criterio clínico ni atención al paciente.
              </p>
            </>
          )}
        </section>
      </section>
    </main>
  );
}
