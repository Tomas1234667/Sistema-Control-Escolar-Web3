import React, { useState } from "react";
import toast from "react-hot-toast";
import { useAppDB, Layout } from "./App";

const MATERIAS = ["Matemáticas", "Español", "Ciencias", "Historia", "Geografía", "Inglés", "Educación Física", "Artes", "Computación", "Formación Cívica"];

function ModalCalificacion({ alumno, califExistente, onClose, onSave }) {
  const [materia, setMateria] = useState(califExistente?.materia || MATERIAS[0]);
  const [bim1, setBim1] = useState(califExistente?.bim1 || "");
  const [bim2, setBim2] = useState(califExistente?.bim2 || "");
  const [bim3, setBim3] = useState(califExistente?.bim3 || "");

  const handleSubmit = () => {
    const n1 = Number(bim1), n2 = Number(bim2), n3 = Number(bim3);
    if ([n1, n2, n3].some((n) => isNaN(n) || n < 0 || n > 10)) {
      toast.error("Las calificaciones deben estar entre 0 y 10");
      return;
    }
    onSave({ alumnoId: alumno.id, materia, bim1: n1, bim2: n2, bim3: n3, ciclo: "2024-2025" });
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">📝 Registrar Calificación</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: "0 0 16px" }}>
          <div style={{ fontWeight: 600, marginBottom: 16 }}>Alumno: {alumno.nombre}</div>
          <div className="form-group">
            <label className="form-label">Materia</label>
            <select className="form-control" value={materia} onChange={(e) => setMateria(e.target.value)}>
              {MATERIAS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Bimestre 1</label>
              <input type="number" className="form-control" min="0" max="10" step="0.1" value={bim1} onChange={(e) => setBim1(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Bimestre 2</label>
              <input type="number" className="form-control" min="0" max="10" step="0.1" value={bim2} onChange={(e) => setBim2(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Bimestre 3</label>
              <input type="number" className="form-control" min="0" max="10" step="0.1" value={bim3} onChange={(e) => setBim3(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Promedio</label>
              <input className="form-control" readOnly value={bim1 && bim2 && bim3 ? ((Number(bim1)+Number(bim2)+Number(bim3))/3).toFixed(1) : "—"} style={{ background: "#f8faff" }} />
            </div>
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
  const [modal, setModal] = useState(null); // { alumno, califExistente? }

  const alumnos = db.alumnos.filter((a) => a.grupo === grupoId && a.nombre.toLowerCase().includes(busqueda.toLowerCase()));

  const handleSave = (data) => {
    db.guardarCalificacion(data);
    toast.success("Calificación guardada correctamente");
    setModal(null);
  };

  // Stats
  const todosPromedios = db.alumnos.map((a) => db.promedioAlumno(a.id)).filter(Boolean);
  const promGeneral = todosPromedios.length ? (todosPromedios.reduce((a,b) => a+b,0)/todosPromedios.length).toFixed(1) : "—";
  const aprobados = db.alumnos.filter((a) => { const p = db.promedioAlumno(a.id); return p !== null && p >= 6; }).length;
  const reprobados = db.alumnos.filter((a) => { const p = db.promedioAlumno(a.id); return p !== null && p < 6; }).length;

  return (
    <Layout title="Calificaciones">
      <div className="stat-grid mb-24">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#ede9fe" }}>📊</div>
          <div className="stat-label">Promedio General</div>
          <div className="stat-value">{promGeneral}</div>
          <div className="stat-sub">Ciclo 2024-2025</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#dcfce7" }}>✅</div>
          <div className="stat-label">Aprobados</div>
          <div className="stat-value" style={{ color: "#16a34a" }}>{aprobados}</div>
          <div className="stat-sub">Con promedio ≥ 6</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#fee2e2" }}>❌</div>
          <div className="stat-label">Reprobados</div>
          <div className="stat-value" style={{ color: "#dc2626" }}>{reprobados}</div>
          <div className="stat-sub">Con promedio {"<"} 6</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">📝 Calificaciones por Grupo</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <select className="form-control" style={{ width: 160 }} value={grupoId} onChange={(e) => setGrupoId(e.target.value)}>
              {db.grupos.map((g) => <option key={g.id} value={g.id}>{g.nombre}</option>)}
            </select>
            <input className="form-control" style={{ width: 200 }} placeholder="🔍 Buscar alumno..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </div>
        </div>

        {alumnos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <div className="empty-title">No hay alumnos en este grupo</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Alumno</th>
                  <th>Materias</th>
                  <th>Bim 1</th>
                  <th>Bim 2</th>
                  <th>Bim 3</th>
                  <th>Promedio</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {alumnos.map((a) => {
                  const califs = db.calificaciones.filter((c) => c.alumnoId === a.id);
                  const prom = db.promedioAlumno(a.id);
                  const bim1avg = califs.length ? (califs.reduce((s,c) => s+Number(c.bim1),0)/califs.length).toFixed(1) : "—";
                  const bim2avg = califs.length ? (califs.reduce((s,c) => s+Number(c.bim2),0)/califs.length).toFixed(1) : "—";
                  const bim3avg = califs.length ? (califs.reduce((s,c) => s+Number(c.bim3),0)/califs.length).toFixed(1) : "—";
                  const aprobado = prom !== null && prom >= 6;
                  return (
                    <tr key={a.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{a.nombre}</div>
                        <div className="small muted">Grupo: {a.grupo}</div>
                      </td>
                      <td>{califs.length} materias</td>
                      <td>{bim1avg}</td>
                      <td>{bim2avg}</td>
                      <td>{bim3avg}</td>
                      <td>
                        <strong style={{ color: prom >= 8.5 ? "#16a34a" : prom >= 7 ? "#d97706" : "#dc2626" }}>
                          {prom ? prom.toFixed(1) : "—"}
                        </strong>
                      </td>
                      <td>
                        <span className={`badge badge-${aprobado ? "success" : prom === null ? "info" : "danger"}`}>
                          {prom === null ? "Sin datos" : aprobado ? "Aprobado" : "Reprobado"}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-primary" onClick={() => setModal({ alumno: a })}>
                          ➕ Agregar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <ModalCalificacion
          alumno={modal.alumno}
          califExistente={modal.califExistente}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </Layout>
  );
}

export default Calificaciones;
