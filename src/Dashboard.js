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

    const presentes = asistHoy.filter(
        (a) => a.estado !== "ausente"
    ).length;

    const pctAsist = asistHoy.length ?
        Math.round((presentes / asistHoy.length) * 100) :
        0;

    const promedios = db.alumnos
        .map((a) => db.promedioAlumno(a.id))
        .filter(Boolean);

    const promedioGeneral = promedios.length ?
        (
            promedios.reduce((a, b) => a + b, 0) /
            promedios.length
        ).toFixed(1) :
        "--";

    const enRiesgo = db.alumnos.filter(
        (a) => db.nivelRiesgo(a.id) === "alto"
    );

    // PIE CHART
    const pieData = [{
            name: "Regular",
            value: db.alumnos.filter(
                (a) => db.nivelRiesgo(a.id) === "bajo"
            ).length,
            color: "#16a34a",
        },

        {
            name: "Seguimiento",
            value: db.alumnos.filter(
                (a) => db.nivelRiesgo(a.id) === "medio"
            ).length,
            color: "#d97706",
        },

        {
            name: "Alto riesgo",
            value: enRiesgo.length,
            color: "#dc2626",
        },
    ].filter((d) => d.value > 0);
    const promedioPorGrupo = [
        { grupo: "A", promedio: 8 },
        { grupo: "B", promedio: 7 },
        { grupo: "C", promedio: 9 },
    ];




    return ( <
        Layout title = "Dashboard" >

        { /* STAT CARDS */ } <
        div className = "stat-grid mb-24" >

        <
        div className = "stat-card" >
        <
        div className = "stat-icon"
        style = {
            { background: "#dbeafe" } } >
        👨‍🎓
        <
        /div>

        <
        div className = "stat-label" >
        Total Alumnos <
        /div>

        <
        div className = "stat-value" > { totalAlumnos } <
        /div>

        <
        div className = "stat-sub" > { db.grupos.length }
        grupos activos <
        /div> <
        /div>

        <
        div className = "stat-card" >
        <
        div className = "stat-icon"
        style = {
            { background: "#dcfce7" } } >
        ✅
        <
        /div>

        <
        div className = "stat-label" >
        Asistencia Hoy <
        /div>

        <
        div className = "stat-value" > { pctAsist } %
        <
        /div>

        <
        div className = "stat-sub" > { presentes }
        /{asistHoy.length} presentes <
        /div> <
        /div>

        <
        div className = "stat-card" >
        <
        div className = "stat-icon"
        style = {
            { background: "#ede9fe" } } >
        📊
        <
        /div>

        <
        div className = "stat-label" >
        Promedio General <
        /div>

        <
        div className = "stat-value" > { promedioGeneral } <
        /div>

        <
        div className = "stat-sub" >
        Ciclo 2024 - 2025 <
        /div> <
        /div>

        <
        div className = "stat-card" >
        <
        div className = "stat-icon"
        style = {
            { background: "#fee2e2" } } >
        ⚠️
        <
        /div>

        <
        div className = "stat-label" >
        Alumnos en Riesgo <
        /div>

        <
        div className = "stat-value"
        style = {
            {
                color: enRiesgo.length > 0 ?
                    "#dc2626" :
                    "#16a34a",
            }
        } >
        { enRiesgo.length } <
        /div>

        <
        div className = "stat-sub" >
        Requieren atención urgente <
        /div> <
        /div> <
        /div>

        { /* ALERTAS */ } {
            enRiesgo.map((a) => ( <
                div key = { a.id }
                className = "alert alert-danger mb-8" >
                <
                span style = {
                    { fontSize: 20 } } > 🚨
                <
                /span>

                <
                div style = {
                    { flex: 1 } } >
                <
                strong > { a.nombre } < /strong> { " " }—
                En riesgo escolar

                <
                div className = "small muted" > { db.faltasAlumno(a.id) }
                faltas· Promedio: { db.promedioAlumno(a.id) ? ? "--" }·
                Grupo: { a.grupo } <
                /div> <
                /div>

                <
                button className = "btn btn-sm btn-danger"
                onClick = {
                    () => navigate("/riesgo") } >
                Ver alertas <
                /button> <
                /div>
            ))
        }

        { /* QR + CALENDARIO + BOTÓN */ } <
        div className = "grid-2 mb-24"
        style = {
            {
                marginTop: enRiesgo.length ? 16 : 0,
            }
        } >

        { /* QR Y ASISTENCIA */ } <
        div className = "card" >

        <
        div className = "card-header" >
        <
        div className = "card-title" >
        Acceso rápido <
        /div> <
        /div>

        <
        div style = {
            {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 20,
                padding: 20,
            }
        } >

        { /* QR */ } <
        QRCodeCanvas value = "https://jose-rubio-ortega.onrender.com"
        size = { 180 }
        />

        <
        div className = "small muted" >
        Escanea para entrar a la app <
        /div>

        { /* BOTÓN */ } <
        button className = "btn btn-primary"
        style = {
            {
                width: "100%",
                padding: 14,
                fontSize: 16,
            }
        }
        onClick = {
            () => navigate("/asistencia") } >
        ✅Tomar asistencia <
        /button>

        <
        /div> <
        /div>

        { /* CALENDARIO + RIESGO */ } <
        div className = "card" >

        <
        div className = "card-header" >
        <
        div className = "card-title" >
        Calendario Escolar <
        /div> <
        /div>

        <
        div style = {
            {
                display: "flex",
                justifyContent: "center",
                marginBottom: 24,
            }
        } >
        <
        Calendar / >
        <
        /div>

        <
        div className = "card-header" >
        <
        div className = "card-title" >
        Distribución de Riesgo <
        /div> <
        /div>

        {
            pieData.length > 0 ? ( <
                div style = {
                    {
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                    }
                } >

                <
                ResponsiveContainer width = "60%"
                height = { 180 } >
                <
                PieChart >

                <
                Pie data = { pieData }
                cx = "50%"
                cy = "50%"
                innerRadius = { 50 }
                outerRadius = { 80 }
                dataKey = "value" >

                {
                    pieData.map((entry, i) => ( <
                        Cell key = { i }
                        fill = { entry.color }
                        />
                    ))
                }

                <
                /Pie>

                <
                Tooltip formatter = {
                    (v, n) => [
                        v + " alumnos",
                        n,
                    ]
                }
                />

                <
                /PieChart> <
                /ResponsiveContainer>

                <
                div style = {
                    { flex: 1 } } > {
                    pieData.map((d, i) => ( <
                        div key = { i }
                        className = "flex-center gap-8 mb-8" >

                        <
                        div style = {
                            {
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                background: d.color,
                                flexShrink: 0,
                            }
                        }
                        />

                        <
                        span className = "small" > { d.name } <
                        /span>

                        <
                        strong style = {
                            { marginLeft: "auto" } } >
                        { d.value } <
                        /strong>

                        <
                        /div>
                    ))
                } <
                /div>

                <
                /div>
            ) : ( <
                div className = "empty-state" >

                <
                div className = "empty-icon" > ✨
                <
                /div>

                <
                div className = "empty-title" >
                Sin datos suficientes <
                /div>

                <
                /div>
            )
        }

        <
        /div> <
        /div>

        { /* GRÁFICA */ }

        <
        div className = "card mb-24" >

        <
        div className = "card-header" >

        <
        div className = "card-title" > 📈Rendimiento por Grupo <
        /div>

        <
        /div>

        <
        ResponsiveContainer width = "100%"
        height = { 320 } >

        <
        BarChart data = { promedioPorGrupo } >

        <
        CartesianGrid strokeDasharray = "3 3" / >

        <
        XAxis dataKey = "grupo" / >

        <
        YAxis domain = {
            [0, 10] }
        />

        <
        Tooltip / >

        <
        Legend / >

        <
        Bar dataKey = "promedio"
        fill = "#8b5cf6"
        radius = {
            [10, 10, 0, 0] }
        />

        <
        /BarChart>

        <
        /ResponsiveContainer>

        <
        /div>


        { /* AVISOS */ } <
        div className = "card" >

        <
        div className = "card-header" >

        <
        div className = "card-title" >
        Próximos Avisos <
        /div>

        <
        button className = "btn btn-sm"
        onClick = {
            () => navigate("/avisos") } >
        Ver todos <
        /button>

        <
        /div>

        {
            db.avisos.length === 0 ? ( <
                div className = "empty-state" >

                <
                div className = "empty-icon" > 🔔
                <
                /div>

                <
                div className = "empty-title" >
                Sin avisos <
                /div>

                <
                /div>
            ) : (
                db.avisos.slice(0, 3).map((av) => ( <
                    div key = { av.id }
                    className = "aviso-item" >

                    <
                    div className = "aviso-icon"
                    style = {
                        { background: "#dbeafe" } } >
                    {
                        av.tipo === "reunion" ?
                        "🤝" :
                            av.tipo === "calificaciones" ?
                            "📝" :
                            "📅"
                    } <
                    /div>

                    <
                    div style = {
                        { flex: 1 } } >

                    <
                    div className = "aviso-title" > { av.titulo } <
                    /div>

                    <
                    div className = "aviso-desc" > { av.desc } <
                    /div>

                    <
                    /div>

                    <
                    div className = "aviso-meta" >

                    <
                    div className = "aviso-fecha" > { av.fecha } <
                    /div>

                    <
                    span className = "badge badge-info"
                    style = {
                        { marginTop: 4 } } >
                    { av.grupo } <
                    /span>

                    <
                    /div>

                    <
                    /div>
                ))
            )
        }

        <
        /div>

        <
        /Layout>
    );
}

export default Dashboard;