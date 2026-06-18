import React, { useState } from "react";
import { useAppDB, Layout } from "./App";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Cell,
} from "recharts";

function Riesgo() {

    const db = useAppDB();
    const [filtro, setFiltro] = useState("todos");

    const alumnosConRiesgo = db.alumnos.map((a) => ({
        ...a,
        riesgo:     db.nivelRiesgo(a.id),
        prom:       db.promedioAlumno(a.id),
        faltas:     db.faltasAlumno(a.id),
        asistencia: db.asistenciaPctAlumno(a.id),
    }));

    const filtrados =
        filtro === "todos"
            ? alumnosConRiesgo
            : alumnosConRiesgo.filter((a) => a.riesgo === filtro);

    const alto  = alumnosConRiesgo.filter((a) => a.riesgo === "alto").length;
    const medio = alumnosConRiesgo.filter((a) => a.riesgo === "medio").length;
    const bajo  = alumnosConRiesgo.filter((a) => a.riesgo === "bajo").length;

    const chartData = [
        { nivel: "Bajo riesgo",  cantidad: bajo,  fill: "#5a7d6a" },
        { nivel: "Seguimiento",  cantidad: medio, fill: "#c09020" },
        { nivel: "Alto riesgo",  cantidad: alto,  fill: "#a04040" },
    ];

    return (
        <Layout title="Alertas de Riesgo Escolar">

            {/* TARJETAS */}
            <div className="stat-grid mb-24">

                <div
                    className="stat-card"
                    onClick={() => setFiltro("alto")}
                    style={{
                        cursor: "pointer",
                        borderTop: filtro === "alto" ? "3px solid #a04040" : undefined,
                    }}
                >
                    <div className="stat-icon" style={{ background: "#f5dede" }}>🚨</div>
                    <div className="stat-label">Alto Riesgo</div>
                    <div className="stat-value" style={{ color: "#a04040" }}>{alto}</div>
                    <div className="stat-sub">Acción inmediata</div>
                </div>

                <div
                    className="stat-card"
                    onClick={() => setFiltro("medio")}
                    style={{
                        cursor: "pointer",
                        borderTop: filtro === "medio" ? "3px solid #c09020" : undefined,
                    }}
                >
                    <div className="stat-icon" style={{ background: "#f5edcc" }}>👁️</div>
                    <div className="stat-label">En Seguimiento</div>
                    <div className="stat-value" style={{ color: "#c09020" }}>{medio}</div>
                    <div className="stat-sub">Monitorear de cerca</div>
                </div>

                <div
                    className="stat-card"
                    onClick={() => setFiltro("bajo")}
                    style={{
                        cursor: "pointer",
                        borderTop: filtro === "bajo" ? "3px solid #5a7d6a" : undefined,
                    }}
                >
                    <div className="stat-icon" style={{ background: "#d6eed9" }}>✅</div>
                    <div className="stat-label">Sin Riesgo</div>
                    <div className="stat-value" style={{ color: "#5a7d6a" }}>{bajo}</div>
                    <div className="stat-sub">Rendimiento regular</div>
                </div>

                <div
                    className="stat-card"
                    onClick={() => setFiltro("todos")}
                    style={{
                        cursor: "pointer",
                        borderTop: filtro === "todos" ? "3px solid #4a6fa5" : undefined,
                    }}
                >
                    <div className="stat-icon" style={{ background: "#dde6f5" }}>👨‍🎓</div>
                    <div className="stat-label">Total Alumnos</div>
                    <div className="stat-value">{db.alumnos.length}</div>
                    <div className="stat-sub">Ver todos</div>
                </div>

            </div>

            {/* GRÁFICA */}
            <div className="card mb-24">
                <div className="card-header">
                    <div className="card-title">📊 Distribución de Riesgo Escolar</div>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                    <BarChart
                        data={chartData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="nivel" />
                        <YAxis allowDecimals={false} />
                        <Tooltip formatter={(v) => [`${v} alumnos`]} />
                        <Bar dataKey="cantidad" radius={[8, 8, 0, 0]}>
                            {chartData.map((entry, i) => (
                                <Cell key={i} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* TABLA */}
            <div className="card">
                <div className="card-header">
                    <div className="card-title">
                        {filtro === "todos"  ? "📋 Todos los Alumnos"         :
                         filtro === "alto"   ? "🚨 Alumnos en Alto Riesgo"    :
                         filtro === "medio"  ? "👁️ Alumnos en Seguimiento"    :
                                              "✅ Alumnos Sin Riesgo"}
                    </div>
                    <span className="badge badge-info">{filtrados.length} alumnos</span>
                </div>

                {filtrados.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">✨</div>
                        <div className="empty-title">No hay alumnos en esta categoría</div>
                    </div>
                ) : (
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Alumno</th>
                                    <th>Grupo</th>
                                    <th>Promedio</th>
                                    <th>Faltas</th>
                                    <th>Asistencia</th>
                                    <th>Riesgo</th>
                                    <th>Recomendación</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtrados
                                    .sort((a, b) =>
                                        a.riesgo === "alto"  ? -1 :
                                        b.riesgo === "alto"  ?  1 :
                                        a.riesgo === "medio" ? -1 : 1
                                    )
                                    .map((a) => (
                                        <tr key={a.id}>

                                            <td>
                                                <div style={{ fontWeight: 600 }}>{a.nombre}</div>
                                                <div className="small muted">
                                                    {a.curp ? a.curp.slice(0, 10) + "..." : "—"}
                                                </div>
                                            </td>

                                            <td>
                                                <span className="badge badge-info">{a.grupo}</span>
                                            </td>

                                            <td>
                                                <strong style={{
                                                    color: a.prom >= 8.5 ? "#5a7d6a" :
                                                           a.prom >= 7   ? "#c09020" :
                                                                           "#a04040",
                                                }}>
                                                    {/* FIX: operador nullish correcto ?? */}
                                                    {a.prom != null ? a.prom.toFixed(1) : "—"}
                                                </strong>
                                            </td>

                                            <td>
                                                <span style={{
                                                    color: a.faltas >= 10 ? "#a04040" :
                                                           a.faltas >= 6  ? "#c09020" :
                                                                            "#5a7d6a",
                                                    fontWeight: 700,
                                                }}>
                                                    {a.faltas}
                                                </span>
                                            </td>

                                            <td>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                    <div style={{
                                                        flex: 1,
                                                        height: 6,
                                                        background: "#d8d2c6",
                                                        borderRadius: 3,
                                                        overflow: "hidden",
                                                    }}>
                                                        <div style={{
                                                            width: `${a.asistencia}%`,
                                                            height: "100%",
                                                            background:
                                                                a.asistencia >= 85 ? "#5a7d6a" :
                                                                a.asistencia >= 75 ? "#c09020" :
                                                                                     "#a04040",
                                                            borderRadius: 3,
                                                        }} />
                                                    </div>
                                                    <span className="small">{a.asistencia}%</span>
                                                </div>
                                            </td>

                                            <td>
                                                <span className={`badge badge-${
                                                    a.riesgo === "alto"  ? "danger"  :
                                                    a.riesgo === "medio" ? "warning" :
                                                                           "success"
                                                }`}>
                                                    {a.riesgo === "alto"  ? "🚨 Alto"  :
                                                     a.riesgo === "medio" ? "👁️ Medio" :
                                                                            "✅ Bajo"}
                                                </span>
                                            </td>

                                            <td className="small">
                                                {a.riesgo === "alto"  ? "Citar a tutor urgente"    :
                                                 a.riesgo === "medio" ? "Monitorear semanalmente"  :
                                                                        "Sin intervención"}
                                            </td>

                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

        </Layout>
    );
}

export default Riesgo;
