import React, { useState } from "react";
import toast from "react-hot-toast";
import { useAppDB, Layout } from "./App";

const TIPOS = ["reunion", "calificaciones", "evento", "urgente", "informativo"];
const TIPO_ICON = { reunion: "🤝", calificaciones: "📝", evento: "📅", urgente: "🚨", informativo: "ℹ️" };
const TIPO_LABEL = { reunion: "Reunión", calificaciones: "Calificaciones", evento: "Evento", urgente: "Urgente", informativo: "Informativo" };

const EMPTY_FORM = { tipo: "informativo", titulo: "", desc: "", fecha: new Date().toISOString().slice(0,10), grupo: "Todos", autor: "Dirección" };

function ModalAviso({ onClose, onSave }) {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = () => {
    if (!form.titulo?.trim() || !form.desc?.trim()) {
      toast.error("Título y descripción son obligatorios");
      return;
    }
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">🔔 Nuevo Aviso</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Tipo</label>
            <select className="form-control" value={form.tipo} onChange={(e) => set("tipo", e.target.value)}>
              {TIPOS.map((t) => <option key={t} value={t}>{TIPO_ICON[t]} {TIPO_LABEL[t]}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Fecha</label>
            <input type="date" className="form-control" value={form.fecha} onChange={(e) => set("fecha", e.target.value)} />
          </div>
          <div className="form-group col-span-2">
            <label className="form-label">Título *</label>
            <input className="form-control" value={form.titulo} onChange={(e) => set("titulo", e.target.value)} placeholder="Título del aviso" />
          </div>
          <div className="form-group col-span-2">
            <label className="form-label">Descripción *</label>
            <textarea className="form-control" rows={3} value={form.desc} onChange={(e) => set("desc", e.target.value)} placeholder="Detalle del aviso..." />
          </div>
          <div className="form-group">
            <label className="form-label">Grupo Destinatario</label>
            <input className="form-control" value={form.grupo} onChange={(e) => set("grupo", e.target.value)} placeholder="Todos / 3A / etc." />
          </div>
          <div className="form-group">
            <label className="form-label">Autor</label>
            <input className="form-control" value={form.autor} onChange={(e) => set("autor", e.target.value)} />
          </div>
        </div>
        <div className="form-actions">
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSubmit}>📢 Publicar Aviso</button>
        </div>
      </div>
    </div>
  );
}

function Avisos() {
  const db = useAppDB();
  const [modal, setModal] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState("todos");

  const avisosFiltrados = filtroTipo === "todos" ? db.avisos : db.avisos.filter((a) => a.tipo === filtroTipo);

  const handleSave = (data) => {
    db.agregarAviso(data);
    toast.success("Aviso publicado correctamente");
    setModal(false);
  };

  const handleEliminar = (id) => {
    if (window.confirm("¿Eliminar este aviso?")) {
      db.eliminarAviso(id);
      toast.success("Aviso eliminado");
    }
  };

  return (
    <Layout title="Tablero de Avisos">
      <div className="stat-grid mb-24">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#dbeafe" }}>🔔</div>
          <div className="stat-label">Total Avisos</div>
          <div className="stat-value">{db.avisos.length}</div>
          <div className="stat-sub">Activos este ciclo</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#fee2e2" }}>🚨</div>
          <div className="stat-label">Urgentes</div>
          <div className="stat-value" style={{ color: "#dc2626" }}>{db.avisos.filter(a => a.tipo === "urgente").length}</div>
          <div className="stat-sub">Requieren atención</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#dcfce7" }}>📅</div>
          <div className="stat-label">Próximos Eventos</div>
          <div className="stat-value">{db.avisos.filter(a => a.tipo === "evento").length}</div>
          <div className="stat-sub">Eventos programados</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">📋 Avisos Publicados</div>
          <div style={{ display: "flex", gap: 8 }}>
            <select className="form-control" style={{ width: 160 }} value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
              <option value="todos">Todos los tipos</option>
              {TIPOS.map((t) => <option key={t} value={t}>{TIPO_ICON[t]} {TIPO_LABEL[t]}</option>)}
            </select>
            <button className="btn btn-primary" onClick={() => setModal(true)}>➕ Nuevo Aviso</button>
          </div>
        </div>

        {avisosFiltrados.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <div className="empty-title">No hay avisos publicados</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 8 }}>
            {avisosFiltrados.map((av) => (
              <div key={av.id} className="aviso-item" style={{ padding: 16, borderRadius: 12, border: "1px solid #e2e8f0", background: "#fafbff" }}>
                <div className="aviso-icon" style={{ background: av.tipo === "urgente" ? "#fee2e2" : "#dbeafe", fontSize: 24, width: 48, height: 48, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {TIPO_ICON[av.tipo] || "📢"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <div className="aviso-title">{av.titulo}</div>
                    <span className={`badge badge-${av.tipo === "urgente" ? "danger" : "info"}`}>{TIPO_LABEL[av.tipo] || av.tipo}</span>
                  </div>
                  <div className="aviso-desc">{av.desc}</div>
                  <div className="small muted" style={{ marginTop: 6 }}>
                    📅 {av.fecha} · 👥 {av.grupo} · ✍️ {av.autor}
                  </div>
                </div>
                <button className="btn btn-sm btn-danger" onClick={() => handleEliminar(av.id)}>🗑️</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && <ModalAviso onClose={() => setModal(false)} onSave={handleSave} />}
    </Layout>
  );
}

export default Avisos;
