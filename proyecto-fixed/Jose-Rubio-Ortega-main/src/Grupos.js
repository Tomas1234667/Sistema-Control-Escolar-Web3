import React, { useState } from "react";
import toast from "react-hot-toast";
import { useAppDB, Layout } from "./App";

const EMPTY_FORM = { id: "", nombre: "", grado: 1, salon: "", maestroId: "", turno: "Matutino" };

function ModalGrupo({ grupo, maestros, onClose, onSave }) {
  const [form, setForm] = useState(grupo ? { ...grupo } : { ...EMPTY_FORM });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = () => {
    if (!form.nombre?.trim() || !form.salon?.trim()) {
      toast.error("Nombre y salón son obligatorios");
      return;
    }
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{grupo ? "✏️ Editar Grupo" : "🏫 Nuevo Grupo"}</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">ID del Grupo *</label>
            <input className="form-control" value={form.id} onChange={(e) => set("id", e.target.value.toUpperCase())} placeholder="Ej: 3B" disabled={!!grupo} />
          </div>
          <div className="form-group">
            <label className="form-label">Nombre *</label>
            <input className="form-control" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} placeholder="Ej: 3° B" />
          </div>
          <div className="form-group">
            <label className="form-label">Grado</label>
            <select className="form-control" value={form.grado} onChange={(e) => set("grado", Number(e.target.value))}>
              {[1,2,3,4,5,6].map(g => <option key={g} value={g}>{g}°</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Salón *</label>
            <input className="form-control" value={form.salon} onChange={(e) => set("salon", e.target.value)} placeholder="Ej: Aula 5" />
          </div>
          <div className="form-group">
            <label className="form-label">Maestro Titular</label>
            <select className="form-control" value={form.maestroId} onChange={(e) => set("maestroId", e.target.value)}>
              <option value="">Sin asignar</option>
              {maestros.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Turno</label>
            <select className="form-control" value={form.turno} onChange={(e) => set("turno", e.target.value)}>
              <option>Matutino</option>
              <option>Vespertino</option>
            </select>
          </div>
        </div>
        <div className="form-actions">
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            {grupo ? "💾 Guardar Cambios" : "➕ Crear Grupo"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Grupos() {
  const db = useAppDB();
  const [modalForm, setModalForm] = useState(false);
  const [grupoEdit, setGrupoEdit] = useState(null);

  const handleSave = (form) => {
    if (grupoEdit) {
      db.editarGrupo(grupoEdit.id, form);
      toast.success("Grupo actualizado");
    } else {
      db.agregarGrupo(form);
      toast.success("Grupo creado");
    }
    setModalForm(false);
    setGrupoEdit(null);
  };

  return (
    <Layout title="Gestión de Grupos">
      {/* TARJETAS */}
      <div className="stat-grid mb-24">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#dbeafe" }}>🏫</div>
          <div className="stat-label">Total Grupos</div>
          <div className="stat-value">{db.grupos.length}</div>
          <div className="stat-sub">Ciclo 2024-2025</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#dcfce7" }}>👨‍🎓</div>
          <div className="stat-label">Total Alumnos</div>
          <div className="stat-value">{db.alumnos.length}</div>
          <div className="stat-sub">Matriculados</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#ede9fe" }}>👩‍🏫</div>
          <div className="stat-label">Maestros Asignados</div>
          <div className="stat-value">{db.maestros.length}</div>
          <div className="stat-sub">Con grupo asignado</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">📋 Lista de Grupos</div>
          <button className="btn btn-primary" onClick={() => { setGrupoEdit(null); setModalForm(true); }}>
            ➕ Nuevo Grupo
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Grupo</th>
                <th>Salón</th>
                <th>Turno</th>
                <th>Maestro Titular</th>
                <th>Alumnos</th>
                <th>Promedio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {db.grupos.map((g) => {
                const alumnos = db.alumnos.filter((a) => a.grupo === g.id);
                const maestro = db.maestros.find((m) => m.id === g.maestroId);
                const promedios = alumnos.map((a) => db.promedioAlumno(a.id)).filter(Boolean);
                const prom = promedios.length
                  ? (promedios.reduce((a, b) => a + b, 0) / promedios.length).toFixed(1)
                  : "—";
                return (
                  <tr key={g.id}>
                    <td>
                      <span className="badge badge-info" style={{ fontSize: 14, padding: "4px 12px" }}>{g.nombre}</span>
                    </td>
                    <td>{g.salon}</td>
                    <td>{g.turno}</td>
                    <td>{maestro ? maestro.nombre : <span className="muted">Sin asignar</span>}</td>
                    <td><strong>{alumnos.length}</strong></td>
                    <td>
                      <strong style={{ color: Number(prom) >= 8.5 ? "#16a34a" : Number(prom) >= 7 ? "#d97706" : "#dc2626" }}>
                        {prom}
                      </strong>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-primary" onClick={() => { setGrupoEdit(g); setModalForm(true); }}>
                        ✏️ Editar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modalForm && (
        <ModalGrupo
          grupo={grupoEdit}
          maestros={db.maestros}
          onClose={() => { setModalForm(false); setGrupoEdit(null); }}
          onSave={handleSave}
        />
      )}
    </Layout>
  );
}

export default Grupos;
