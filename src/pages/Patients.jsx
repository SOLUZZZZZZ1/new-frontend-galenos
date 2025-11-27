import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export default function Patients(){
  const { t } = useTranslation()
  const [patient, setPatient] = useState('Paciente A')
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)

  const onUpload = async () => {
    if(!file){ alert('Selecciona un PDF o imagen'); return }
    const fd = new FormData()
    fd.append('file', file)
    fd.append('patient_alias', patient)
    try{
      const res = await fetch(`${API}/uploads`, { method:'POST', body: fd })
      const data = await res.json()
      setResult(data.extraction)
    }catch(e){ alert('Error subiendo el informe')}
  }

  return (
    <section>
      <h2>{t('patients')}</h2>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24}}>
        <div>
          <label>Alias paciente</label><br/>
          <input value={patient} onChange={e=>setPatient(e.target.value)} style={{padding:8, width:'100%', marginBottom:8}}/>
          <label>{t('upload')}</label><br/>
          <input type='file' accept='.pdf,image/*' onChange={e=>setFile(e.target.files[0])} style={{marginBottom:8}}/>
          <button onClick={onUpload} style={{background:'#0b63ce', color:'white', padding:'8px 14px', border:0, borderRadius:8}}>{t('upload')}</button>
        </div>
        <div>
          {!result ? <div style={{opacity:.7}}>{t('patients_empty')}</div> :
            <div>
              <h3>Resultados extraídos (demo)</h3>
              <ul>
                {result.markers.map((m, idx)=>(
                  <li key={idx}>{m.name}: <strong>{m.value} {m.unit}</strong> (ref {m.ref_min}–{m.ref_max})</li>
                ))}
              </ul>
            </div>
          }
        </div>
      </div>
    </section>
  )
}
