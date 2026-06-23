import React, { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { useAppDB, Layout, useAuth } from "./App";

const INITIALS = (name) => name.split(" ").map(n=>n[0]).slice(0,2).join("").toUpperCase();
const ESTADOS  = ["presente","ausente","justificado"];
const ESTADO_ICON  = { presente:"✅", ausente:"❌", justificado:"📋" };
const ESTADO_LABEL = { presente:"Presente", ausente:"Ausente", justificado:"Justificado" };

/* Días hábiles aproximados del ciclo escolar 2024-2025 en México
   SEP: inicio 26-ago-2024, fin 25-jul-2025
   Suspensiones nacionales incluidas (~200 días hábiles) */
const DIAS_HABILES_CICLO = 200;

/* Genera un Set de fechas con asistencia de un alumno para el calendario */
function useFechasAlumno(db, alumnoId) {
  return useMemo(()=>{
    const map = {};
    db.asistencia
      .filter(a=>a.alumnoId===alumnoId)
      .forEach(a=>{ map[a.fecha]=a.estado; });
    return map;
  },[db.asistencia, alumnoId]);
}

/* Mini calendario mensual para historial */
function CalendarioMes({ año, mes, registros }) {
  const primerDia = new Date(año, mes, 1);
  const diasMes   = new Date(año, mes+1, 0).getDate();
  const offset    = primerDia.getDay(); // 0=dom

  const celdas = [];
  for(let i=0; i<offset; i++) celdas.push(null);
  for(let d=1; d<=diasMes; d++) celdas.push(d);

  const padZ = n => String(n).padStart(2,"0");
  const fmtFecha = (d) => `${año}-${padZ(mes+1)}-${padZ(d)}`;

  const COLOR = { presente:"#16a34a", ausente:"#dc2626", justificado:"#d97706" };

  return (
    <div style={{fontFamily:"inherit"}}>
      <div style={{
        display:"grid",gridTemplateColumns:"repeat(7,1fr)",
        gap:2,textAlign:"center",fontSize:11
      }}>
        {["D","L","M","X","J","V","S"].map(d=>(
          <div key={d} style={{fontWeight:700,color:"#64748b",padding:"2px 0"}}>{d}</div>
        ))}
        {celdas.map((d,i)=>{
          if(!d) return <div key={`e${i}`}/>;
          const f = fmtFecha(d);
          const est = registros[f];
          return (
            <div key={f} style={{
              width:"100%",paddingTop:"100%",position:"relative",borderRadius:4,
              background: est ? `${COLOR[est]}22` : "transparent",
              border: est ? `1px solid ${COLOR[est]}66` : "1px solid transparent",
            }}>
              <span style={{
                position:"absolute",top:"50%",left:"50%",
                transform:"translate(-50%,-50%)",
                fontSize:10,fontWeight:est?700:400,
                color:est?COLOR[est]:"#94a3b8"
              }}>
                {est ? ESTADO_ICON[est] : d}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* Modal historial alumno */
function ModalHistorial({ alumno, onClose }) {
  const db = useAppDB();
  const registros = useFechasAlumno(db, alumno.id);
  const hoy = new Date();
  const [vistaAño, setVistaAño] = useState(hoy.getFullYear());
  const [vistaMes, setVistaMes] = useState(hoy.getMonth());

  const faltas  = Object.values(registros).filter(e=>e==="ausente").length;
  const justif  = Object.values(registros).filter(e=>e==="justificado").length;
  const present = Object.values(registros).filter(e=>e==="presente").length;
  const total   = Object.keys(registros).length;
  const pct     = total ? Math.round((present/total)*100) : 100;

  const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
                 "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const prevMes = ()=>{ if(vistaMes===0){setVistaMes(11);setVistaAño(y=>y-1);}else setVistaMes(m=>m-1); };
  const nextMes = ()=>{ if(vistaMes===11){setVistaMes(0);setVistaAño(y=>y+1);}else setVistaMes(m=>m+1); };

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <div className="modal-title">📅 Historial de Asistencia</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",marginBottom:12}}>
          <div className="av av-lg">{INITIALS(alumno.nombre)}</div>
          <div>
            <div style={{fontWeight:700,fontSize:16}}>{alumno.nombre}</div>
            <div className="small muted">Grupo {alumno.grupo}</div>
          </div>
        </div>

        {/* Resumen */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
          {[
            {lbl:"Presentes",  val:present, color:"#16a34a", bg:"#f0fdf4"},
            {lbl:"Ausentes",   val:faltas,  color:"#dc2626", bg:"#fef2f2"},
            {lbl:"Justific.",  val:justif,  color:"#d97706", bg:"#fffbeb"},
            {lbl:"Asistencia", val:pct+"%", color:"#2563eb", bg:"#eff6ff"},
          ].map(({lbl,val,color,bg})=>(
            <div key={lbl} style={{background:bg,borderRadius:10,padding:"10px",textAlign:"center"}}>
              <div style={{fontSize:22,fontWeight:800,color}}>{val}</div>
              <div style={{fontSize:11,fontWeight:700,color,opacity:.7}}>{lbl}</div>
            </div>
          ))}
        </div>

        {/* Progreso ciclo */}
        <div style={{marginBottom:16,background:"#f8fafc",borderRadius:10,padding:12}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:13}}>
            <span style={{fontWeight:600}}>Progreso del ciclo escolar 2024-2025</span>
            <span style={{color:"#64748b"}}>{total} / {DIAS_HABILES_CICLO} días</span>
          </div>
          <div style={{background:"#e2e8f0",borderRadius:999,height:8,overflow:"hidden"}}>
            <div style={{
              width:`${Math.min(100,(total/DIAS_HABILES_CICLO)*100).toFixed(1)}%`,
              background:"#2563eb",height:"100%",borderRadius:999,transition:"width .4s"
            }}/>
          </div>
          <div style={{marginTop:6,fontSize:12,color:"#64748b"}}>
            Ciclo SEP: 26-ago-2024 al 25-jul-2025 · ~200 días hábiles
          </div>
        </div>

        {/* Calendario */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
          <button className="btn btn-sm" onClick={prevMes}>‹</button>
          <span style={{fontWeight:700}}>{MESES[vistaMes]} {vistaAño}</span>
          <button className="btn btn-sm" onClick={nextMes}>›</button>
        </div>
        <CalendarioMes año={vistaAño} mes={vistaMes} registros={registros}/>

        {/* Leyenda */}
        <div style={{display:"flex",gap:16,marginTop:12,fontSize:12,justifyContent:"center"}}>
          <span>✅ Presente</span>
          <span>❌ Ausente</span>
          <span>📋 Justificado</span>
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

function Asistencia() {
  const db   = useAppDB();
  const auth = useAuth();

  // Si es maestro, fijar su grupo; si es admin, puede cambiar
  const grupoInicial = auth?.rol==="maestro" && auth?.grupo
    ? auth.grupo
    : db.grupos?.[0]?.id ?? "";

  const [fecha,       setFecha]      = useState(new Date().toISOString().slice(0,10));
  const [grupoId,     setGrupoId]    = useState(grupoInicial);
  const [histAlumno,  setHistAlumno] = useState(null);

  const alumnosGrupo = useMemo(()=>db.alumnos.filter(a=>a.grupo===grupoId),[db.alumnos,grupoId]);

  const registros = useMemo(()=>db.asistenciaPorFecha(fecha),[db,fecha]);

  const getEstado = (alumnoId) => {
    const r = registros.find(r=>r.alumnoId===alumnoId);
    return r ? r.estado : "presente";
  };

  const toggleEstado = (alumnoId) => {
    const actual = getEstado(alumnoId);
    const idx = ESTADOS.indexOf(actual);
    const nuevo = ESTADOS[(idx+1)%ESTADOS.length];
    const maestroId = auth?.rol==="maestro" ? auth.maestroId : db.grupos.find(g=>g.id===grupoId)?.maestroId||"m1";
    db.guardarAsistencia(alumnoId, fecha, nuevo, maestroId);
  };

  const setTodos = (estado) => {
    const maestroId = auth?.rol==="maestro" ? auth.maestroId : db.grupos.find(g=>g.id===grupoId)?.maestroId||"m1";
    alumnosGrupo.forEach(a=>db.guardarAsistencia(a.id, fecha, estado, maestroId));
    toast.success(`Todos marcados como ${ESTADO_LABEL[estado]}`);
  };

  const guardarLista = () => toast.success("✅ Lista de asistencia guardada");

  const presentes    = alumnosGrupo.filter(a=>getEstado(a.id)==="presente").length;
  const ausentes     = alumnosGrupo.filter(a=>getEstado(a.id)==="ausente").length;
  const justificados = alumnosGrupo.filter(a=>getEstado(a.id)==="justificado").length;
  const pctHoy       = alumnosGrupo.length ? Math.round((presentes/alumnosGrupo.length)*100) : 0;

  return (
    <Layout title="Pase de Lista Digital">
      <div className="card mb-16">
        <div className="card-header" style={{flexWrap:"wrap",gap:12}}>
          <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
            <div className="form-group" style={{margin:0}}>
              <label className="form-label">📅 Fecha</label>
              <input type="date" className="form-control" value={fecha}
                onChange={e=>setFecha(e.target.value)} style={{width:160}}/>
            </div>
            {auth?.rol==="admin" && (
              <div className="form-group" style={{margin:0}}>
                <label className="form-label">🏫 Grupo</label>
                <select className="form-control" value={grupoId}
                  onChange={e=>setGrupoId(e.target.value)} style={{width:150}}>
                  {db.grupos.map(g=>(
                    <option key={g.id} value={g.id}>{g.nombre}</option>
                  ))}
                </select>
              </div>
            )}
            {auth?.rol==="maestro" && (
              <div style={{
                background:"#f0fdf4",border:"1px solid #bbf7d0",
                borderRadius:8,padding:"6px 14px",fontSize:13,fontWeight:600,color:"#15803d"
              }}>
                🏫 Grupo {auth.grupo}
              </div>
            )}
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <button className="btn btn-sm btn-success" onClick={()=>setTodos("presente")}>✅ Todos presentes</button>
            <button className="btn btn-sm btn-danger"  onClick={()=>setTodos("ausente")}>❌ Todos ausentes</button>
            <button className="btn btn-sm btn-primary" onClick={guardarLista}>💾 Guardar Lista</button>
          </div>
        </div>

        {/* Resumen del día */}
        <div style={{display:"flex",gap:12,marginBottom:20}}>
          {[
            {lbl:"PRESENTES",    val:presentes,    color:"#16a34a", border:"#86efac", bg:"#f0fdf4"},
            {lbl:"AUSENTES",     val:ausentes,     color:"#dc2626", border:"#fca5a5", bg:"#fef2f2"},
            {lbl:"JUSTIFICADOS", val:justificados, color:"#d97706", border:"#fcd34d", bg:"#fffbeb"},
            {lbl:"ASISTENCIA",   val:pctHoy+"%",   color:"#1a56db", border:"#93c5fd", bg:"#eff6ff"},
          ].map(({lbl,val,color,border,bg})=>(
            <div key={lbl} style={{flex:1,background:bg,border:`1px solid ${border}`,
              borderRadius:10,padding:"10px 16px",textAlign:"center"}}>
              <div style={{fontSize:26,fontWeight:800,color}}>{val}</div>
              <div style={{fontSize:11,fontWeight:700,color}}>{lbl}</div>
            </div>
          ))}
        </div>

        {/* Progreso del ciclo */}
        <div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:10,padding:"10px 16px",marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
            <span style={{fontWeight:600}}>Ciclo escolar 2024-2025 (SEP México)</span>
            <span style={{color:"#64748b"}}>~200 días hábiles · 26-ago-2024 al 25-jul-2025</span>
          </div>
          <div style={{background:"#e2e8f0",borderRadius:999,height:6}}>
            <div style={{
              width:"65%",background:"linear-gradient(90deg,#2563eb,#7c3aed)",
              height:"100%",borderRadius:999
            }}/>
          </div>
        </div>

        {/* Grid alumnos */}
        {alumnosGrupo.length===0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <div className="empty-title">No hay alumnos en este grupo</div>
          </div>
        ) : (
          <div className="asistencia-grid">
            {alumnosGrupo.map(a=>{
              const estado = getEstado(a.id);
              return (
                <div key={a.id} className={`asistencia-card ${estado}`}
                  title="Clic para cambiar estado">
                  <div className="av">{INITIALS(a.nombre)}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:600,fontSize:13,overflow:"hidden",
                      textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                      {a.nombre.split(" ").slice(0,2).join(" ")}
                    </div>
                    <div className="small" style={{
                      color:estado==="presente"?"#15803d":estado==="ausente"?"#b91c1c":"#b45309",
                      fontWeight:600
                    }}>
                      {ESTADO_LABEL[estado]}
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end"}}>
                    <div className="asistencia-estado" onClick={()=>toggleEstado(a.id)}
                      style={{cursor:"pointer",fontSize:22,userSelect:"none"}}>
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
        )}
      </div>

      {histAlumno && (
        <ModalHistorial alumno={histAlumno} onClose={()=>setHistAlumno(null)}/>
      )}
    </Layout>
  );
}

export default Asistencia;
