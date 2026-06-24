import React, { useState, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { useAppDB, Layout, useAuth } from "./App";

const INITIALS = (name) => name.split(" ").map(n=>n[0]).slice(0,2).join("").toUpperCase();
const ESTADOS  = ["presente","ausente","justificado"];
const ESTADO_ICON  = { presente:"✅", ausente:"❌", justificado:"📋" };
const ESTADO_LABEL = { presente:"Presente", ausente:"Ausente", justificado:"Justificado" };
const ESTADO_COLOR = { presente:"#16a34a", ausente:"#dc2626", justificado:"#d97706" };

/* Ciclo escolar SEP México 2024-2025:
   Inicio: 26 agosto 2024 | Fin: 25 julio 2025
   ~200 días hábiles. Periodos de vacaciones principales:
   - Navidad: 23 dic – 6 ene
   - Semana Santa: 14–19 abr
   - Suspensiones nacionales ~5 días
*/
const CICLO_INICIO = new Date("2024-08-26");
const CICLO_FIN    = new Date("2025-07-25");
const DIAS_HABILES_CICLO = 200;

function diasTranscurridos() {
  const hoy = new Date();
  const fin  = hoy < CICLO_FIN ? hoy : CICLO_FIN;
  if (fin < CICLO_INICIO) return 0;
  const diff = Math.floor((fin - CICLO_INICIO) / (1000*60*60*24));
  // aprox 70% días hábiles
  return Math.min(Math.round(diff * 0.7), DIAS_HABILES_CICLO);
}

const padZ = n => String(n).padStart(2,"0");
const fmt  = (y,m,d) => `${y}-${padZ(m+1)}-${padZ(d)}`;

/* ── MINI CALENDARIO MENSUAL ── */
function CalendarioMes({ año, mes, registros }) {
  const diasMes  = new Date(año, mes+1, 0).getDate();
  const offset   = new Date(año, mes, 1).getDay();
  const celdas   = [];
  for(let i=0;i<offset;i++) celdas.push(null);
  for(let d=1;d<=diasMes;d++) celdas.push(d);
  const DIAS = ["D","L","M","M","J","V","S"];

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
        {DIAS.map(d=>(
          <div key={d} style={{textAlign:"center",fontSize:10,fontWeight:700,color:"var(--text-muted)",padding:2}}>{d}</div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
        {celdas.map((d,i)=>{
          if(!d) return <div key={i}/>;
          const f = fmt(año,mes,d);
          const est = registros[f];
          const color = est ? ESTADO_COLOR[est] : undefined;
          const hoy   = new Date().toISOString().slice(0,10)===f;
          return (
            <div key={i} title={est ? ESTADO_LABEL[est] : "Sin registro"} style={{
              width:"100%",aspectRatio:"1",borderRadius:4,
              background: est ? color+"22" : "var(--bg-base)",
              border: hoy ? `2px solid ${color||"var(--accent)"}` : `1px solid ${est?color+"55":"var(--border)"}`,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:10,fontWeight:hoy?700:400,color: est?color:"var(--text-muted)",
              cursor:"default",
            }}>
              {d}
            </div>
          );
        })}
      </div>
      {/* Leyenda */}
      <div style={{display:"flex",gap:10,marginTop:8,flexWrap:"wrap"}}>
        {Object.entries(ESTADO_LABEL).map(([k,v])=>(
          <div key={k} style={{display:"flex",alignItems:"center",gap:4,fontSize:11}}>
            <div style={{width:10,height:10,borderRadius:2,background:ESTADO_COLOR[k]+"55",border:`1px solid ${ESTADO_COLOR[k]}`}}/>
            {v}
          </div>
        ))}
        <div style={{display:"flex",alignItems:"center",gap:4,fontSize:11}}>
          <div style={{width:10,height:10,borderRadius:2,background:"var(--bg-base)",border:"1px solid var(--border)"}}/>
          Sin registro
        </div>
      </div>
    </div>
  );
}

/* ── MODAL HISTORIAL ── */
function ModalHistorial({ alumno, onClose }) {
  const db = useAppDB();
  const hoy    = new Date();
  const [año,  setAño]  = useState(hoy.getFullYear());
  const [mes,  setMes]  = useState(hoy.getMonth());

  const registros = useMemo(()=>{
    const map = {};
    db.asistencia.filter(a=>a.alumnoId===alumno.id).forEach(a=>{ map[a.fecha]=a.estado; });
    return map;
  },[db.asistencia, alumno.id]);

  const faltas       = Object.values(registros).filter(e=>e==="ausente").length;
  const justificadas = Object.values(registros).filter(e=>e==="justificado").length;
  const presentes    = Object.values(registros).filter(e=>e==="presente").length;
  const totalReg     = Object.keys(registros).length;
  const pct          = totalReg ? Math.round((presentes/totalReg)*100) : 100;

  const prevMes = () => { if(mes===0){setMes(11);setAño(a=>a-1);}else setMes(m=>m-1); };
  const nextMes = () => { if(mes===11){setMes(0);setAño(a=>a+1);}else setMes(m=>m+1); };

  const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <div className="modal-title">📅 Historial de Asistencia</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        {/* Alumno info */}
        <div style={{display:"flex",alignItems:"center",gap:12,padding:12,background:"var(--bg-base)",borderRadius:10,marginBottom:16}}>
          <div className="av">{INITIALS(alumno.nombre)}</div>
          <div>
            <div style={{fontWeight:700}}>{alumno.nombre}</div>
            <div className="small muted">Grupo {alumno.grupo}</div>
          </div>
        </div>

        {/* Resumen */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
          {[
            {lbl:"Presentes",    val:presentes,    color:"#16a34a",bg:"#dcfce7"},
            {lbl:"Faltas",       val:faltas,       color:"#dc2626",bg:"#fee2e2"},
            {lbl:"Justificadas", val:justificadas, color:"#d97706",bg:"#fef9c3"},
            {lbl:"% Asistencia", val:pct+"%",      color:"#2563eb",bg:"#dbeafe"},
          ].map(({lbl,val,color,bg})=>(
            <div key={lbl} style={{background:bg,borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
              <div style={{fontSize:22,fontWeight:800,color}}>{val}</div>
              <div style={{fontSize:11,fontWeight:700,color}}>{lbl}</div>
            </div>
          ))}
        </div>

        {/* Progreso ciclo escolar */}
        <div style={{background:"var(--bg-base)",border:"1px solid var(--border)",borderRadius:10,padding:"10px 14px",marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
            <span style={{fontWeight:600}}>Ciclo 2024-2025 (SEP)</span>
            <span style={{color:"var(--text-muted)"}}>26-ago-2024 al 25-jul-2025 · ~{DIAS_HABILES_CICLO} días hábiles</span>
          </div>
          <div style={{background:"var(--border)",borderRadius:999,height:6,overflow:"hidden"}}>
            <div style={{width:`${Math.round(diasTranscurridos()/DIAS_HABILES_CICLO*100)}%`,
              background:"var(--accent)",height:"100%",borderRadius:999}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginTop:3,color:"var(--text-muted)"}}>
            <span>Transcurridos: {diasTranscurridos()} días</span>
            <span>Restantes: {DIAS_HABILES_CICLO - diasTranscurridos()} días</span>
          </div>
        </div>

        {/* Navegación meses */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <button className="btn btn-sm" onClick={prevMes}>‹ Anterior</button>
          <strong>{MESES[mes]} {año}</strong>
          <button className="btn btn-sm" onClick={nextMes}>Siguiente ›</button>
        </div>

        <CalendarioMes año={año} mes={mes} registros={registros}/>

        <div className="form-actions">
          <button className="btn" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

/* ── VISTA PRINCIPAL ── */
function Asistencia() {
  const db   = useAppDB();
  const auth = useAuth();

  const today     = new Date().toISOString().slice(0,10);
  const [fecha,   setFecha]      = useState(today);
  const [histAlumno, setHistAlumno] = useState(null);

  // Si es maestro, forzar su grupo; si es admin puede elegir
  const gruposMaestro = auth?.rol === "maestro"
    ? db.grupos.filter(g => g.id === auth.grupo)
    : db.grupos;

  const [grupoId, setGrupoId] = useState(
    auth?.rol === "maestro" ? auth.grupo : (db.grupos[0]?.id || "")
  );

  const alumnosGrupo = useMemo(()=>
    db.alumnos.filter(a=>a.grupo===grupoId),
    [db.alumnos, grupoId]
  );

  const getEstado = useCallback((alumnoId)=>{
    const reg = db.asistencia.find(a=>a.alumnoId===alumnoId && a.fecha===fecha);
    return reg?.estado || "presente";
  },[db.asistencia, fecha]);

  const toggleEstado = useCallback((alumnoId)=>{
    const actual  = getEstado(alumnoId);
    const siguiente = ESTADOS[(ESTADOS.indexOf(actual)+1)%ESTADOS.length];
    const maestroId = db.grupos.find(g=>g.id===grupoId)?.maestroId || "";
    db.guardarAsistencia(alumnoId, fecha, siguiente, maestroId);
  },[getEstado, db, grupoId, fecha]);

  const guardarTodo = () => {
    toast.success(`Asistencia del ${fecha} guardada correctamente`);
  };

  const marcarTodos = (estado) => {
    const maestroId = db.grupos.find(g=>g.id===grupoId)?.maestroId || "";
    alumnosGrupo.forEach(a => db.guardarAsistencia(a.id, fecha, estado, maestroId));
    toast.success(`Todos marcados como ${ESTADO_LABEL[estado].toLowerCase()}`);
  };

  // Stats del día
  const asistHoy   = db.asistencia.filter(a=>a.fecha===fecha&&alumnosGrupo.some(al=>al.id===a.alumnoId));
  const presentes  = asistHoy.filter(a=>a.estado==="presente").length;
  const ausentes   = asistHoy.filter(a=>a.estado==="ausente").length;
  const justificados = asistHoy.filter(a=>a.estado==="justificado").length;
  const pctHoy     = alumnosGrupo.length ? Math.round((presentes/alumnosGrupo.length)*100) : 0;

  // Progreso ciclo
  const pctCiclo = Math.round(diasTranscurridos()/DIAS_HABILES_CICLO*100);

  const grupo = db.grupos.find(g=>g.id===grupoId);
  const maestro = grupo ? db.maestros.find(m=>m.id===grupo.maestroId) : null;

  return (
    <Layout title="Control de Asistencia">
      <div className="card mb-24">
        <div className="card-header">
          <div className="card-title">📋 Pase de Lista</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
            {/* Grupo — solo admin puede cambiar */}
            {auth?.rol !== "maestro" && (
              <select className="form-control" style={{width:140}} value={grupoId}
                onChange={e=>setGrupoId(e.target.value)}>
                {db.grupos.map(g=><option key={g.id} value={g.id}>{g.nombre}</option>)}
              </select>
            )}
            {auth?.rol === "maestro" && (
              <span className="badge badge-info" style={{fontSize:14,padding:"6px 14px"}}>
                {grupo?.nombre || grupoId}
              </span>
            )}
            <input type="date" className="form-control" style={{width:160}}
              value={fecha} onChange={e=>setFecha(e.target.value)}
              max={today}/>
          </div>
        </div>

        {/* Info grupo */}
        {maestro && (
          <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:14,padding:"8px 12px",
            background:"var(--bg-base)",borderRadius:8,fontSize:13}}>
            <div className="av" style={{width:28,height:28,fontSize:11}}>{INITIALS(maestro.nombre)}</div>
            <span><strong>Titular:</strong> {maestro.nombre}</span>
            <span className="muted">·</span>
            <span><strong>Salón:</strong> {grupo?.salon}</span>
            <span className="muted">·</span>
            <span><strong>Turno:</strong> Matutino</span>
          </div>
        )}

        {/* Contadores */}
        <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
          {[
            {lbl:"PRESENTES",    val:presentes,     color:"#16a34a",bg:"#f0fdf4",border:"#86efac"},
            {lbl:"AUSENTES",     val:ausentes,      color:"#dc2626",bg:"#fef2f2",border:"#fca5a5"},
            {lbl:"JUSTIFICADOS", val:justificados,  color:"#d97706",bg:"#fffbeb",border:"#fcd34d"},
            {lbl:"ASISTENCIA",   val:pctHoy+"%",    color:"#2563eb",bg:"#eff6ff",border:"#93c5fd"},
          ].map(({lbl,val,color,bg,border})=>(
            <div key={lbl} style={{flex:1,minWidth:80,background:bg,border:`1px solid ${border}`,
              borderRadius:10,padding:"10px 14px",textAlign:"center"}}>
              <div style={{fontSize:24,fontWeight:800,color}}>{val}</div>
              <div style={{fontSize:10,fontWeight:700,color}}>{lbl}</div>
            </div>
          ))}
        </div>

        {/* Progreso ciclo escolar */}
        <div style={{background:"var(--bg-base)",border:"1px solid var(--border)",
          borderRadius:10,padding:"10px 14px",marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
            <strong>Ciclo escolar 2024-2025 (SEP México)</strong>
            <span style={{color:"var(--text-muted)"}}>26-ago-2024 · 25-jul-2025 · {DIAS_HABILES_CICLO} días hábiles</span>
          </div>
          <div style={{background:"var(--border)",borderRadius:999,height:8,overflow:"hidden"}}>
            <div style={{width:`${pctCiclo}%`,background:"linear-gradient(90deg,var(--accent),#7c3aed)",
              height:"100%",borderRadius:999,transition:"width .5s"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginTop:3,color:"var(--text-muted)"}}>
            <span>Días transcurridos: <strong>{diasTranscurridos()}</strong></span>
            <span>{pctCiclo}% del ciclo</span>
            <span>Días restantes: <strong>{DIAS_HABILES_CICLO - diasTranscurridos()}</strong></span>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
          <button className="btn btn-sm btn-success" onClick={()=>marcarTodos("presente")}>✅ Todos presentes</button>
          <button className="btn btn-sm btn-danger"  onClick={()=>marcarTodos("ausente")}>❌ Todos ausentes</button>
          <button className="btn btn-sm"             onClick={()=>marcarTodos("justificado")}>📋 Todos justificados</button>
          <button className="btn btn-sm btn-primary" style={{marginLeft:"auto"}} onClick={guardarTodo}>💾 Confirmar pase de lista</button>
        </div>

        {/* Grid de alumnos */}
        {alumnosGrupo.length===0
          ? <div className="empty-state"><div className="empty-icon">👥</div><div className="empty-title">No hay alumnos en este grupo</div></div>
          : (
            <div className="asistencia-grid">
              {alumnosGrupo.map(a=>{
                const estado = getEstado(a.id);
                return (
                  <div key={a.id} className={`asistencia-card ${estado}`}>
                    <div className="av">{INITIALS(a.nombre)}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:600,fontSize:13,
                        overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        {a.nombre.split(" ").slice(0,2).join(" ")}
                      </div>
                      <div className="small" style={{color:ESTADO_COLOR[estado],fontWeight:600}}>
                        {ESTADO_LABEL[estado]}
                      </div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end"}}>
                      <div onClick={()=>toggleEstado(a.id)}
                        style={{cursor:"pointer",fontSize:22,userSelect:"none"}}
                        title="Clic para cambiar estado">
                        {ESTADO_ICON[estado]}
                      </div>
                      <button className="btn btn-sm" style={{fontSize:10,padding:"2px 6px"}}
                        onClick={()=>setHistAlumno(a)} title="Ver historial">
                        📅
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        }
      </div>

      {histAlumno && (
        <ModalHistorial alumno={histAlumno} onClose={()=>setHistAlumno(null)}/>
      )}
    </Layout>
  );
}

export default Asistencia;
