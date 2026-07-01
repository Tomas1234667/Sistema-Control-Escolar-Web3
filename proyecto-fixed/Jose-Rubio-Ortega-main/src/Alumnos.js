import React, { useState } from "react";
import toast from "react-hot-toast";
import { useAppDB, Layout } from "./App";

const INITIALS = (n="") => n.split(" ").map(w=>w[0]||"").slice(0,2).join("").toUpperCase();

const EMPTY_FORM = { nombre:"", fechaNac:"", curp:"", grupo:"", tutor:"", tel:"", email:"", sangre:"O+", alergias:"Ninguna" };

/* Convierte AAAA-MM-DD (formato nativo del input) a DD/MM/AAAA
   para mostrarla en pantalla y en la boleta sin confundir el orden */
const fmtFechaCorta = (f) => {
  if (!f) return "—";
  const [y,m,d] = f.split("-");
  if (!y || !m || !d) return f;
  return `${d}/${m}/${y}`;
};

/* ── GENERA LA BOLETA Y LA IMPRIME COMO PDF ── */
function descargarBoletaPDF(alumno, db) {
  const prom    = db.promedioAlumno(alumno.id);
  const faltas  = db.faltasAlumno(alumno.id);
  const pct     = db.asistenciaPctAlumno(alumno.id);
  const riesgo  = db.nivelRiesgo(alumno.id);
  const califs  = db.calificaciones.filter(c=>c.alumnoId===alumno.id);
  const grupo   = db.grupos.find(g=>g.id===alumno.grupo);
  const maestro = grupo ? db.maestros.find(m=>m.id===grupo.maestroId) : null;
  const fecha   = new Date().toLocaleDateString("es-MX",{year:"numeric",month:"long",day:"numeric"});

  const filaCalif = (c) => {
    const avg = ((Number(c.tri1)||0)+(Number(c.tri2)||0)+(Number(c.tri3)||0))/3;
    const color = avg>=8.5?"#2d6a3a":avg>=6?"#7a5a10":"#7a2a2a";
    return `
      <tr>
        <td>${c.materia}</td>
        <td style="text-align:center">${Number(c.tri1).toFixed(1)}</td>
        <td style="text-align:center">${Number(c.tri2).toFixed(1)}</td>
        <td style="text-align:center">${Number(c.tri3).toFixed(1)}</td>
        <td style="text-align:center;font-weight:700;color:${color}">${avg.toFixed(1)}</td>
      </tr>`;
  };

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<title>Boleta — ${alumno.nombre}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Plus Jakarta Sans',Arial,sans-serif;color:#2d2d2d;background:#fff;padding:32px;font-size:13px}
  .header{display:flex;align-items:center;gap:20px;border-bottom:3px solid #4a6fa5;padding-bottom:16px;margin-bottom:20px}
  .escudo{width:64px;height:64px;background:#4a6fa5;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:32px;color:#fff;flex-shrink:0}
  .escuela-info h1{font-size:18px;font-weight:800;color:#4a6fa5}
  .escuela-info p{font-size:12px;color:#5a5a5a}
  h2{font-size:15px;font-weight:700;color:#4a6fa5;margin:18px 0 8px;border-left:4px solid #4a6fa5;padding-left:8px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:18px}
  .field{padding:6px 10px;background:#f5f0e8;border-radius:6px}
  .field label{font-size:10px;font-weight:700;color:#5a5a5a;text-transform:uppercase;letter-spacing:.5px}
  .field span{display:block;font-weight:600;font-size:13px;margin-top:2px}
  table{width:100%;border-collapse:collapse;margin-bottom:18px;font-size:12px}
  th{background:#2c3a4a;color:#e8edf2;padding:8px 10px;text-align:left;font-size:11px;font-weight:700;letter-spacing:.3px}
  th:not(:first-child){text-align:center}
  td{padding:7px 10px;border-bottom:1px solid #e0dbd0}
  tr:nth-child(even) td{background:#faf8f4}
  .resumen{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:18px}
  .res-card{padding:12px;border-radius:8px;text-align:center;background:#f5f0e8;border:1px solid #d8d2c6}
  .res-card .val{font-size:24px;font-weight:800}
  .res-card .lbl{font-size:11px;color:#5a5a5a;margin-top:2px}
  .firma{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:30px}
  .firma-box{text-align:center;border-top:1px solid #2d2d2d;padding-top:8px;font-size:11px;color:#5a5a5a}
  .footer{margin-top:24px;text-align:center;font-size:11px;color:#8a8a8a;border-top:1px solid #d8d2c6;padding-top:10px}
  .badge{display:inline-block;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700}
  .b-green{background:#d6eed9;color:#2d6a3a}
  .b-yellow{background:#f5edcc;color:#7a5a10}
  .b-red{background:#f5dede;color:#7a2a2a}
  @media print{body{padding:16px}button{display:none}}
</style>
</head>
<body>
<div class="header">
  <div class="escudo">🏫</div>
  <div class="escuela-info">
    <h1>Escuela Primaria EduGestión</h1>
    <p>Ciudad Juárez, Chihuahua · Ciclo Escolar 2024-2025</p>
    <p>Boleta de Calificaciones · Emitida el ${fecha}</p>
  </div>
</div>

<h2>Datos del Alumno</h2>
<div class="grid">
  <div class="field"><label>Nombre completo</label><span>${alumno.nombre}</span></div>
  <div class="field"><label>CURP</label><span>${alumno.curp||"—"}</span></div>
  <div class="field"><label>Grupo</label><span>${alumno.grupo} — ${grupo?grupo.nombre:""}</span></div>
  <div class="field"><label>Maestro titular</label><span>${maestro?maestro.nombre:"—"}</span></div>
  <div class="field"><label>Fecha de nacimiento</label><span>${fmtFechaCorta(alumno.fechaNac)}</span></div>
  <div class="field"><label>Tipo de sangre</label><span>${alumno.sangre}</span></div>
  <div class="field"><label>Tutor</label><span>${alumno.tutor}</span></div>
  <div class="field"><label>Teléfono tutor</label><span>${alumno.tel||"—"}</span></div>
</div>

<h2>Resumen de Rendimiento</h2>
<div class="resumen">
  <div class="res-card">
    <div class="val" style="color:${prom>=8.5?"#2d6a3a":prom>=7?"#7a5a10":"#7a2a2a"}">${prom?prom.toFixed(1):"—"}</div>
    <div class="lbl">Promedio general</div>
  </div>
  <div class="res-card">
    <div class="val" style="color:${pct>=85?"#2d6a3a":pct>=75?"#7a5a10":"#7a2a2a"}">${pct}%</div>
    <div class="lbl">Asistencia</div>
  </div>
  <div class="res-card">
    <div class="val" style="color:${faltas>=10?"#7a2a2a":faltas>=6?"#7a5a10":"#2d6a3a"}">${faltas}</div>
    <div class="lbl">Faltas</div>
  </div>
</div>
<div style="margin-bottom:18px">
  Estado: <span class="badge ${riesgo==="bajo"?"b-green":riesgo==="medio"?"b-yellow":"b-red"}">
    ${riesgo==="bajo"?"✅ Sin riesgo":riesgo==="medio"?"👁️ En seguimiento":"🚨 Alto riesgo"}
  </span>
</div>

<h2>Calificaciones por Trimestre</h2>
${califs.length===0
  ? `<p style="color:#8a8a8a;padding:12px 0">Sin calificaciones registradas en este ciclo.</p>`
  : `<table>
      <thead><tr><th>Materia</th><th>1er Trimestre</th><th>2do Trimestre</th><th>3er Trimestre</th><th>Promedio</th></tr></thead>
      <tbody>${califs.map(filaCalif).join("")}</tbody>
     </table>`
}

<div class="firma">
  <div class="firma-box">
    <p>Firma del Maestro Titular</p>
    <p style="margin-top:4px;font-weight:600">${maestro?maestro.nombre:"___________________"}</p>
  </div>
  <div class="firma-box">
    <p>Firma del Director</p>
    <p style="margin-top:4px;font-weight:600">Ma. Norma Alvarez</p>
  </div>
</div>

<div class="footer">
  EduGestión · Sistema de Control Escolar · Ciudad Juárez, Chihuahua · ${fecha}
</div>

<script>window.onload=()=>window.print();</script>
</body>
</html>`;

  const win = window.open("","_blank","width=900,height=700");
  win.document.write(html);
  win.document.close();
}

/* ── MODAL EXPEDIENTE ── */
function ModalExpediente({ alumno, onClose }) {
  if(!alumno) return null;
  const db = useAppDB();
  const prom   = db.promedioAlumno(alumno.id);
  const faltas = db.faltasAlumno(alumno.id);
  const pct    = db.asistenciaPctAlumno(alumno.id);
  const riesgo = db.nivelRiesgo(alumno.id);
  const califs = db.calificaciones.filter(c=>c.alumnoId===alumno.id);

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <div className="modal-title">📁 Expediente Digital</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        {/* ENCABEZADO ALUMNO */}
        <div style={{display:"flex",alignItems:"center",gap:16,padding:16,
          background:"var(--bg-base)",borderRadius:12,marginBottom:20}}>
          <div className="av av-lg">{INITIALS(alumno.nombre)}</div>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:17}}>{alumno.nombre}</div>
            <div className="small muted">Grupo: {alumno.grupo} · ID: ALU-{alumno.id.slice(0,4).toUpperCase()}</div>
          </div>
          <span className={`badge badge-${riesgo==="alto"?"danger":riesgo==="medio"?"warning":"success"}`}>
            {riesgo==="alto"?"Alto riesgo":riesgo==="medio"?"Seguimiento":"Regular"}
          </span>
        </div>

        <div className="grid-2">
          {/* COL IZQUIERDA */}
          <div>
            <div className="exp-section">
              <div className="exp-section-title">Datos Personales</div>
              <div className="exp-row"><span>Nacimiento</span><span>{fmtFechaCorta(alumno.fechaNac)}</span></div>
              <div className="exp-row"><span>CURP</span><span style={{fontSize:11}}>{alumno.curp||"—"}</span></div>
              <div className="exp-row"><span>Tutor</span><span>{alumno.tutor}</span></div>
              <div className="exp-row"><span>Teléfono</span><span>{alumno.tel}</span></div>
              <div className="exp-row"><span>Email</span><span>{alumno.email||"—"}</span></div>
              <div className="exp-row"><span>Sangre</span><span>{alumno.sangre}</span></div>
              <div className="exp-row"><span>Alergias</span><span>{alumno.alergias}</span></div>
            </div>
          </div>
          {/* COL DERECHA */}
          <div>
            <div className="exp-section">
              <div className="exp-section-title">Rendimiento</div>
              <div className="exp-row">
                <span>Promedio general</span>
                <strong style={{color:prom>=8.5?"#3a7a5a":prom>=7?"#8a6a20":"#8a3a3a"}}>
                  {prom?prom.toFixed(2):"—"}
                </strong>
              </div>
              <div className="exp-row">
                <span>Asistencia</span>
                <strong style={{color:pct>=85?"#3a7a5a":pct>=75?"#8a6a20":"#8a3a3a"}}>{pct}%</strong>
              </div>
              <div className="exp-row"><span>Faltas</span><span>{faltas} días</span></div>
            </div>

            <div className="exp-section">
              <div className="exp-section-title">Calificaciones (Trimestres)</div>
              {califs.length===0
                ? <div className="muted small">Sin calificaciones</div>
                : califs.map(c=>{
                  const avg=((Number(c.tri1)||0)+(Number(c.tri2)||0)+(Number(c.tri3)||0))/3;
                  return (
                    <div className="exp-row" key={c.id}>
                      <span>{c.materia}</span>
                      <strong style={{color:avg>=8.5?"#3a7a5a":avg>=6?"#8a6a20":"#8a3a3a"}}>
                        {avg.toFixed(1)}
                      </strong>
                    </div>
                  );
                })
              }
            </div>

            <div className="exp-section">
              <div className="exp-section-title">Indicador de Riesgo</div>
              <div className="riesgo-meter">
                {[...Array(10)].map((_,i)=>(
                  <div key={i} className="riesgo-seg" style={{
                    background:i<3?"#3a7a5a":i<6?"#8a6a20":"#8a3a3a",
                    opacity:(riesgo==="bajo"&&i<3)||(riesgo==="medio"&&i<6)||riesgo==="alto"?1:0.15,
                  }}/>
                ))}
              </div>
              <div className="small muted">Calculado: faltas + promedio + asistencia</div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button className="btn" onClick={onClose}>Cerrar</button>
          <button className="btn btn-primary" onClick={()=>{
            descargarBoletaPDF(alumno, db);
            toast.success("Abriendo boleta para imprimir/guardar como PDF…");
          }}>
            📄 Descargar Boleta PDF
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── MODAL FORMULARIO ── */
function ModalFormAlumno({ alumno, grupos, onClose, onSave }) {
  const [form, setForm] = useState(alumno?{...alumno}:{...EMPTY_FORM});
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleSubmit = () => {
    if(!form.nombre?.trim()||!form.grupo||!form.tutor?.trim()){
      toast.error("Nombre, grupo y tutor son obligatorios"); return;
    }
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <div className="modal-title">{alumno?"✏️ Editar Alumno":"👨‍🎓 Nuevo Alumno"}</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="form-grid">
          <div className="form-group col-span-2">
            <label className="form-label">Nombre completo *</label>
            <input className="form-control" value={form.nombre} onChange={e=>set("nombre",e.target.value)} placeholder="Nombre(s) Apellido1 Apellido2"/>
          </div>
          <div className="form-group">
            <label className="form-label">Fecha de Nacimiento</label>
            <input type="date" className="form-control" value={form.fechaNac} onChange={e=>set("fechaNac",e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="form-label">CURP</label>
            <input className="form-control" value={form.curp} onChange={e=>set("curp",e.target.value.toUpperCase())} maxLength={18} placeholder="18 caracteres"/>
          </div>
          <div className="form-group">
            <label className="form-label">Grupo *</label>
            <select className="form-control" value={form.grupo} onChange={e=>set("grupo",e.target.value)}>
              <option value="">Seleccionar</option>
              {grupos.map(g=><option key={g.id} value={g.id}>{g.nombre}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Tipo de Sangre</label>
            <select className="form-control" value={form.sangre} onChange={e=>set("sangre",e.target.value)}>
              {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Tutor *</label>
            <input className="form-control" value={form.tutor} onChange={e=>set("tutor",e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="form-label">Teléfono</label>
            <input className="form-control" value={form.tel} onChange={e=>set("tel",e.target.value)} maxLength={10}/>
          </div>
          <div className="form-group col-span-2">
            <label className="form-label">Email del Tutor</label>
            <input type="email" className="form-control" value={form.email} onChange={e=>set("email",e.target.value)}/>
          </div>
          <div className="form-group col-span-2">
            <label className="form-label">Alergias / Condiciones</label>
            <textarea className="form-control" value={form.alergias} onChange={e=>set("alergias",e.target.value)}/>
          </div>
        </div>
        <div className="form-actions">
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            {alumno?"💾 Guardar":"➕ Registrar"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── VISTA PRINCIPAL ── */
function Alumnos() {
  const db = useAppDB();
  const [busqueda,   setBusqueda]   = useState("");
  const [modalForm,  setModalForm]  = useState(false);
  const [alumnoEdit, setAlumnoEdit] = useState(null);
  const [expediente, setExpediente] = useState(null);

  const filtrados = db.alumnos.filter(
    a=>a.nombre.toLowerCase().includes(busqueda.toLowerCase())
      ||a.grupo?.toLowerCase().includes(busqueda.toLowerCase())
      ||a.tutor?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleSave = (form) => {
    if(alumnoEdit){ db.editarAlumno(alumnoEdit.id,form); toast.success("Alumno actualizado"); }
    else          { db.agregarAlumno(form);              toast.success("Alumno registrado"); }
    setModalForm(false); setAlumnoEdit(null);
  };

  const handleEliminar = (a) => {
    if(window.confirm(`¿Eliminar a ${a.nombre}?`)){ db.eliminarAlumno(a.id); toast.success("Alumno eliminado"); }
  };

  const enRiesgo = db.alumnos.filter(a=>db.nivelRiesgo(a.id)==="alto").length;

  return (
    <Layout title="Gestión de Alumnos">
      <div className="stat-grid mb-24">
        <div className="stat-card">
          <div className="stat-icon" style={{background:"#dde6f5"}}>👨‍🎓</div>
          <div className="stat-label">Total Alumnos</div>
          <div className="stat-value">{db.alumnos.length}</div>
          <div className="stat-sub">{db.grupos.length} grupos activos</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background:"#d6eed9"}}>✅</div>
          <div className="stat-label">Activos</div>
          <div className="stat-value">{db.alumnos.length}</div>
          <div className="stat-sub">Inscritos este ciclo</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background:"#f5dede"}}>⚠️</div>
          <div className="stat-label">En Riesgo</div>
          <div className="stat-value" style={{color:enRiesgo>0?"#8a3a3a":"#3a7a5a"}}>{enRiesgo}</div>
          <div className="stat-sub">Requieren atención</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">📋 Lista de Alumnos</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <input className="form-control" style={{width:230}} placeholder="🔍 Buscar..."
              value={busqueda} onChange={e=>setBusqueda(e.target.value)}/>
            <button className="btn btn-primary" onClick={()=>{setAlumnoEdit(null);setModalForm(true);}}>
              ➕ Nuevo Alumno
            </button>
          </div>
        </div>

        {filtrados.length===0
          ? <div className="empty-state"><div className="empty-icon">👥</div><div className="empty-title">No se encontraron alumnos</div></div>
          : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Alumno</th>
                    <th>Grupo</th>
                    <th className="hide-mobile">Tutor</th>
                    <th className="hide-mobile">Teléfono</th>
                    <th>Promedio</th>
                    <th>Riesgo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map(a=>{
                    const prom   = db.promedioAlumno(a.id);
                    const riesgo = db.nivelRiesgo(a.id);
                    return (
                      <tr key={a.id}>
                        <td>
                          <div style={{display:"flex",alignItems:"center",gap:10}}>
                            <div className="av">{INITIALS(a.nombre)}</div>
                            <div>
                              <div style={{fontWeight:600}}>{a.nombre}</div>
                              <div className="small muted">{a.curp||"Sin CURP"}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="badge badge-info">{a.grupo}</span></td>
                        <td className="hide-mobile">{a.tutor}</td>
                        <td className="hide-mobile">{a.tel||"—"}</td>
                        <td>
                          <strong style={{color:prom>=8.5?"#3a7a5a":prom>=7?"#8a6a20":"#8a3a3a"}}>
                            {prom?prom.toFixed(1):"—"}
                          </strong>
                        </td>
                        <td>
                          <span className={`badge badge-${riesgo==="alto"?"danger":riesgo==="medio"?"warning":"success"}`}>
                            {riesgo==="alto"?"⚠️ Alto":riesgo==="medio"?"👁️ Medio":"✅ Bajo"}
                          </span>
                        </td>
                        <td>
                          <div style={{display:"flex",gap:5}}>
                            <button className="btn btn-sm" onClick={()=>setExpediente(a)}>📁</button>
                            <button className="btn btn-sm btn-primary" onClick={()=>{setAlumnoEdit(a);setModalForm(true);}}>✏️</button>
                            <button className="btn btn-sm btn-danger" onClick={()=>handleEliminar(a)}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        }
      </div>

      {modalForm && (
        <ModalFormAlumno
          alumno={alumnoEdit} grupos={db.grupos}
          onClose={()=>{setModalForm(false);setAlumnoEdit(null);}}
          onSave={handleSave}
        />
      )}
      {expediente && <ModalExpediente alumno={expediente} onClose={()=>setExpediente(null)}/>}
    </Layout>
  );
}

export default Alumnos;
