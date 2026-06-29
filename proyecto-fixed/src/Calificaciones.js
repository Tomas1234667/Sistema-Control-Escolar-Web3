import React, { useState } from "react";
import toast from "react-hot-toast";
import { useAppDB, Layout } from "./App";

/* Materias de primaria */
const MATERIAS = [
  "Matemáticas","Español","Conocimiento del Medio","Ciencias Naturales",
  "Historia","Geografía","Formación Cívica y Ética","Educación Artística",
  "Educación Física","Inglés",
];

function ModalCalificacion({ alumno, califExistente, onClose, onSave }) {
  const [materia, setMateria] = useState(califExistente?.materia || MATERIAS[0]);
  const [tri1, setTri1] = useState(califExistente?.tri1 ?? "");
  const [tri2, setTri2] = useState(califExistente?.tri2 ?? "");
  const [tri3, setTri3] = useState(califExistente?.tri3 ?? "");

  const prom = tri1 !== "" && tri2 !== "" && tri3 !== ""
    ? ((Number(tri1)+Number(tri2)+Number(tri3))/3).toFixed(1)
    : "—";

  const handleSubmit = () => {
    const n1=Number(tri1),n2=Number(tri2),n3=Number(tri3);
    if([n1,n2,n3].some(n=>isNaN(n)||n<0||n>10)){
      toast.error("Las calificaciones deben estar entre 0 y 10");
      return;
    }
    onSave({ alumnoId:alumno.id, materia, tri1:n1, tri2:n2, tri3:n3, ciclo:"2026-2027" });
  };

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">📝 Calificación por Trimestres</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div style={{marginBottom:16,fontWeight:600}}>Alumno: {alumno.nombre}</div>
        <div className="form-group" style={{marginBottom:14}}>
          <label className="form-label">Materia</label>
          <select className="form-control" value={materia} onChange={e=>setMateria(e.target.value)}>
            {MATERIAS.map(m=><option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">1er Trimestre</label>
            <input type="number" className="form-control" min="0" max="10" step="0.1"
              value={tri1} onChange={e=>setTri1(e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="form-label">2do Trimestre</label>
            <input type="number" className="form-control" min="0" max="10" step="0.1"
              value={tri2} onChange={e=>setTri2(e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="form-label">3er Trimestre</label>
            <input type="number" className="form-control" min="0" max="10" step="0.1"
              value={tri3} onChange={e=>setTri3(e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="form-label">Promedio final</label>
            <input className="form-control" readOnly value={prom}
              style={{background:"var(--bg-base)",fontWeight:700,
                color: prom!=="—" ? (Number(prom)>=7?"#3a7a5a":"#8a3a3a") : "inherit"}}/>
          </div>
        </div>
        <div className="form-actions">
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSubmit}>💾 Guardar</button>
        </div>
      </div>
    </div>
  );
}

function Calificaciones() {
  const db = useAppDB();
  const [grupoId, setGrupoId] = useState(db.grupos?.[0]?.id ?? "");
  const [busqueda, setBusqueda] = useState("");
  const [modal, setModal] = useState(null);

  const alumnos = db.alumnos.filter(
    a=>a.grupo===grupoId && a.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleSave = (data) => {
    db.guardarCalificacion(data);
    toast.success("Calificación guardada");
    setModal(null);
  };

  const todosProms = db.alumnos.map(a=>db.promedioAlumno(a.id)).filter(Boolean);
  const promGeneral = todosProms.length
    ? (todosProms.reduce((a,b)=>a+b,0)/todosProms.length).toFixed(1) : "—";
  const aprobados  = db.alumnos.filter(a=>{const p=db.promedioAlumno(a.id);return p!==null&&p>=6;}).length;
  const reprobados = db.alumnos.filter(a=>{const p=db.promedioAlumno(a.id);return p!==null&&p<6;}).length;

  return (
    <Layout title="Calificaciones">
      <div className="stat-grid mb-24">
        <div className="stat-card">
          <div className="stat-icon" style={{background:"#e8e0f5"}}>📊</div>
          <div className="stat-label">Promedio General</div>
          <div className="stat-value">{promGeneral}</div>
          <div className="stat-sub">Ciclo 2026-2027</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background:"#d6eed9"}}>✅</div>
          <div className="stat-label">Aprobados</div>
          <div className="stat-value" style={{color:"#3a7a5a"}}>{aprobados}</div>
          <div className="stat-sub">Promedio ≥ 6.0</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background:"#f5dede"}}>❌</div>
          <div className="stat-label">Reprobados</div>
          <div className="stat-value" style={{color:"#8a3a3a"}}>{reprobados}</div>
          <div className="stat-sub">Promedio {"<"} 6.0</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background:"#dde6f5"}}>🏫</div>
          <div className="stat-label">Grupos</div>
          <div className="stat-value">{db.grupos.length}</div>
          <div className="stat-sub">1° a 6° grado</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">📋 Calificaciones por Trimestre</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <select className="form-control" style={{width:140}} value={grupoId}
              onChange={e=>setGrupoId(e.target.value)}>
              {db.grupos.map(g=><option key={g.id} value={g.id}>{g.nombre}</option>)}
            </select>
            <input className="form-control" style={{width:200}} placeholder="🔍 Buscar alumno..."
              value={busqueda} onChange={e=>setBusqueda(e.target.value)}/>
          </div>
        </div>

        {alumnos.length===0
          ? <div className="empty-state"><div className="empty-icon">📚</div><div className="empty-title">No hay alumnos en este grupo</div></div>
          : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Alumno</th>
                    <th className="hide-mobile">Materias</th>
                    <th>1er Trim.</th>
                    <th>2do Trim.</th>
                    <th>3er Trim.</th>
                    <th>Promedio</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {alumnos.map(a=>{
                    const califs = db.calificaciones.filter(c=>c.alumnoId===a.id);
                    const prom   = db.promedioAlumno(a.id);
                    const avg = (key) => califs.length
                      ? (califs.reduce((s,c)=>s+Number(c[key]||0),0)/califs.length).toFixed(1)
                      : "—";
                    const aprobado = prom!==null && prom>=6;
                    return (
                      <tr key={a.id}>
                        <td>
                          <div style={{fontWeight:600}}>{a.nombre}</div>
                          <div className="small muted">Grupo {a.grupo}</div>
                        </td>
                        <td className="hide-mobile">{califs.length} mat.</td>
                        <td>{avg("tri1")}</td>
                        <td>{avg("tri2")}</td>
                        <td>{avg("tri3")}</td>
                        <td>
                          <strong style={{color:prom>=8.5?"#3a7a5a":prom>=7?"#8a6a20":"#8a3a3a"}}>
                            {prom?prom.toFixed(1):"—"}
                          </strong>
                        </td>
                        <td>
                          <span className={`badge badge-${aprobado?"success":prom===null?"gray":"danger"}`}>
                            {prom===null?"Sin datos":aprobado?"Aprobado":"Reprobado"}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-sm btn-primary" onClick={()=>setModal({alumno:a})}>
                            ➕ Agregar
                          </button>
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

      {modal && (
        <ModalCalificacion
          alumno={modal.alumno}
          califExistente={modal.califExistente}
          onClose={()=>setModal(null)}
          onSave={handleSave}
        />
      )}
    </Layout>
  );
}

export default Calificaciones;
