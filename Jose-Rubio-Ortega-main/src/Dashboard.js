import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppDB } from "./App";
import { Layout } from "./App";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

function Dashboard() {
    const db = useAppDB();
    const navigate = useNavigate();

    const totalAlumnos = db.alumnos.length;
    const hoy = new Date().toISOString().slice(0, 10);
    const asistHoy = db.asistenciaPorFecha(hoy);
    const presentes = asistHoy.filter(a => a.estado !== "ausente").length;
    const pctAsist = asistHoy.length ? Math.round((presentes / asistHoy.length) * 100) : 0;

    const promedios = db.alumnos.map(a => db.promedioAlumno(a.id)).filter(Boolean);
    const promedioGeneral = promedios.length ?
        (promedios.reduce((a, b) => a + b, 0) / promedios.length).toFixed(1) :
        "--";

    const enRiesgo = db.alumnos.filter(a => db.nivelRiesgo(a.id) === "alto");

    // Chart data: asistencia por grupo
    const chartData = db.grupos.map(g => {
        const alumnosGrupo = db.alumnos.filter(a => a.grupo === g.id);
        const asistGrupo = asistHoy.filter(r => alumnosGrupo.some(a => a.id === r.alumnoId));
        const pct = asistGrupo.length ?
            Math.round((asistGrupo.filter(r => r.estado !== "ausente").length / asistGrupo.length) * 100) :
            0;
        return { grupo: g.nombre, pct };
    }).filter(d => d.pct > 0);

    // Pie riesgo
    const pieData = [
        { name: "Regular", value: db.alumnos.filter(a => db.nivelRiesgo(a.id) === "bajo").length, color: "#16a34a" },
        { name: "Seguimiento", value: db.alumnos.filter(a => db.nivelRiesgo(a.id) === "medio").length, color: "#d97706" },
        { name: "Alto riesgo", value: enRiesgo.length, color: "#dc2626" },
    ].filter(d => d.value > 0);

    return (
  <Layout title="Dashboard">
    {/* STAT CARDS */}
    <div className="stat-grid mb-24">

      <div className="stat-card">
        <div
          className="stat-icon"
          style={{ background: "#dbeafe" }}
        >
          👨‍🎓
        </div>

        <div className="stat-label">
          Total Alumnos
        </div>

        <div className="stat-value">
          {totalAlumnos}
        </div>

        <div className="stat-sub">
          {db.grupos.length} grupos activos
        </div>
      </div>

      <div className="stat-card">
        <div
          className="stat-icon"
          style={{ background: "#dcfce7" }}
        >
          ✅
        </div>

        <div className="stat-label">
          Asistencia Hoy
        </div>

        <div className="stat-value">
          {pctAsist}%
        </div>

        <div className="stat-sub">
          {presentes}/{asistHoy.length} presentes
        </div>
      </div>

      <div className="stat-card">
        <div
          className="stat-icon"
          style={{ background: "#ede9fe" }}
        >
          📊
        </div>

        <div className="stat-label">
          Promedio General
        </div>

        <div className="stat-value">
          {promedioGeneral}
        </div>

        <div className="stat-sub">
          Ciclo 2024 - 2025
        </div>
      </div>

      <div className="stat-card">
        <div
          className="stat-icon"
          style={{ background: "#fee2e2" }}
        >
          ⚠️
        </div>

        <div className="stat-label">
          Alumnos en Riesgo
        </div>

        <div
          className="stat-value"
          style={{
            color:
              enRiesgo.length > 0
                ? "#dc2626"
                : "#16a34a",
          }}
        >
          {enRiesgo.length}
        </div>

        <div className="stat-sub">
          Requieren atención urgente
        </div>
      </div>
    </div>

    {/* ALERTS */}
    {enRiesgo.map((a) => (
      <div
        key={a.id}
        className="alert alert-danger mb-8"
      >
        <span style={{ fontSize: 20 }}>
          🚨
        </span>

        <div style={{ flex: 1 }}>
          <strong>{a.nombre}</strong>
          {" "}— En riesgo escolar

          <div className="small muted">
            {db.faltasAlumno(a.id)} faltas ·
            Promedio: {db.promedioAlumno(a.id) ?? "--"} ·
            Grupo: {a.grupo}
          </div>
        </div>

        <button
          className="btn btn-sm btn-danger"
          onClick={() => navigate("/riesgo")}
        >
          Ver alertas
        </button>
      </div>
    ))}

    {/* CHARTS */}
    <div
      className="grid-2 mb-24"
      style={{
        marginTop: enRiesgo.length ? 16 : 0,
      }}
    >

      <div className="card">
        <div className="card-header">
          <div className="card-title">
            Asistencia por Grupo
          </div>
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer
            width="100%"
            height={200}
          >
            <BarChart
              data={chartData}
              margin={{
                top: 0,
                right: 0,
                left: -20,
                bottom: 0,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
              />

              <XAxis
                dataKey="grupo"
                tick={{ fontSize: 11 }}
              />

              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11 }}
              />

              <Tooltip
                formatter={(v) => `${v}%`}
              />

              <Bar
                dataKey="pct"
                fill="#1a56db"
                radius={[4, 4, 0, 0]}
                name="Asistencia"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              📅
            </div>

            <div className="empty-title">
              Sin datos de asistencia hoy
            </div>

            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate("/asistencia")}
              style={{ marginTop: 8 }}
            >
              Tomar asistencia
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">
            Distribución de Riesgo
          </div>
        </div>

        {pieData.length > 0 ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <ResponsiveContainer
              width="60%"
              height={180}
            >
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.color}
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(v, n) => [
                    v + " alumnos",
                    n,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>

            <div style={{ flex: 1 }}>
              {pieData.map((d, i) => (
                <div
                  key={i}
                  className="flex-center gap-8 mb-8"
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: d.color,
                      flexShrink: 0,
                    }}
                  />

                  <span className="small">
                    {d.name}
                  </span>

                  <strong
                    style={{ marginLeft: "auto" }}
                  >
                    {d.value}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              ✨
            </div>

            <div className="empty-title">
              Sin datos suficientes
            </div>
          </div>
        )}
      </div>
    </div>

    {/* ÚLTIMOS AVISOS */}
    <div className="card">

      <div className="card-header">
        <div className="card-title">
          Próximos Avisos
        </div>

        <button
          className="btn btn-sm"
          onClick={() => navigate("/avisos")}
        >
          Ver todos
        </button>
      </div>

      {db.avisos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            🔔
          </div>

          <div className="empty-title">
            Sin avisos
          </div>
        </div>
      ) : (
        db.avisos.slice(0, 3).map((av) => (
          <div
            key={av.id}
            className="aviso-item"
          >
            <div
              className="aviso-icon"
              style={{ background: "#dbeafe" }}
            >
              {av.tipo === "reunion"
                ? "🤝"
                : av.tipo === "calificaciones"
                ? "📝"
                : "📅"}
            </div>

            <div style={{ flex: 1 }}>
              <div className="aviso-title">
                {av.titulo}
              </div>

              <div className="aviso-desc">
                {av.desc}
              </div>
            </div>

            <div className="aviso-meta">
              <div className="aviso-fecha">
                {av.fecha}
              </div>

              <span
                className="badge badge-info"
                style={{ marginTop: 4 }}
              >
                {av.grupo}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  </Layout>
);
}

export default Dashboard;
