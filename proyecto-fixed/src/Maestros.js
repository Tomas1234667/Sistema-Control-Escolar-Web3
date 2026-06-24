import React, { useState } from "react";
import toast from "react-hot-toast";
import { useAppDB, Layout } from "./App";

const INITIALS = (n="") => n.split(" ").map(w=>w[0]||"").slice(0,2).join("").toUpperCase();

const MATERIAS_PRIMARIA = [
  "Matemáticas","Español","Conocimiento del Medio","Ciencias Naturales",
  "Historia","Geografía","Formación Cívica y Ética","Educación Artística",
  "Educación Física","Inglés",
];

const EMPTY_FORM = { nombre:"", email:"", tel:"", grupo:"", usuario:"", pass:"1111" };

function ModalMaestro({ maestro, grupos, onClose, onSave }) {
  const [form, setForm] = useState(maestro?{...maestro}:{...EMPTY_FORM});
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleSubmit = () => {
    if(!form.nombre?.trim()||!form.email?.trim()){
      toast.error("Nombre y correo son obligatorios"); return;
    }
    if(!form.grupo){ toast.error("Debes asignar un grupo"); return; }
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <div className="modal-title">{maestro?"✏️ Editar Maestro":"👩‍🏫 Nuevo Maestro"}</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="form-grid">
          <div className="form-group col-span-2">
            <label className="form-label">Nombre completo *</label>
            <input className="form-control" value={form.nombre}
              onChange={e=>set("nombre",e.target.value)} placeholder="Nombre Apellido1 Apellido2"/>
          </div>
          <div className="form-group">
            <label className="form-label">Correo *</label>
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
              {grupos.map(g=><option key={g.id} value={g.id}>{g.nombre}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Usuario de acceso</label>
            <input className="form-control" value={form.usuario||""}
              onChange={e=>set("usuario",e.target.value)} placeholder="Ej: m13"/>
          </div>
          <div className="form-group col-span-2">
            <label className="form-label">Contraseña inicial</label>
            <input className="form-control" value={form.pass||"1111"}
              onChange={e=>set("pass",e.target.value)} placeholder="Contraseña"/>
            <div className="small muted" style={{marginTop:4}}>
              Default: 1111. El maestro puede cambiarla al ingresar.
            </div>
          </div>
          <div className="form-group col-span-2">
            <label className="form-label">Materias impartidas</label>
            <div style={{background:"var(--bg-base)",border:"1px solid var(--border)",
              borderRadius:8,padding:12,fontSize:13,color:"var(--text-muted)"}}>
              {MATERIAS_PRIMARIA.join(" · ")}
              <div className="small" style={{marginTop:6,color:"var(--text-muted)"}}>
                En primaria el maestro titular imparte todas las materias del grupo.
              </div>
            </div>
          </div>
        </div>
        <div className="form-actions">
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            {maestro?"💾 Guardar":"➕ Registrar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Maestros() {
  const db = useAppDB();
  const [busqueda,   setBusqueda]   = useState("");
  const [modalForm,  setModalForm]  = useState(false);
  const [maestroEdit,setMaestroEdit]= useState(null);

  const filtrados = db.maestros.filter(
    m=>m.nombre.toLowerCase().includes(busqueda.toLowerCase())
      ||m.email?.toLowerCase().includes(busqueda.toLowerCase())
      ||m.grupo?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleSave = (form) => {
    if(maestroEdit){ db.editarMaestro(maestroEdit.id,form); toast.success("Maestro actualizado"); }
    else           { db.agregarMaestro(form);               toast.success("Maestro registrado"); }
    setModalForm(false); setMaestroEdit(null);
  };

  const handleEliminar = (m) => {
    if(window.confirm(`¿Eliminar al maestro ${m.nombre}?`)){
      db.eliminarMaestro(m.id);
      toast.success("Maestro eliminado");
    }
  };

  return (
    <Layout title="Gestión de Maestros">
      <div className="stat-grid mb-24">
        <div className="stat-card">
          <div className="stat-icon" style={{background:"#dde6f5"}}>👩‍🏫</div>
          <div className="stat-label">Total Maestros</div>
          <div className="stat-value">{db.maestros.length}</div>
          <div className="stat-sub">Personal docente activo</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background:"#d6eed9"}}>🏫</div>
          <div className="stat-label">Grupos Atendidos</div>
          <div className="stat-value">{db.grupos.length}</div>
          <div className="stat-sub">1° A — 6° B</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background:"#f5edcc"}}>📚</div>
          <div className="stat-label">Materias</div>
          <div className="stat-value">{MATERIAS_PRIMARIA.length}</div>
          <div className="stat-sub">Por grupo (titular)</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background:"#e8e0f5"}}>👨‍🎓</div>
          <div className="stat-label">Alumnos</div>
          <div className="stat-value">{db.alumnos.length}</div>
          <div className="stat-sub">Matriculados este ciclo</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">📋 Lista de Maestros</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <input className="form-control" style={{width:230}} placeholder="🔍 Buscar..."
              value={busqueda} onChange={e=>setBusqueda(e.target.value)}/>
            <button className="btn btn-primary"
              onClick={()=>{setMaestroEdit(null);setModalForm(true);}}>➕ Nuevo Maestro</button>
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
                    <th className="hide-mobile">Usuario</th>
                    <th>Alumnos</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map(m=>{
                    const grupo   = db.grupos.find(g=>g.id===m.grupo);
                    const alumnos = db.alumnos.filter(a=>a.grupo===m.grupo).length;
                    return (
                      <tr key={m.id}>
                        <td>
                          <div style={{display:"flex",alignItems:"center",gap:10}}>
                            <div className="av">{INITIALS(m.nombre)}</div>
                            <div style={{fontWeight:600}}>{m.nombre}</div>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-info">
                            {grupo?grupo.nombre:m.grupo||"—"}
                          </span>
                        </td>
                        <td className="hide-mobile">{m.email}</td>
                        <td className="hide-mobile">{m.tel||"—"}</td>
                        <td className="hide-mobile">
                          <span className="badge badge-gray" style={{fontFamily:"monospace"}}>
                            {m.usuario||"—"}
                          </span>
                        </td>
                        <td><strong>{alumnos}</strong></td>
                        <td>
                          <div style={{display:"flex",gap:5}}>
                            <button className="btn btn-sm btn-primary"
                              onClick={()=>{setMaestroEdit(m);setModalForm(true);}}>✏️</button>
                            <button className="btn btn-sm btn-danger"
                              onClick={()=>handleEliminar(m)}>🗑️</button>
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

      {modalForm&&(
        <ModalMaestro
          maestro={maestroEdit}
          grupos={db.grupos}
          onClose={()=>{setModalForm(false);setMaestroEdit(null);}}
          onSave={handleSave}
        />
      )}
    </Layout>
  );
}

export default Maestros;
