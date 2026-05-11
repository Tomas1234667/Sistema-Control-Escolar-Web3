import React, { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { useAppDB, Layout } from "./App";

const INITIALS = (name) => name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
const ESTADOS = ["presente", "ausente", "justificado"];
const ESTADO_ICON = { presente: "✅", ausente: "❌", justificado: "📋" };
const ESTADO_LABEL = { presente: "Presente", ausente: "Ausente", justificado: "Justificado" };

function Asistencia() {
    const db = useAppDB();
    const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
    const [grupoId, setGrupoId] = useState(db.grupos?.[0]?.id ?? "");
    const alumnosGrupo = useMemo(
        () => db.alumnos.filter(a => a.grupo === grupoId), [db.alumnos, grupoId]
    );

    const registros = useMemo(
        () => db.asistenciaPorFecha(fecha), [db, fecha]
    );

    const getEstado = (alumnoId) => {
        const r = registros.find(r => r.alumnoId === alumnoId);
        return r ? r.estado : "presente";
    };

    const toggleEstado = (alumnoId) => {
        const actual = getEstado(alumnoId);
        const idx = ESTADOS.indexOf(actual);
        const nuevo = ESTADOS[(idx + 1) % ESTADOS.length];
        db.guardarAsistencia(alumnoId, fecha, nuevo, "m1");
    };

    const setTodos = (estado) => {
        alumnosGrupo.forEach(a => db.guardarAsistencia(a.id, fecha, estado, "m1"));
        toast.success(`Todos marcados como ${ESTADO_LABEL[estado]}`);
    };

    const guardarLista = () => {
        // already saved in real time, just confirm
        toast.success("✅ Lista de asistencia guardada");
    };

    const presentes = alumnosGrupo.filter(a => getEstado(a.id) === "presente").length;
    const ausentes = alumnosGrupo.filter(a => getEstado(a.id) === "ausente").length;
    const justificados = alumnosGrupo.filter(a => getEstado(a.id) === "justificado").length;
return (
  <Layout title="Pase de Lista Digital">
    <div className="card mb-16">
      <div
        className="card-header"
        style={{ flexWrap: "wrap", gap: 12 }}
      >
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Fecha</label>

            <input
              type="date"
              className="form-control"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              style={{ width: 160 }}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Grupo</label>

            <select
              className="form-control"
              value={grupoId}
              onChange={(e) => setGrupoId(e.target.value)}
              style={{ width: 150 }}
            >
              {db.grupos.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          <button
            className="btn btn-sm btn-success"
            onClick={() => setTodos("presente")}
          >
            ✅Todos presentes
          </button>

          <button
            className="btn btn-sm btn-danger"
            onClick={() => setTodos("ausente")}
          >
            ❌Todos ausentes
          </button>

          <button
            className="btn btn-sm btn-primary"
            onClick={guardarLista}
          >
            💾Guardar Lista
          </button>
        </div>
      </div>

      {/* Resumen */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            flex: 1,
            background: "#f0fdf4",
            border: "1px solid #86efac",
            borderRadius: 10,
            padding: "10px 16px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: "#16a34a",
            }}
          >
            {presentes}
          </div>

          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#15803d",
            }}
          >
            PRESENTES
          </div>
        </div>

        <div
          style={{
            flex: 1,
            background: "#fef2f2",
            border: "1px solid #fca5a5",
            borderRadius: 10,
            padding: "10px 16px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: "#dc2626",
            }}
          >
            {ausentes}
          </div>

          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#b91c1c",
            }}
          >
            AUSENTES
          </div>
        </div>

        <div
          style={{
            flex: 1,
            background: "#fffbeb",
            border: "1px solid #fcd34d",
            borderRadius: 10,
            padding: "10px 16px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: "#d97706",
            }}
          >
            {justificados}
          </div>

          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#b45309",
            }}
          >
            JUSTIFICADOS
          </div>
        </div>

        <div
          style={{
            flex: 1,
            background: "#f8faff",
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            padding: "10px 16px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: "#1a56db",
            }}
          >
            {alumnosGrupo.length
              ? Math.round((presentes / alumnosGrupo.length) * 100)
              : 0}
            %
          </div>

          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#1e40af",
            }}
          >
            ASISTENCIA
          </div>
        </div>
      </div>

      {/* Grid de alumnos */}
      {alumnosGrupo.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>

          <div className="empty-title">
            No hay alumnos en este grupo
          </div>
        </div>
      ) : (
        <div className="asistencia-grid">
          {alumnosGrupo.map((a) => {
            const estado = getEstado(a.id);

            return (
              <div
                key={a.id}
                className={`asistencia-card ${estado}`}
                onClick={() => toggleEstado(a.id)}
                title="Clic para cambiar estado"
              >
                <div className="av">
                  {INITIALS(a.nombre)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 13,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {a.nombre
                      .split(" ")
                      .slice(0, 2)
                      .join(" ")}
                  </div>

                  <div
                    className="small"
                    style={{
                      color:
                        estado === "presente"
                          ? "#15803d"
                          : estado === "ausente"
                          ? "#b91c1c"
                          : "#b45309",
                      fontWeight: 600,
                    }}
                  >
                    {ESTADO_LABEL[estado]}
                  </div>
                </div>

                <div className="asistencia-estado">
                  {ESTADO_ICON[estado]}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  </Layout>
);
}

export default Asistencia;