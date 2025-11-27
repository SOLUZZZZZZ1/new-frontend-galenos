// src/pages/ActaNueva.jsx — Generar Acta (DOCX) con LOGO grande
import React, { useState } from "react";
import Seo from "../components/Seo.jsx";

export default function ActaNueva() {
  const [form, setForm] = useState({
    case_no: "",
    date_iso: "",
    mediator_alias: "",
    parties: "",
    summary: "",
    agreements: "",
    confidentiality: true,
    location: "España",
    logo_url: "https://mediazion.eu/logo.png",
    logo_mode: "normal",     // normal | banner (para futuras variantes)
    logo_width_cm: 9.0        // tamaño del logo (cm)
  });
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState("");
  const [msg, setMsg] = useState("");

  const onChange = (k) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked :
              e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setForm(s => ({ ...s, [k]: v }));
  };

  async function onSubmit(e){
    e.preventDefault();
    setBusy(true); setMsg(""); setUrl("");
    try{
      const r = await fetch("/api/actas/render_docx", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(form)
      });
      const data = await r.json();
      if(!r.ok || !data?.ok) throw new Error(data?.detail || "No se pudo generar el acta");
      setUrl(data.url);
      setMsg("Acta generada correctamente.");
    }catch(err){
      setMsg(err.message || "Error generando acta");
    }finally{
      setBusy(false);
    }
  }

  return (
    <>
      <Seo title="Nueva Acta · MEDIAZION" description="Genera un acta con logo de Mediazion (DOCX grande y visible)." />
      <main className="sr-container py-8" style={{minHeight:"calc(100vh - 160px)", background:"rgba(255,255,255,0.95)", borderRadius:16, margin:"24px 0"}}>
        <h1 className="sr-h1">Generar Acta de Mediación (logo destacado)</h1>

        <form className="sr-card mt-4" onSubmit={onSubmit} style={{display:"grid", gap:12, maxWidth:900}}>
          <div className="grid" style={{gridTemplateColumns:"1fr 1fr", gap:12}}>
            <div>
              <label className="sr-label">Expediente</label>
              <input className="sr-input" value={form.case_no} onChange={onChange("case_no")} required />
            </div>
            <div>
              <label className="sr-label">Fecha</label>
              <input className="sr-input" type="date" value={form.date_iso} onChange={onChange("date_iso")} required />
            </div>
          </div>

          <label className="sr-label">Alias del mediador/a</label>
          <input className="sr-input" value={form.mediator_alias} onChange={onChange("mediator_alias")} required />

          <label className="sr-label">Partes intervinientes</label>
          <textarea className="sr-input" rows={3} value={form.parties} onChange={onChange("parties")} required />

          <label className="sr-label">Antecedentes / Hechos</label>
          <textarea className="sr-input" rows={4} value={form.summary} onChange={onChange("summary")} required />

          <label className="sr-label">Acuerdos y compromisos</label>
          <textarea className="sr-input" rows={4} value={form.agreements} onChange={onChange("agreements")} required />

          <div className="flex flex-wrap items-center gap-12">
            <div className="flex items-center gap-2">
              <input id="conf" type="checkbox" checked={form.confidentiality} onChange={onChange("confidentiality")} />
              <label htmlFor="conf" className="sr-label" style={{margin:0}}>Incluir cláusula de confidencialidad</label>
            </div>

            <div>
              <label className="sr-label">Tamaño del logo (cm)</label>
              <input className="sr-input" type="number" min="5" max="12" step="0.5"
                     value={form.logo_width_cm} onChange={onChange("logo_width_cm")} />
            </div>

            <div>
              <label className="sr-label">Modo de cabecera</label>
              <select className="sr-input" value={form.logo_mode} onChange={onChange("logo_mode")}>
                <option value="normal">Normal (logo + barra)</option>
                <option value="banner" disabled>Banner (próximamente)</option>
              </select>
            </div>
          </div>

          <label className="sr-label">Logo (URL)</label>
          <input className="sr-input" value={form.logo_url} onChange={onChange("logo_url")} placeholder="https://mediazion.eu/logo.png" />

          <button className="sr-btn-primary" type="submit" disabled={busy}>
            {busy ? "Generando…" : "Generar DOCX"}
          </button>

          {msg && <p className="sr-p" style={{color: String(msg).startsWith("Error")? "#991b1b":"#166534"}}>{msg}</p>}
          {url && <p className="sr-p">Descargar: <a className="sr-btn-secondary" href={url} target="_blank" rel="noopener noreferrer">Abrir acta (DOCX)</a></p>}
        </form>
      </main>
    </>
  );
}
