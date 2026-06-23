import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDB, Layout } from "./App";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import { QRCodeCanvas } from "qrcode.react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

/* ── CLIMA con Open-Meteo (gratis, sin API key) ── */
function useClima() {
  const [clima, setClima] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Ciudad Juárez, Chihuahua: lat 31.6904, lon -106.4245
    const url =
      "https://api.open-meteo.com/v1/forecast" +
      "?latitude=31.6904&longitude=-106.4245" +
      "&current=temperature_2m,apparent_temperature,relative_humidity_2m," +
      "wind_speed_10m,wind_direction_10m,weather_code,precipitation" +
      "&wind_speed_unit=kmh&timezone=America%2FDenver&forecast_days=1";

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        const c = data.current;
        const code = c.weather_code;

        // Icono según WMO weather code
        const getIcon = (wc) => {
          if (wc === 0) return "☀️";
          if (wc <= 2)  return "🌤️";
          if (wc <= 3)  return "☁️";
          if (wc <= 49) return "🌫️";
          if (wc <= 67) return "🌧️";
          if (wc <= 77) return "🌨️";
          if (wc <= 82) return "🌦️";
          if (wc <= 99) return "⛈️";
          return "🌡️";
        };

        const getDesc = (wc) => {
          if (wc === 0)        return "Despejado";
          if (wc <= 2)         return "Parcialmente nublado";
          if (wc <= 3)         return "Nublado";
          if (wc <= 49)        return "Neblina";
          if (wc <= 67)        return "Lluvia";
          if (wc <= 77)        return "Nevada";
          if (wc <= 82)        return "Chubascos";
          if (wc <= 99)        return "Tormenta";
          return "Variable";
        };

        const dirViento = (deg) => {
          const dirs = ["N","NE","E","SE","S","SO","O","NO"];
          return dirs[Math.round(deg / 45) % 8];
        };

        setClima({
          temp:      Math.round(c.temperature_2m),
          sensacion: Math.round(c.apparent_temperature),
          humedad:   c.relative_humidity_2m,
          viento:    Math.round(c.wind_speed_10m),
          dirViento: dirViento(c.wind_direction_10m),
          lluvia:    c.precipitation,
          icono:     getIcon(code),
          desc:      getDesc(code),
        });
        setCargando(false);
      })
      .catch(() => { setError(true); setCargando(false); });
  }, []);

  return { clima, cargando, error };
}

function ClimaCard() {
  const { clima, cargando, error } = useClima();

  if (cargando) return (
    <div className="weather-card mb-24" style={{ justifyContent: "center" }}>
      <span style={{ fontSize: 14, opacity: 0.8 }}>⏳ Obteniendo clima en tiempo real…</span>
    </div>
  );

  if (error || !clima) return (
    <div className="weather-card mb-24" style={{ justifyContent: "center" }}>
      <span style={{ fontSize: 14, opacity: 0.8 }}>🌐 Sin conexión al servicio del clima</span>
    </div>
  );

  return (
    <div className="weather-card mb-24">
      <div className="weather-left">
        <div className="weather-icon">{clima.icono}</div>
        <div>
          <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 2 }}>Ciudad Juárez, Chihuahua</div>
          <div className="weather-temp">{clima.temp}°C</div>
          <div style={{ fontSize: 14, opacity: 0.9 }}>{clima.desc}</div>
        </div>
      </div>
      <div className="weather-right">
        <div>🌡️ Sensación térmica: <strong>{clima.sensacion}°C</strong></div>
        <div>💧 Humedad: <strong>{clima.humedad}%</strong></div>
        <div>💨 Viento: <strong>{clima.viento} km/h {clima.dirViento}</strong></div>
        {clima.lluvia > 0 && <div>🌧️ Precipitación: <strong>{clima.lluvia} mm</strong></div>}
        <div style={{ fontSize: 11, opacity: 0.65, marginTop: 4 }}>
          Actualizado en tiempo real · Open-Meteo
        </div>
      </div>
    </div>
  );
}

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

  const destacados = [...db.alumnos]
    .map((a) => ({ ...a, prom: db.promedioAlumno(a.id) }))
    .filter((a) => a.prom !== null)
    .sort((a, b) => b.prom - a.prom)
    .slice(0, 3);

  const pieData = [
    { name:"Regular",     value:db.alumnos.filter(a=>db.nivelRiesgo(a.id)==="bajo").length,  color:"#3a7a5a" },
    { name:"Seguimiento", value:db.alumnos.filter(a=>db.nivelRiesgo(a.id)==="medio").length, color:"#8a6a20" },
    { name:"Alto riesgo", value:enRiesgo.length,                                              color:"#8a3a3a" },
  ].filter(d=>d.value>0);

  const promedioPorGrupo = db.grupos.map((g) => {
    const als = db.alumnos.filter(a=>a.grupo===g.id);
    const proms = als.map(a=>db.promedioAlumno(a.id)).filter(Boolean);
    return { grupo:g.nombre, promedio: proms.length ? +(proms.reduce((a,b)=>a+b,0)/proms.length).toFixed(1) : 0 };
  });

  return (
    <Layout title="Dashboard">
      <div className="dashboard-header">
        <h2>Bienvenida, Directora Norma Alvarez</h2>
        <p>Monitoreo general de alumnos, asistencia y rendimiento académico.</p>
      </div>

      {/* STATS */}
      <div className="stat-grid mb-24">
        <div className="stat-card">
          <div className="stat-icon" style={{background:"#dde6f5"}}>👨‍🎓</div>
          <div className="stat-label">Total Alumnos</div>
          <div className="stat-value">{totalAlumnos}</div>
          <div className="stat-sub">{db.grupos.length} grupos activos</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background:"#d6eed9"}}>✅</div>
          <div className="stat-label">Asistencia Hoy</div>
          <div className="stat-value">{pctAsist}%</div>
          <div className="stat-sub">{presentes}/{asistHoy.length} presentes</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background:"#e8e0f5"}}>📊</div>
          <div className="stat-label">Promedio General</div>
          <div className="stat-value">{promedioGeneral}</div>
          <div className="stat-sub">Ciclo 2024-2025</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background:"#f5dede"}}>⚠️</div>
          <div className="stat-label">Alumnos en Riesgo</div>
          <div className="stat-value" style={{color:enRiesgo.length>0?"#8a3a3a":"#3a7a5a"}}>{enRiesgo.length}</div>
          <div className="stat-sub">Requieren atención urgente</div>
        </div>
      </div>

      {/* CLIMA EN TIEMPO REAL */}
      <ClimaCard />

      {/* ALERTAS */}
      {enRiesgo.map((a) => (
        <div key={a.id} className="alert alert-danger mb-8"
          style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
          <span style={{fontSize:20}}>🚨</span>
          <div style={{flex:1,display:"flex",alignItems:"center",gap:12}}>
            <div className="avatar">{a.nombre.split(" ").map(n=>n[0]).slice(0,2).join("")}</div>
            <div>
              <strong>{a.nombre}</strong> — En riesgo escolar
              <div className="small muted">
                {db.faltasAlumno(a.id)} faltas · Promedio: {db.promedioAlumno(a.id)??"--"} · Grupo: {a.grupo}
              </div>
            </div>
          </div>
          <button className="btn btn-sm btn-danger" onClick={()=>navigate("/riesgo")}>Ver alertas</button>
        </div>
      ))}

      {/* QR + CALENDARIO */}
      <div className="grid-2 mb-24" style={{marginTop:enRiesgo.length?16:0}}>
        <div className="card">
          <div className="card-header"><div className="card-title">Control de Asistencia</div></div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:18,padding:16}}>
            <QRCodeCanvas value="https://sistema-control-escolar-web3.onrender.com/" size={130} />
            <div className="small muted" style={{textAlign:"center"}}>
              Escanea el código QR para acceder desde tu celular
            </div>
            <div style={{width:"100%",background:"var(--bg-base)",border:"1px solid var(--border)",borderRadius:10,padding:12}}>
              <div style={{marginBottom:6}}>👨‍🎓 Alumnos: {totalAlumnos}</div>
              <div style={{marginBottom:6}}>🏫 Grupos: {db.grupos.length}</div>
              <div>⚠️ En riesgo: {enRiesgo.length}</div>
            </div>
            <button className="btn btn-primary" style={{width:"100%",padding:12}}
              onClick={()=>navigate("/asistencia")}>✅ Tomar asistencia</button>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">Calendario Escolar</div></div>
          <div style={{display:"flex",justifyContent:"center",marginBottom:20}}>
            <Calendar />
          </div>
          <div className="card-header"><div className="card-title">Distribución de Riesgo</div></div>
          {pieData.length>0 ? (
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <ResponsiveContainer width="55%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value">
                    {pieData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                  </Pie>
                  <Tooltip formatter={(v,n)=>[v+" alumnos",n]}/>
                </PieChart>
              </ResponsiveContainer>
              <div style={{flex:1}}>
                {pieData.map((d,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:d.color,flexShrink:0}}/>
                    <span className="small">{d.name}</span>
                    <strong style={{marginLeft:"auto"}}>{d.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state"><div className="empty-icon">✨</div><div className="empty-title">Sin datos</div></div>
          )}
        </div>
      </div>

      {/* RENDIMIENTO POR GRUPO */}
      <div className="card mb-24">
        <div className="card-header"><div className="card-title">Rendimiento por Grupo</div></div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={promedioPorGrupo}>
            <CartesianGrid strokeDasharray="3 3"/>
            <XAxis dataKey="grupo" tick={{fontSize:11}}/>
            <YAxis domain={[0,10]}/>
            <Tooltip/>
            <Legend/>
            <Bar dataKey="promedio" fill="#4a6fa5" radius={[6,6,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ALUMNOS DESTACADOS */}
      <div className="card mb-24">
        <div className="card-header"><div className="card-title">🏆 Alumnos Destacados</div></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Pos.</th><th>Alumno</th><th>Promedio</th><th>Grupo</th></tr></thead>
            <tbody>
              {destacados.length===0
                ? <tr><td colSpan={4} style={{textAlign:"center",color:"var(--text-muted)"}}>Sin datos de calificaciones</td></tr>
                : destacados.map((a,i)=>(
                  <tr key={a.id}>
                    <td>{i===0?"🥇":i===1?"🥈":"🥉"}</td>
                    <td>{a.nombre}</td>
                    <td><strong style={{color:"#3a7a5a"}}>{a.prom.toFixed(1)}</strong></td>
                    <td>{a.grupo}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* AVISOS */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">🔔 Próximos Avisos</div>
          <button className="btn btn-sm" onClick={()=>navigate("/avisos")}>Ver todos</button>
        </div>
        {db.avisos.length===0
          ? <div className="empty-state"><div className="empty-icon">🔔</div><div className="empty-title">Sin avisos</div></div>
          : db.avisos.slice(0,3).map(av=>(
            <div key={av.id} className="aviso-item">
              <div className="aviso-icon">
                {av.tipo==="reunion"?"🤝":av.tipo==="calificaciones"?"📝":"📅"}
              </div>
              <div style={{flex:1}}>
                <div className="aviso-title">{av.titulo}</div>
                <div className="aviso-desc">{av.desc}</div>
              </div>
              <div className="aviso-meta">
                <div className="aviso-fecha">{av.fecha}</div>
                <span className="badge badge-info" style={{marginTop:4}}>{av.grupo}</span>
              </div>
            </div>
          ))
        }
      </div>
    </Layout>
  );
}

export default Dashboard;
