import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppDB } from "./App";
import { Layout } from "./App";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

import { QRCodeCanvas } from "qrcode.react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

function Dashboard() {
  const db = useAppDB();
  const navigate = useNavigate();

  const totalAlumnos = db.alumnos.length;
  const hoy = new Date().toISOString().slice(0, 10);
  const asistHoy = db.asistenciaPorFecha(hoy);
  const presentes = asistHoy.filter((a) => a.estado !== "ausente").length;
  const pctAsist = asistHoy.length ? Math.round((presentes / asistHoy.length) * 100) : 0;

  const promedios = db.alumnos.map((a) => db.promedioAlumno(a.id)).filter(Boolean);
  const promedioGeneral = promedios.length
    ? (promedios.reduce((a, b) => a + b, 0) / promedios.length).toFixed(1)
    : "--";

  const enRiesgo = db.alumnos.filter((a) => db.nivelRiesgo(a.id) === "alto");

  // Alumnos destacados (top 3 por promedio)
  const destacados = [...db.alumnos]
    .map((a) => ({ ...a, prom: db.promedioAlumno(a.id) }))
    .filter((a) => a.prom !== null)
    .sort((a, b) => b.prom - a.prom)
    .slice(0, 3);

  // PIE CHART
  const pieData = [
    {
      name: "Regular",
      value: db.alumnos.filter((a) => db.nivelRiesgo(a.id) === "bajo").length,
      color: "#16a34a",
    },
    {
      name: "Seguimiento",
      value: db.alumnos.filter((a) => db.nivelRiesgo(a.id) === "medio").length,
      color: "#d97706",
    },
    {
      name: "Alto riesgo",
      value: enRiesgo.length,
      color: "#dc2626",
    },
  ].filter((d) => d.value > 0);

  // Promedios por grupo (calculados desde datos reales)
  const promedioPorGrupo = db.grupos.map((g) => {
    const alumnosGrupo = db.alumnos.filter((a) => a.grupo === g.id);
    const proms = alumnosGrupo.map((a) => db.promedioAlumno(a.id)).filter(Boolean);
    return {
      grupo: g.nombre,
      promedio: proms.length ? +(proms.reduce((a, b) => a + b, 0) / proms.length).toFixed(1) : 0,
    };
  });

  return (
    <Layout title="Dashboard">
      <div className="dashboard-header">
        <h2>Bienvenida, Directora Norma Alvarez</h2>
        <p>Monitoreo general de alumnos, asistencia y rendimiento académico.</p>
      </div>

      {/* STAT CARDS */}
      <div className="stat-grid mb-24">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#dbeafe" }}>👨‍🎓</div>
          <div className="stat-label">Total Alumnos</div>
          <div className="stat-value">{totalAlumnos}</div>
          <div className="stat-sub">{db.grupos.length} grupos activos</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#dcfce7" }}>✅</div>
          <div className="stat-label">Asistencia Hoy</div>
          <div className="stat-value">{pctAsist}%</div>
          <div className="stat-sub">{presentes}/{asistHoy.length} presentes</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#ede9fe" }}>📊</div>
          <div className="stat-label">Promedio General</div>
          <div className="stat-value">{promedioGeneral}</div>
          <div className="stat-sub">Ciclo 2024-2025</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#fee2e2" }}>⚠️</div>
          <div className="stat-label">Alumnos en Riesgo</div>
          <div className="stat-value" style={{ color: enRiesgo.length > 0 ? "#dc2626" : "#16a34a" }}>
            {enRiesgo.length}
          </div>
          <div className="stat-sub">Requieren atención urgente</div>
        </div>
      </div>

      {/* CLIMA */}
      <div className="weather-card mb-24">
        <div className="weather-left">
          <div className="weather-icon">☀️</div>
          <div>
            <h3>Clima Escolar</h3>
            <p className="weather-temp">39° C</p>
            <span>Ciudad Juárez, Chihuahua</span>
          </div>
        </div>
        <div className="weather-right">
          <div>🌡️ Sensación: 37° C</div>
          <div>💨 Viento: 15 km/h</div>
        </div>
      </div>

      {/* ALERTAS DE RIESGO */}
      {enRiesgo.map((a) => (
        <div
          key={a.id}
          className="alert alert-danger mb-8"
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}
        >
          <span style={{ fontSize: 20 }}>🚨</span>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="avatar">
              {a.nombre.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div>
              <strong>{a.nombre}</strong>
              {" "}— En riesgo escolar
              <div className="small muted">
                {db.faltasAlumno(a.id)} faltas · Promedio: {db.promedioAlumno(a.id) ?? "--"} · Grupo: {a.grupo}
              </div>
            </div>
          </div>
          <button className="btn btn-sm btn-danger" onClick={() => navigate("/riesgo")}>
            Ver alertas
          </button>
        </div>
      ))}

      {/* QR + CALENDARIO */}
      <div className="grid-2 mb-24" style={{ marginTop: enRiesgo.length ? 16 : 0 }}>

        {/* QR Y ASISTENCIA */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Control de Asistencia</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: 20 }}>
            <QRCodeCanvas value="https://sistema-control-escolar-web3.onrender.com/" size={130} />
            <div className="small muted">Escanee el código QR para acceder más rápido desde tu celular</div>
            <div style={{ width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "12px", marginTop: "10px" }}>
              <div style={{ marginBottom: "6px" }}>👨‍🎓 Alumnos: {totalAlumnos}</div>
              <div style={{ marginBottom: "6px" }}>🏫 Grupos: {db.grupos.length}</div>
              <div>⚠️ En riesgo: {enRiesgo.length}</div>
            </div>
            <button className="btn btn-primary" style={{ width: "100%", padding: 14, fontSize: 16 }} onClick={() => navigate("/asistencia")}>
              ✅ Tomar asistencia
            </button>
          </div>
        </div>

        {/* CALENDARIO + PIE RIESGO */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Calendario Escolar</div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <Calendar />
          </div>
          <div className="card-header">
            <div className="card-title">Distribución de Riesgo</div>
          </div>
          {pieData.length > 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <ResponsiveContainer width="60%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v + " alumnos", n]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {pieData.map((d, i) => (
                  <div key={i} className="flex-center gap-8 mb-8">
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                    <span className="small">{d.name}</span>
                    <strong style={{ marginLeft: "auto" }}>{d.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">✨</div>
              <div className="empty-title">Sin datos suficientes</div>
            </div>
          )}
        </div>
      </div>

      {/* GRÁFICA RENDIMIENTO POR GRUPO */}
      <div className="card mb-24">
        <div className="card-header">
          <div className="card-title">Rendimiento por Grupo</div>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={promedioPorGrupo}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="grupo" />
            <YAxis domain={[0, 10]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="promedio" fill="#2563eb" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ACTIVIDAD RECIENTE */}
      <div className="card mb-24">
        <div className="card-header">
          <div className="card-title">📋 Actividad Reciente</div>
        </div>
        <div className="activity-item"><span>🟢 08:00</span><p>Asistencia registrada para el grupo 3° A</p></div>
        <div className="activity-item"><span>🔵 09:15</span><p>Calificación actualizada en Matemáticas</p></div>
        <div className="activity-item"><span>🟣 10:30</span><p>Nuevo alumno agregado al sistema</p></div>
        <div className="activity-item"><span>🟠 11:45</span><p>Reporte académico generado</p></div>
      </div>

      {/* ALUMNOS DESTACADOS (dinámico) */}
      <div className="card mb-24">
        <div className="card-header">
          <div className="card-title">Alumnos Destacados</div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Posición</th>
                <th>Alumno</th>
                <th>Promedio</th>
                <th>Grupo</th>
              </tr>
            </thead>
            <tbody>
              {destacados.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: "center", color: "#94a3b8" }}>Sin datos de calificaciones</td></tr>
              ) : (
                destacados.map((a, i) => (
                  <tr key={a.id}>
                    <td>{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</td>
                    <td>{a.nombre}</td>
                    <td><strong style={{ color: "#16a34a" }}>{a.prom.toFixed(1)}</strong></td>
                    <td>{a.grupo}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AVISOS */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Próximos Avisos</div>
          <button className="btn btn-sm" onClick={() => navigate("/avisos")}>Ver todos</button>
        </div>
        {db.avisos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <div className="empty-title">Sin avisos</div>
          </div>
        ) : (
          db.avisos.slice(0, 3).map((av) => (
            <div key={av.id} className="aviso-item">
              <div className="aviso-icon" style={{ background: "#dbeafe" }}>
                {av.tipo === "reunion" ? "🤝" : av.tipo === "calificaciones" ? "📝" : "📅"}
              </div>
              <div style={{ flex: 1 }}>
                <div className="aviso-title">{av.titulo}</div>
                <div className="aviso-desc">{av.desc}</div>
              </div>
              <div className="aviso-meta">
                <div className="aviso-fecha">{av.fecha}</div>
                <span className="badge badge-info" style={{ marginTop: 4 }}>{av.grupo}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}

export default Dashboard;
