import React, { useState } from "react";
import toast from "react-hot-toast";
import { useAppDB, Layout } from "./App";

const INITIALS = (name = "") =>
  name.split(" ").map((n) => n[0] || "").slice(0, 2).join("").toUpperCase();

const MATERIAS_DISPONIBLES = ["Matemáticas","Español","Ciencias","Historia","Geografía","Inglés","Educación Física","Artes","Computación","Formación Cívica","Biología","Física","Química","Tutoría","Música"];

const EMPTY_FORM = { nombre: "", email: "", tel: "", materias: [], grupos: [] };

function ModalMaestro({ maestro, grupos, onClose, onSave }) {
  const [form, setForm] = useState(maestro ? { ...maestro, materias: maestro.materias || [], grupos: maestro.grupos || [] } : { ...EMPTY_FORM });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const toggleMateria = (m) => {
    setForm((p) => ({
      ...p,
      materias: p.materias.includes(m) ? p.materias.filter((x) => x !== m) : [...p.materias, m],
    }));
  };

  const handleSubmit = () => {
    if (!form.nombre?.trim() || !form.email?.trim()) {
      toast.error("Nombre y correo son obligatorios");
      return;
    }
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <div className="modal-title">{maestro ? "✏️ Editar Maestro" : "👩‍🏫 Nuevo Maestro"}</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="form-grid">
          <div className="form-group col-span-2">
            <label className="form-label">Nombre completo *</label>
            <input className="form-control" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} placeholder="Nombre Apellido1 Apellido2" />
          </div>
          <div className="form-group">
            <label className="form-label">Correo electrónico *</label>
            <input type="email" className="form-control" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="correo@escuela.edu" />
          </div>
          <div className="form-group">
            <label className="form-label">Teléfono</label>
            <input className="form-control" value={form.tel} onChange={(e) => set("tel", e.target.value)} placeholder="10 dígitos" maxLength={10} />
          </div>
          <div className="form-group col-span-2">
            <label className="form-label">Materias que imparte</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
              {MATERIAS_DISPONIBLES.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`btn btn-sm ${form.materias.includes(m) ? "btn-primary" : ""}`}
                  onClick={() => toggleMateria(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="form-actions">
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            {maestro ? "💾 Guardar Cambios" : "➕ Registrar Maestro"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Maestros() {
  const db = useAppDB();
  const [busqueda, setBusqueda] = useState("");
  const [modalForm, setModalForm] = useState(false);
  const [maestroEdit, setMaestroEdit] = useState(null);

  const maestrosFiltrados = db.maestros.filter(
    (m) =>
      m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      m.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
      m.materias?.some((mat) => mat.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const handleSave = (form) => {
    if (maestroEdit) {
      db.editarMaestro(maestroEdit.id, form);
      toast.success("Maestro actualizado correctamente");
    } else {
      db.agregarMaestro(form);
      toast.success("Maestro registrado correctamente");
    }
    setModalForm(false);
    setMaestroEdit(null);
  };

  return (
    <Layout title="Gestión de Maestros">
      {/* TARJETAS */}
      <div className="stat-grid mb-24">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#dbeafe" }}>👩‍🏫</div>
          <div className="stat-label">Total Maestros</div>
          <div className="stat-value">{db.maestros.length}</div>
          <div className="stat-sub">Personal docente activo</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#dcfce7" }}>📚</div>
          <div className="stat-label">Materias</div>
          <div className="stat-value">
            {[...new Set(db.maestros.flatMap((m) => m.materias || []))].length}
          </div>
          <div className="stat-sub">Materias impartidas</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#ede9fe" }}>🏫</div>
          <div className="stat-label">Grupos Cubiertos</div>
          <div className="stat-value">{db.grupos.length}</div>
          <div className="stat-sub">Grupos con maestro asignado</div>
        </div>
      </div>

      {/* TABLA */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">📋 Lista de Maestros</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              className="form-control"
              style={{ width: 240 }}
              placeholder="🔍 Buscar por nombre, materia..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <button className="btn btn-primary" onClick={() => { setMaestroEdit(null); setModalForm(true); }}>
              ➕ Nuevo Maestro
            </button>
          </div>
        </div>

        {maestrosFiltrados.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👩‍🏫</div>
            <div className="empty-title">No se encontraron maestros</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Maestro</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                  <th>Materias</th>
                  <th>Grupos</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {maestrosFiltrados.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="av">{INITIALS(m.nombre)}</div>
                        <div style={{ fontWeight: 600 }}>{m.nombre}</div>
                      </div>
                    </td>
                    <td>{m.email}</td>
                    <td>{m.tel || "—"}</td>
                    <td>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {(m.materias || []).map((mat) => (
                          <span key={mat} className="badge badge-info">{mat}</span>
                        ))}
                        {(!m.materias || m.materias.length === 0) && <span className="muted small">Sin asignar</span>}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {(m.grupos || []).map((g) => (
                          <span key={g} className="badge badge-success">{g}</span>
                        ))}
                        {(!m.grupos || m.grupos.length === 0) && <span className="muted small">—</span>}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-sm btn-primary" onClick={() => { setMaestroEdit(m); setModalForm(true); }}>
                          ✏️ Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalForm && (
        <ModalMaestro
          maestro={maestroEdit}
          grupos={db.grupos}
          onClose={() => { setModalForm(false); setMaestroEdit(null); }}
          onSave={handleSave}
        />
      )}
    </Layout>
  );
}

export default Maestros;
