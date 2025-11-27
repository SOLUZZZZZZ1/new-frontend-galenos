// src/pages/VocesNuevo.jsx — Editor PRO: crear → publicar
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../components/Seo.jsx";

const LS_EMAIL = "mediador_email";

export default function VocesNuevo(){
  const nav = useNavigate();
  const email = localStorage.getItem(LS_EMAIL) || "";
  const [title,setTitle] = useState("");
  const [summary,setSummary] = useState("");
  const [content,setContent] = useState("");
  const [busy,setBusy] = useState(false);
  const [msg,setMsg] = useState("");

  async function guardarYPublicar(){
    setBusy(true); setMsg("");
    try{
      if (!email) throw new Error("Inicia sesión en el Panel");
      if (!title.trim() || !content.trim()) throw new Error("Título y contenido son obligatorios");
      // 1) crear borrador
      const r = await fetch("/api/voces", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ email, title, summary, content })
      });
      const data = await r.json();
      if (!r.ok || !data?.ok) throw new Error(data?.detail || "No se pudo crear");
      // 2) publicar
      const rp = await fetch(`/api/voces/${data.id}/publish?email=${encodeURIComponent(email)}`, { method:"POST" });
      const dp = await rp.json();
      if (!rp.ok || !dp?.ok) throw new Error(dp?.detail || "No se pudo publicar");
      setMsg("Publicado ✔️");
      // navega a detalle
      nav(`/voces/${encodeURIComponent(data.slug)}`);
    }catch(e){
      setMsg(e.message || "Error");
    }finally{
      setBusy(false);
    }
  }

  return (
    <>
      <Seo title="Voces PRO · Nuevo" description="Escribe y publica un artículo (solo PRO)" canonical="https://mediazion.eu/panel-mediador/voces/nuevo"/>
      <main className="sr-container py-8"
        style={{ minHeight:"calc(100vh - 160px)", background:"rgba(255,255,255,0.95)", borderRadius:16, margin:"24px 0" }}>
        <header className="sr-card">
          <h1 className="sr-h1">Nuevo artículo (Voces PRO)</h1>
          <p className="sr-p">Solo mediadores con plan <b>PRO</b> pueden publicar.</p>
        </header>

        <section className="sr-card mt-4" style={{ maxWidth: 900, margin:"0 auto" }}>
          <label className="sr-label">Título</label>
          <input className="sr-input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Título del artículo" />

          <label className="sr-label mt-3">Resumen (opcional)</label>
          <textarea className="sr-input" rows={3} value={summary} onChange={e=>setSummary(e.target.value)} placeholder="Breve descripción" />

          <label className="sr-label mt-3">Contenido (Markdown)</label>
          <textarea className="sr-input" rows={12} value={content} onChange={e=>setContent(e.target.value)}
            placeholder={"# Encabezado\n\nTu contenido en Markdown…"} />

          <div className="mt-3 flex gap-8">
            <button className="sr-btn-primary" onClick={guardarYPublicar} disabled={busy || !email || !title.trim() || !content.trim()}>
              {busy ? "Publicando…" : "Guardar y publicar"}
            </button>
            {msg && <p className="sr-p" style={{ color:"#166534" }}>{msg}</p>}
          </div>
        </section>
      </main>
    </>
  );
}
