import React, { useState } from "react";
import toast from "react-hot-toast";
import { useAppDB, Layout } from "./App";

const INITIALS = (n="") => n.split(" ").map(w=>w[0]||"").slice(0,2).join("").toUpperCase();

const MATERIAS_PRIMARIA = [
  "Español","Matemáticas","Ciencias Naturales","Historia",
  "Geografía","Formación Cívica y Ética","Educación Artística","Educación Física",
];

const EMPTY_FORM = { nombre:"", email:"", tel:"", grupo:"", usuario:"", pass:"1111" };

/* ── MODAL FORMULARIO ── */
function ModalMaestro({ maestro, grupos, maestrosActivos, onClose, onSave }) {
  const [form, setForm] = useState(maestro ? {...maestro} : {...EMPTY_FORM});
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  // grupos ya asignados (excluyendo el grupo actual si estamos editando)
  const gruposOcupados = maestrosActivos
    .filter(m => !maestro || m.id !== maestro.id)
    .map(m => m.grupo);

  const handleSubmit = () => {
    if(!form.nombre?.trim())  { toast.error("El nombre es obligatorio");    return; }
    if(!form.email?.trim())   { toast.error("El correo es obligatorio");     return; }
    if(!form.grupo)           { toast.error("Debes asignar un grupo");       return; }
    if(gruposOcupados.includes(form.grupo)) {
      toast.error("Ese grupo ya tiene un maestro titular asignado"); return;
    }
    if(!form.usuario?.trim()) { toast.error("El usuario de acceso es obligatorio"); return; }
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <div className="modal-title">{maestro ? "✏️ Editar Maestro" : "👩‍🏫 Nuevo Maestro"}</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        <div className="form-grid">
          <div className="form-group col-span-2">
            <label className="form-label">Nombre completo *</label>
            <input className="form-control" value={form.nombre}
              onChange={e=>set("nombre",e.target.value)} placeholder="Nombre Apellido1 Apellido2"/>
          </div>
          <div className="form-group">
            <label className="form-label">Correo electrónico *</label>
            <input type="email" className="form-control" value={form.email}
              onChange={e=>set("email",e.target.value)} placeholder="correo@escuela.edu"/>
          </div>
          <div className="form-group">
            <label className="form-label">Teléfono</label>
            <input className="form-control" value={form.tel}
              onChange={e=>set("tel",e.target.value)} placeholder="10 dígitos" maxLength={10}/>
          </div>
          <div className="form-group">
            <label className="form-label">Grupo titular *</label>
            <select className="form-control" value={form.grupo} onChange={e=>set("grupo",e.target.value)}>
              <option value="">Seleccionar grupo</option>
              {grupos.map(g=>(
                <option key={g.id} value={g.id}
                  disabled={gruposOcupados.includes(g.id)}>
                  {g.nombre} {gruposOcupados.includes(g.id) ? "(ocupado)" : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Usuario de acceso *</label>
            <input className="form-control" value={form.usuario}
              onChange={e=>set("usuario",e.target.value.trim())} placeholder="Ej: m13"/>
          </div>
          <div className="form-group col-span-2">
            <label className="form-label">Contraseña</label>
            <input className="form-control" value={form.pass}
              onChange={e=>set("pass",e.target.value)} placeholder="mínimo 4 caracteres"/>
            <span className="small muted">El maestro usará este usuario y contraseña para iniciar sesión.</span>
          </div>

          {/* Materias — solo informativo */}
          <div className="form-group col-span-2">
            <label className="form-label">Materias que imparte</label>
            <div style={{background:"var(--bg-base)",border:"1px solid var(--border)",
              borderRadius:8,padding:"10px 12px",fontSize:13}}>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {MATERIAS_PRIMARIA.map(m=>(
                  <span key={m} className="badge badge-info">{m}</span>
                ))}
              </div>
              <div className="small muted" style={{marginTop:8}}>
                En primaria el maestro titular imparte todas las materias a su grupo.
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            {maestro ? "💾 Guardar cambios" : "➕ Registrar maestro"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── MODAL DETALLE ── */
function ModalDetalle({ maestro, grupos, alumnos, onClose, onEdit }) {
  const grupo = grupos.find(g=>g.id===maestro.grupo);
  const misAlumnos = alumnos.filter(a=>a.grupo===maestro.grupo);

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <div className="modal-title">👩‍🏫 Perfil del Maestro</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:16,padding:16,
          background:"var(--bg-base)",borderRadius:12,marginBottom:20}}>
          <div className="av av-lg" style={{fontSize:20}}>{INITIALS(maestro.nombre)}</div>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:17}}>{maestro.nombre}</div>
            <div className="small muted">Grupo {grupo?.nombre || maestro.grupo} · Turno matutino</div>
          </div>
          <span className="badge badge-success">Activo</span>
        </div>

        <div className="grid-2">
          <div>
            <div className="exp-section">
              <div className="exp-section-title">Datos de contacto</div>
              <div className="exp-row"><span>Correo</span><span>{maestro.email}</span></div>
              <div className="exp-row"><span>Teléfono</span><span>{maestro.tel||"—"}</span></div>
              <div className="exp-row"><span>Usuario sistema</span><span>{maestro.usuario}</span></div>
              <div className="exp-row"><span>Salón</span><span>{grupo?.salon||"—"}</span></div>
            </div>
            <div className="exp-section">
              <div className="exp-section-title">Estadísticas del grupo</div>
              <div className="exp-row"><span>Total alumnos</span><strong>{misAlumnos.length}</strong></div>
            </div>
          </div>
          <div>
            <div className="exp-section">
              <div className="exp-section-title">Materias que imparte</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:4}}>
                {MATERIAS_PRIMARIA.map(m=>(
                  <span key={m} className="badge badge-info">{m}</span>
                ))}
              </div>
            </div>
            <div className="exp-section">
              <div className="exp-section-title">Alumnos del grupo ({misAlumnos.length})</div>
              <div style={{maxHeight:160,overflowY:"auto",display:"flex",flexDirection:"column",gap:4}}>
                {misAlumnos.length===0
                  ? <span className="small muted">Sin alumnos asignados</span>
                  : misAlumnos.map(a=>(
                    <div key={a.id} style={{display:"flex",alignItems:"center",gap:8,fontSize:13}}>
                      <div className="av" style={{width:24,height:24,fontSize:10}}>{INITIALS(a.nombre)}</div>
                      <span>{a.nombre}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button className="btn" onClick={onClose}>Cerrar</button>
          <button className="btn btn-primary" onClick={()=>{onClose();onEdit(maestro);}}>✏️ Editar</button>
        </div>
      </div>
    </div>
  );
}

/* ── VISTA PRINCIPAL ── */
function Maestros() {
  const db = useAppDB();
  const [busqueda,    setBusqueda]   = useState("");
  const [modalForm,   setModalForm]  = useState(false);
  const [maestroEdit, setMaestroEdit]= useState(null);
  const [detalle,     setDetalle]    = useState(null);

  const filtrados = db.maestros.filter(
    m => m.nombre.toLowerCase().includes(busqueda.toLowerCase())
      || m.email?.toLowerCase().includes(busqueda.toLowerCase())
      || m.grupo?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleSave = (form) => {
    if(maestroEdit) { db.editarMaestro(maestroEdit.id, form); toast.success("Maestro actualizado"); }
    else            { db.agregarMaestro(form);                toast.success("Maestro registrado");  }
    setModalForm(false); setMaestroEdit(null);
  };

  const handleEliminar = (m) => {
    if(window.confirm(`¿Eliminar al maestro ${m.nombre}?\nSu grupo quedará sin titular asignado.`)){
      db.eliminarMaestro(m.id);
      toast.success("Maestro eliminado del sistema");
    }
  };

  const abrirEditar = (m) => { setMaestroEdit(m); setModalForm(true); };

  // stats
  const gruposConMaestro = db.grupos.filter(g => db.maestros.some(m=>m.grupo===g.id)).length;
  const gruposSinMaestro = db.grupos.length - gruposConMaestro;

  return (
    <Layout title="Gestión de Maestros">
      {/* STATS */}
      <div className="stat-grid mb-24">
        <div className="stat-card">
          <div className="stat-icon" style={{background:"var(--info-bg)"}}>👩‍🏫</div>
          <div className="stat-label">Total Maestros</div>
          <div className="stat-value">{db.maestros.length}</div>
          <div className="stat-sub">Personal docente activo</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background:"var(--success-bg)"}}>🏫</div>
          <div className="stat-label">Grupos con titular</div>
          <div className="stat-value" style={{color:"var(--success-text)"}}>{gruposConMaestro}</div>
          <div className="stat-sub">De {db.grupos.length} grupos en total</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background:"var(--warning-bg)"}}>⚠️</div>
          <div className="stat-label">Grupos sin titular</div>
          <div className="stat-value" style={{color:gruposSinMaestro>0?"var(--warning-text)":"var(--success-text)"}}>{gruposSinMaestro}</div>
          <div className="stat-sub">{gruposSinMaestro===0?"Todo cubierto":"Requieren asignación"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background:"var(--purple-bg)"}}>📚</div>
          <div className="stat-label">Materias por grupo</div>
          <div className="stat-value">{MATERIAS_PRIMARIA.length}</div>
          <div className="stat-sub">El titular las imparte todas</div>
        </div>
      </div>

      {/* TABLA */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">📋 Lista de Maestros</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <input className="form-control" style={{width:230}}
              placeholder="🔍 Buscar por nombre, grupo…"
              value={busqueda} onChange={e=>setBusqueda(e.target.value)}/>
            <button className="btn btn-primary"
              onClick={()=>{setMaestroEdit(null);setModalForm(true);}}>
              ➕ Nuevo Maestro
            </button>
          </div>
        </div>

        {filtrados.length===0
          ? <div className="empty-state"><div className="empty-icon">👩‍🏫</div><div className="empty-title">No se encontraron maestros</div></div>
          : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Maestro</th>
                    <th>Grupo titular</th>
                    <th className="hide-mobile">Correo</th>
                    <th className="hide-mobile">Teléfono</th>
                    <th>Alumnos</th>
                    <th className="hide-mobile">Usuario</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map(m=>{
                    const grupo   = db.grupos.find(g=>g.id===m.grupo);
                    const nAlumnos= db.alumnos.filter(a=>a.grupo===m.grupo).length;
                    return (
                      <tr key={m.id}>
                        <td>
                          <div style={{display:"flex",alignItems:"center",gap:10}}>
                            <div className="av">{INITIALS(m.nombre)}</div>
                            <div>
                              <div style={{fontWeight:600}}>{m.nombre}</div>
                              <div className="small muted">Primaria · Titular</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          {grupo
                            ? <span className="badge badge-info">{grupo.nombre}</span>
                            : <span className="badge badge-gray">Sin asignar</span>}
                        </td>
                        <td className="hide-mobile">{m.email}</td>
                        <td className="hide-mobile">{m.tel||"—"}</td>
                        <td><strong>{nAlumnos}</strong></td>
                        <td className="hide-mobile">
                          <code style={{background:"var(--bg-base)",padding:"2px 6px",borderRadius:4,fontSize:12}}>
                            {m.usuario}
                          </code>
                        </td>
                        <td>
                          <div style={{display:"flex",gap:5}}>
                            <button className="btn btn-sm" title="Ver perfil" onClick={()=>setDetalle(m)}>👁️</button>
                            <button className="btn btn-sm btn-primary" title="Editar" onClick={()=>abrirEditar(m)}>✏️</button>
                            <button className="btn btn-sm btn-danger" title="Eliminar" onClick={()=>handleEliminar(m)}>🗑️</button>
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

      {/* Nota de acceso */}
      <div className="card" style={{marginTop:16,background:"var(--info-bg)",border:"1px solid #a0b8d8"}}>
        <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
          <span style={{fontSize:22}}>ℹ️</span>
          <div>
            <div style={{fontWeight:700,marginBottom:4}}>Acceso de maestros al sistema</div>
            <div style={{fontSize:13,color:"var(--text-secondary)"}}>
              Cada maestro inicia sesión con su <strong>usuario</strong> y contraseña <strong>1111</strong> (por defecto).
              Pueden ver Dashboard, Alumnos, Grupos, Asistencia, Calificaciones, Avisos y Alertas de su grupo,
              pero <strong>no</strong> pueden acceder al módulo de Maestros.
            </div>
          </div>
        </div>
      </div>

      {modalForm && (
        <ModalMaestro
          maestro={maestroEdit}
          grupos={db.grupos}
          maestrosActivos={db.maestros}
          onClose={()=>{setModalForm(false);setMaestroEdit(null);}}
          onSave={handleSave}
        />
      )}

      {detalle && (
        <ModalDetalle
          maestro={detalle}
          grupos={db.grupos}
          alumnos={db.alumnos}
          onClose={()=>setDetalle(null)}
          onEdit={abrirEditar}
        />
      )}
    </Layout>
  );
}

export default Maestros;
