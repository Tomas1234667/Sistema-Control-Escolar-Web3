import React, { useState, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { useAppDB, Layout, useAuth } from "./App";

const INITIALS = (name) => name.split(" ").map(n=>n[0]).slice(0,2).join("").toUpperCase();
const ESTADOS  = ["presente","ausente","justificado"];
const ESTADO_ICON  = { presente:"✅", ausente:"❌", justificado:"📋" };
const ESTADO_LABEL = { presente:"Presente", ausente:"Ausente", justificado:"Justificado" };
const ESTADO_COLOR = { presente:"#16a34a", ausente:"#dc2626", justificado:"#d97706" };

const CICLO_INICIO = new Date("2026-08-24");
const CICLO_FIN    = new Date("2027-06-18");
const DIAS_HABILES_CICLO = 185;

function diasTranscurridos() {
  const hoy = new Date();
  const fin  = hoy < CICLO_FIN ? hoy : CICLO_FIN;
  if (fin < CICLO_INICIO) return 0;
  const diff = Math.floor((fin - CICLO_INICIO) / (1000*60*60*24));
  return Math.min(Math.round(diff * 0.7), DIAS_HABILES_CICLO);
}

const padZ = n => String(n).padStart(2,"0");
const fmt  = (y,m,d) => `${y}-${padZ(m+1)}-${padZ(d)}`;

const MESES_CORTO = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const MESES_LARGO = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

/* ════════════════════════════════════════════════
   GENERADOR PDF — REPORTE POR GRUPO
   Tabla horizontal: alumnos en filas, días en columnas agrupadas por mes
════════════════════════════════════════════════ */
function generarPDFGrupo(grupo, maestro, alumnos, todasAsistencias, fechaInicio, fechaFin) {
  const inicio = new Date(fechaInicio);
  const fin    = new Date(fechaFin);
  const fechaHoy = new Date().toLocaleDateString("es-MX",{year:"numeric",month:"long",day:"numeric"});

  // Construir lista de fechas con registro (solo días que tienen al menos un registro)
  const fechasConRegistro = new Set();
  todasAsistencias.forEach(a => {
    if (a.fecha >= fechaInicio && a.fecha <= fechaFin &&
        alumnos.some(al=>al.id===a.alumnoId)) {
      fechasConRegistro.add(a.fecha);
    }
  });
  // También incluir todas las fechas del rango (para mostrar huecos)
  const d = new Date(inicio);
  while (d <= fin) {
    fechasConRegistro.add(d.toISOString().slice(0,10));
    d.setDate(d.getDate()+1);
  }
  const fechas = [...fechasConRegistro].sort();

  // Agrupar fechas por mes para los encabezados
  const meses = [];
  fechas.forEach(f => {
    const [y,m] = f.split("-");
    const key = `${y}-${m}`;
    if (!meses.length || meses[meses.length-1].key !== key) {
      meses.push({ key, label: `${MESES_CORTO[parseInt(m)-1]} ${y}`, count:1 });
    } else {
      meses[meses.length-1].count++;
    }
  });

  // Construir mapa de asistencia por alumno
  const mapaAsist = {};
  alumnos.forEach(al => {
    mapaAsist[al.id] = {};
    todasAsistencias.filter(a=>a.alumnoId===al.id).forEach(a=>{ mapaAsist[al.id][a.fecha]=a.estado; });
  });

  // Stats por alumno
  const statsAlumno = (alumnoId) => {
    let pres=0,aus=0,just=0,total=0;
    fechas.forEach(f => {
      const est = mapaAsist[alumnoId]?.[f];
      if (est) {
        total++;
        if(est==="presente")pres++;
        else if(est==="ausente")aus++;
        else if(est==="justificado")just++;
      }
    });
    return { pres, aus, just, total, pct: total>0?Math.round((pres/total)*100):null };
  };

  // Stats globales del grupo
  let gpres=0,gaus=0,gjust=0,gtotal=0;
  alumnos.forEach(al => {
    const s = statsAlumno(al.id);
    gpres+=s.pres; gaus+=s.aus; gjust+=s.just; gtotal+=s.total;
  });
  const gpct = gtotal>0?Math.round((gpres/gtotal)*100):null;

  // Abreviar días: solo el número del día
  const diaNum = (f) => parseInt(f.split("-")[2]);

  // Colores de celda
  const cellColor = (est) => {
    if (est==="presente")   return { bg:"#dcfce7", color:"#15803d", text:"P" };
    if (est==="ausente")    return { bg:"#fee2e2", color:"#b91c1c", text:"A" };
    if (est==="justificado")return { bg:"#fef9c3", color:"#92400e", text:"J" };
    return { bg:"#f9fafb", color:"#9ca3af", text:"·" };
  };

  // Generar filas de la tabla
  const filasHTML = alumnos.map((al, idx) => {
    const s = statsAlumno(al.id);
    const pctColor = s.pct===null?"#6b7280":s.pct>=90?"#15803d":s.pct>=75?"#92400e":"#b91c1c";
    const celdas = fechas.map(f => {
      const est = mapaAsist[al.id]?.[f];
      const c = cellColor(est);
      return `<td style="background:${c.bg};color:${c.color};font-weight:700;text-align:center;font-size:9px;padding:3px 1px;">${c.text}</td>`;
    }).join("");
    const bg = idx%2===0?"#fff":"#f8fafc";
    return `
      <tr style="background:${bg}">
        <td style="padding:4px 6px;font-weight:600;font-size:10px;white-space:nowrap;border-right:2px solid #e2e8f0;">${idx+1}. ${al.nombre}</td>
        ${celdas}
        <td style="text-align:center;font-weight:700;font-size:10px;color:#15803d;border-left:1px solid #e2e8f0;">${s.pres}</td>
        <td style="text-align:center;font-weight:700;font-size:10px;color:#b91c1c;">${s.aus}</td>
        <td style="text-align:center;font-weight:700;font-size:10px;color:#92400e;">${s.just}</td>
        <td style="text-align:center;font-weight:800;font-size:11px;color:${pctColor};border-left:2px solid #e2e8f0;">${s.pct!==null?s.pct+"%":"—"}</td>
      </tr>`;
  }).join("");

  // Encabezados de mes (colspan)
  const thMeses = meses.map(m =>
    `<th colspan="${m.count}" style="background:#1e3a5f;color:#fff;text-align:center;padding:5px 2px;font-size:10px;font-weight:700;border-right:1px solid #2d5a8e;">${m.label}</th>`
  ).join("");

  // Encabezados de día
  const thDias = fechas.map(f => {
    const dn = diaNum(f);
    const dow = new Date(f).getDay(); // 0=dom,6=sab
    const esFinSemana = dow===0||dow===6;
    return `<th style="background:${esFinSemana?"#374151":"#2c4a6e"};color:${esFinSemana?"#9ca3af":"#e2e8f0"};text-align:center;padding:4px 1px;font-size:9px;min-width:18px;border-right:1px solid #3d6080;">${dn}</th>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<title>Reporte de Asistencia — ${grupo?.nombre||"Grupo"}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Plus Jakarta Sans',Arial,sans-serif;color:#1e293b;background:#fff;padding:20px;font-size:11px}

  .header{display:flex;align-items:center;gap:16px;border-bottom:4px solid #1e3a5f;padding-bottom:12px;margin-bottom:14px}
  .escudo{width:52px;height:52px;background:linear-gradient(135deg,#1e3a5f,#2c6fad);border-radius:12px;
    display:flex;align-items:center;justify-content:center;font-size:26px;color:#fff;flex-shrink:0;box-shadow:0 2px 8px #1e3a5f44}
  .escuela h1{font-size:16px;font-weight:800;color:#1e3a5f;line-height:1.2}
  .escuela p{font-size:10px;color:#64748b;margin-top:2px}
  .badges{margin-left:auto;display:flex;flex-direction:column;align-items:flex-end;gap:4px}
  .badge-pill{padding:4px 12px;border-radius:20px;font-size:10px;font-weight:700;white-space:nowrap}

  .info-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px}
  .info-card{padding:8px 10px;border-radius:8px;border-left:3px solid}
  .info-card .lbl{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;opacity:.7}
  .info-card .val{font-size:13px;font-weight:800;margin-top:2px}

  .stat-row{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:14px}
  .stat{padding:8px;border-radius:8px;text-align:center;border:1px solid}
  .stat .n{font-size:20px;font-weight:800}
  .stat .l{font-size:9px;font-weight:700;margin-top:1px}

  .tabla-wrap{overflow-x:auto;border-radius:10px;border:1px solid #e2e8f0;box-shadow:0 1px 6px #0001}
  table{border-collapse:collapse;width:100%}
  th{border:1px solid #2d5a8e}
  td{border:1px solid #e2e8f0}

  .leyenda{display:flex;gap:16px;margin-top:10px;flex-wrap:wrap;align-items:center}
  .leyenda-item{display:flex;align-items:center;gap:5px;font-size:10px}
  .leyenda-box{width:16px;height:16px;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800}

  .firma-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:30px;margin-top:24px}
  .firma{text-align:center}
  .firma-line{border-top:1px solid #334155;padding-top:5px;font-size:10px;color:#475569;margin-top:30px}

  .footer{margin-top:14px;text-align:center;font-size:9px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:8px}

  @media print{
    body{padding:10px}
    button{display:none!important}
    .tabla-wrap{overflow:visible}
    @page{size:landscape;margin:1cm}
  }
</style>
</head>
<body>

<!-- ENCABEZADO -->
<div class="header">
  <div class="escudo">🏫</div>
  <div class="escuela">
    <h1>Escuela Primaria EduGestión</h1>
    <p>Ciudad Juárez, Chihuahua · Turno Vespertino · Ciclo 2026-2027</p>
    <p>Reporte generado el ${fechaHoy}</p>
  </div>
  <div class="badges">
    <div class="badge-pill" style="background:#1e3a5f;color:#fff">📋 Reporte de Asistencia por Grupo</div>
    <div class="badge-pill" style="background:#f0f9ff;color:#0369a1;border:1px solid #bae6fd">
      📅 ${new Date(fechaInicio).toLocaleDateString("es-MX",{day:"numeric",month:"short",year:"numeric"})}
      &nbsp;→&nbsp;
      ${new Date(fechaFin).toLocaleDateString("es-MX",{day:"numeric",month:"short",year:"numeric"})}
    </div>
  </div>
</div>

<!-- INFO DEL GRUPO -->
<div class="info-grid">
  <div class="info-card" style="background:#eff6ff;border-color:#3b82f6">
    <div class="lbl" style="color:#1d4ed8">Grupo</div>
    <div class="val" style="color:#1d4ed8">${grupo?.nombre||"—"}</div>
  </div>
  <div class="info-card" style="background:#f0fdf4;border-color:#22c55e">
    <div class="lbl" style="color:#15803d">Maestro Titular</div>
    <div class="val" style="color:#15803d;font-size:11px">${maestro?.nombre||"—"}</div>
  </div>
  <div class="info-card" style="background:#fdf4ff;border-color:#a855f7">
    <div class="lbl" style="color:#7e22ce">Total Alumnos</div>
    <div class="val" style="color:#7e22ce">${alumnos.length}</div>
  </div>
  <div class="info-card" style="background:#fff7ed;border-color:#f97316">
    <div class="lbl" style="color:#c2410c">Días en el Periodo</div>
    <div class="val" style="color:#c2410c">${fechas.length}</div>
  </div>
</div>

<!-- ESTADÍSTICAS GLOBALES -->
<div class="stat-row">
  <div class="stat" style="background:#f0fdf4;border-color:#86efac">
    <div class="n" style="color:#15803d">${gpres}</div>
    <div class="l" style="color:#15803d">PRESENCIAS TOTALES</div>
  </div>
  <div class="stat" style="background:#fef2f2;border-color:#fca5a5">
    <div class="n" style="color:#b91c1c">${gaus}</div>
    <div class="l" style="color:#b91c1c">AUSENCIAS TOTALES</div>
  </div>
  <div class="stat" style="background:#fefce8;border-color:#fde047">
    <div class="n" style="color:#92400e">${gjust}</div>
    <div class="l" style="color:#92400e">JUSTIFICADAS</div>
  </div>
  <div class="stat" style="background:#eff6ff;border-color:#93c5fd">
    <div class="n" style="color:#1d4ed8">${gtotal}</div>
    <div class="l" style="color:#1d4ed8">REGISTROS TOTALES</div>
  </div>
  <div class="stat" style="background:${gpct>=90?"#f0fdf4":gpct>=75?"#fefce8":"#fef2f2"};border-color:${gpct>=90?"#86efac":gpct>=75?"#fde047":"#fca5a5"}">
    <div class="n" style="color:${gpct>=90?"#15803d":gpct>=75?"#92400e":"#b91c1c"}">${gpct!==null?gpct+"%":"—"}</div>
    <div class="l" style="color:${gpct>=90?"#15803d":gpct>=75?"#92400e":"#b91c1c"}">% ASISTENCIA GRUPO</div>
  </div>
</div>

<!-- TABLA PRINCIPAL -->
<div class="tabla-wrap">
<table>
  <thead>
    <tr>
      <th rowspan="2" style="background:#0f2744;color:#fff;padding:6px 8px;text-align:left;font-size:10px;min-width:160px;border-right:2px solid #2d5a8e;">ALUMNO</th>
      ${thMeses}
      <th colspan="3" style="background:#1e3a5f;color:#fff;text-align:center;padding:5px 2px;font-size:10px;font-weight:700;border-left:1px solid #2d5a8e;">RESUMEN</th>
      <th rowspan="2" style="background:#0f2744;color:#e2e8f0;text-align:center;padding:5px 3px;font-size:10px;border-left:2px solid #2d5a8e;min-width:36px;">%</th>
    </tr>
    <tr>
      ${thDias}
      <th style="background:#166534;color:#dcfce7;text-align:center;padding:4px 3px;font-size:9px;border-left:1px solid #2d5a8e;min-width:24px;">P</th>
      <th style="background:#991b1b;color:#fee2e2;text-align:center;padding:4px 3px;font-size:9px;min-width:24px;">A</th>
      <th style="background:#78350f;color:#fef9c3;text-align:center;padding:4px 3px;font-size:9px;min-width:24px;">J</th>
    </tr>
  </thead>
  <tbody>
    ${filasHTML}
  </tbody>
</table>
</div>

<!-- LEYENDA -->
<div class="leyenda" style="margin-top:10px">
  <span style="font-size:10px;font-weight:700;color:#475569">Leyenda:</span>
  <div class="leyenda-item">
    <div class="leyenda-box" style="background:#dcfce7;color:#15803d;border:1px solid #86efac">P</div>
    <span>Presente</span>
  </div>
  <div class="leyenda-item">
    <div class="leyenda-box" style="background:#fee2e2;color:#b91c1c;border:1px solid #fca5a5">A</div>
    <span>Ausente</span>
  </div>
  <div class="leyenda-item">
    <div class="leyenda-box" style="background:#fef9c3;color:#92400e;border:1px solid #fde047">J</div>
    <span>Justificado</span>
  </div>
  <div class="leyenda-item">
    <div class="leyenda-box" style="background:#f9fafb;color:#9ca3af;border:1px solid #e5e7eb">·</div>
    <span>Sin registro</span>
  </div>
  <div class="leyenda-item" style="margin-left:10px">
    <div style="width:16px;height:16px;background:#374151;border-radius:3px;border:1px solid #4b5563"></div>
    <span style="color:#6b7280">Fin de semana</span>
  </div>
</div>

<!-- FIRMAS -->
<div class="firma-row">
  <div class="firma">
    <div class="firma-line">
      <strong>${maestro?.nombre||"_______________________"}</strong><br>Maestro Titular
    </div>
  </div>
  <div class="firma">
    <div class="firma-line">
      <strong>Ma. Norma Alvarez</strong><br>Director(a)
    </div>
  </div>
  <div class="firma">
    <div class="firma-line">
      <strong>_______________________</strong><br>Sello de la Institución
    </div>
  </div>
</div>

<div class="footer">
  EduGestión · Sistema de Control Escolar · Ciudad Juárez, Chihuahua · ${fechaHoy}<br>
  Documento generado automáticamente — válido sin firma manuscrita cuando lleva sello institucional
</div>

<script>window.onload = () => window.print();</script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=1200,height=800");
  win.document.write(html);
  win.document.close();
}

/* ════════════════════════════════════════════════
   GENERADOR PDF — REPORTE INDIVIDUAL POR ALUMNO
   Tabla vertical: fechas en filas, con calendario visual por mes
════════════════════════════════════════════════ */
function generarPDFAlumno(alumno, grupo, maestro, asistencias, fechaInicio, fechaFin) {
  const fechaHoy = new Date().toLocaleDateString("es-MX",{year:"numeric",month:"long",day:"numeric"});

  const reg = {};
  asistencias.filter(a=>a.alumnoId===alumno.id).forEach(a=>{ reg[a.fecha]=a.estado; });

  // Calcular stats
  let pres=0,aus=0,just=0,total=0;
  const d = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  const dc = new Date(d);
  while (dc <= fin) {
    const ds = dc.toISOString().slice(0,10);
    const est = reg[ds];
    if (est) {
      total++;
      if(est==="presente")pres++;
      else if(est==="ausente")aus++;
      else if(est==="justificado")just++;
    }
    dc.setDate(dc.getDate()+1);
  }
  const pct = total>0?Math.round((pres/total)*100):null;
  const pctColor = pct===null?"#6b7280":pct>=90?"#15803d":pct>=75?"#92400e":"#b91c1c";

  // Agrupar registros por mes para la tabla
  const porMes = {};
  const dk = new Date(fechaInicio);
  while (dk <= fin) {
    const ds = dk.toISOString().slice(0,10);
    const [y,m] = ds.split("-");
    const key = `${y}-${m}`;
    if (!porMes[key]) porMes[key] = { año:parseInt(y), mes:parseInt(m)-1, dias:[] };
    porMes[key].dias.push({ fecha:ds, dia:parseInt(ds.split("-")[2]), estado:reg[ds]||null });
    dk.setDate(dk.getDate()+1);
  }

  // Generar calendarios visuales por mes
  const calendariosHTML = Object.values(porMes).map(({ año, mes, dias }) => {
    const nombreMes = MESES_LARGO[mes];
    const offset = new Date(año, mes, 1).getDay();
    const totalDias = new Date(año, mes+1, 0).getDate();
    const mapa = {};
    dias.forEach(d => { mapa[d.dia] = d.estado; });

    let celdas = "";
    for(let i=0;i<offset;i++) celdas += `<td></td>`;
    for(let d=1;d<=totalDias;d++){
      const est = mapa[d];
      let bg="#f9fafb",color="#9ca3af",letra="";
      if(est==="presente"){bg="#dcfce7";color="#15803d";letra="P";}
      else if(est==="ausente"){bg="#fee2e2";color="#b91c1c";letra="A";}
      else if(est==="justificado"){bg="#fef9c3";color="#92400e";letra="J";}
      const dow = new Date(año,mes,d).getDay();
      const finSem = dow===0||dow===6;
      if(finSem && !est){ bg="#f1f5f9"; color="#cbd5e1"; }
      celdas += `<td style="background:${bg};color:${color};text-align:center;padding:5px 2px;font-size:10px;font-weight:700;border-radius:3px;">
        <div style="font-size:9px;font-weight:400;color:inherit;opacity:.7">${d}</div>
        <div>${letra||"·"}</div>
      </td>`;
    }

    // Stats del mes
    const regs = dias.filter(d=>d.estado);
    const mpres = regs.filter(d=>d.estado==="presente").length;
    const maus  = regs.filter(d=>d.estado==="ausente").length;
    const mjust = regs.filter(d=>d.estado==="justificado").length;
    const mtot  = regs.length;
    const mpct  = mtot>0?Math.round((mpres/mtot)*100):null;

    return `
    <div style="margin-bottom:16px;break-inside:avoid">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <div style="font-weight:800;font-size:13px;color:#1e3a5f">${nombreMes} ${año}</div>
        <div style="display:flex;gap:8px;font-size:10px">
          <span style="background:#dcfce7;color:#15803d;padding:2px 8px;border-radius:10px;font-weight:700">P: ${mpres}</span>
          <span style="background:#fee2e2;color:#b91c1c;padding:2px 8px;border-radius:10px;font-weight:700">A: ${maus}</span>
          <span style="background:#fef9c3;color:#92400e;padding:2px 8px;border-radius:10px;font-weight:700">J: ${mjust}</span>
          ${mpct!==null?`<span style="background:#eff6ff;color:#1d4ed8;padding:2px 8px;border-radius:10px;font-weight:800">${mpct}%</span>`:""}
        </div>
      </div>
      <table style="width:100%;border-collapse:separate;border-spacing:2px">
        <thead>
          <tr>
            ${["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"].map(d=>`<th style="text-align:center;font-size:9px;font-weight:700;color:#64748b;padding:3px">${d}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          <tr>${celdas.slice(0,7*4+offset>totalDias+offset?celdas.length:undefined)}</tr>
        </tbody>
      </table>
      <!-- Tabla del mes en filas de semana -->
      ${generarSemanas(año, mes, mapa)}
    </div>`;
  }).join("");

  // Generar tabla semanal del mes (más legible)
  function generarSemanas(año, mes, mapa) {
    const offset = new Date(año, mes, 1).getDay();
    const totalDias = new Date(año, mes+1, 0).getDate();
    let semanas = [];
    let semana = Array(offset).fill(null);
    for(let d=1;d<=totalDias;d++){
      semana.push(d);
      if(semana.length===7||(d===totalDias)){
        while(semana.length<7) semana.push(null);
        semanas.push([...semana]);
        semana=[];
      }
    }
    return `<table style="width:100%;border-collapse:separate;border-spacing:2px;margin-top:2px">
      <thead><tr>${["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"].map(d=>`<th style="text-align:center;font-size:9px;font-weight:700;color:#64748b;padding:2px;width:14.28%">${d}</th>`).join("")}</tr></thead>
      <tbody>
        ${semanas.map(sem=>`<tr>${sem.map(d=>{
          if(!d) return `<td style="padding:3px"></td>`;
          const est=mapa[d];
          let bg="#f9fafb",color="#9ca3af",letra="·";
          if(est==="presente"){bg="#dcfce7";color="#15803d";letra="P";}
          else if(est==="ausente"){bg="#fee2e2";color="#b91c1c";letra="A";}
          else if(est==="justificado"){bg="#fef9c3";color="#92400e";letra="J";}
          const dow=new Date(año,mes,d).getDay();
          if((dow===0||dow===6)&&!est){bg="#f1f5f9";color="#cbd5e1";}
          return `<td style="background:${bg};color:${color};text-align:center;padding:5px 2px;border-radius:4px;font-size:10px;font-weight:700;border:1px solid ${bg==="f9fafb"?"#e5e7eb":bg};">
            <div style="font-size:8px;font-weight:400;opacity:.6">${d}</div>
            <div>${letra}</div>
          </td>`;
        }).join("")}</tr>`).join("")}
      </tbody>
    </table>`;
  }

  // Lista detallada de faltas
  const faltas = [];
  const dk2 = new Date(fechaInicio);
  while (dk2 <= fin) {
    const ds = dk2.toISOString().slice(0,10);
    const est = reg[ds];
    if (est === "ausente" || est === "justificado") {
      const [y,m,day] = ds.split("-");
      faltas.push({ fecha:ds, label:`${parseInt(day)} ${MESES_LARGO[parseInt(m)-1]} ${y}`, estado:est });
    }
    dk2.setDate(dk2.getDate()+1);
  }

  const faltasHTML = faltas.length === 0
    ? `<div style="padding:12px;background:#f0fdf4;border-radius:8px;color:#15803d;font-weight:700;font-size:12px">
        ✅ Sin ausencias ni justificados en este periodo
       </div>`
    : `<table style="width:100%;border-collapse:collapse;font-size:11px">
        <thead>
          <tr style="background:#1e3a5f">
            <th style="color:#fff;padding:7px 10px;text-align:left">#</th>
            <th style="color:#fff;padding:7px 10px;text-align:left">Fecha</th>
            <th style="color:#fff;padding:7px 10px;text-align:center">Estado</th>
          </tr>
        </thead>
        <tbody>
          ${faltas.map((f,i)=>`
            <tr style="background:${i%2?"#f8fafc":"#fff"}">
              <td style="padding:6px 10px;color:#64748b">${i+1}</td>
              <td style="padding:6px 10px;font-weight:600">${f.label}</td>
              <td style="padding:6px 10px;text-align:center">
                <span style="padding:3px 10px;border-radius:10px;font-weight:700;font-size:10px;
                  background:${f.estado==="ausente"?"#fee2e2":"#fef9c3"};
                  color:${f.estado==="ausente"?"#b91c1c":"#92400e"}">
                  ${f.estado==="ausente"?"❌ Ausente":"📋 Justificado"}
                </span>
              </td>
            </tr>`).join("")}
        </tbody>
      </table>`;

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<title>Asistencia Individual — ${alumno.nombre}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Plus Jakarta Sans',Arial,sans-serif;color:#1e293b;background:#fff;padding:24px;font-size:11px}
  h2{font-size:12px;font-weight:700;color:#1e3a5f;border-left:4px solid #1e3a5f;padding-left:8px;
    text-transform:uppercase;letter-spacing:.5px;margin:16px 0 8px}
  .footer{margin-top:16px;text-align:center;font-size:9px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:8px}
  @media print{body{padding:12px}button{display:none!important}@page{size:portrait;margin:1cm}}
</style>
</head>
<body>

<!-- ENCABEZADO -->
<div style="display:flex;align-items:center;gap:16px;border-bottom:4px solid #1e3a5f;padding-bottom:12px;margin-bottom:16px">
  <div style="width:52px;height:52px;background:linear-gradient(135deg,#1e3a5f,#2c6fad);border-radius:12px;
    display:flex;align-items:center;justify-content:center;font-size:26px;color:#fff;flex-shrink:0">🏫</div>
  <div>
    <div style="font-size:16px;font-weight:800;color:#1e3a5f">Escuela Primaria EduGestión</div>
    <div style="font-size:10px;color:#64748b;margin-top:2px">Ciudad Juárez, Chihuahua · Turno Vespertino · Ciclo 2026-2027</div>
    <div style="font-size:10px;color:#64748b">Reporte generado el ${fechaHoy}</div>
  </div>
  <div style="margin-left:auto;display:flex;flex-direction:column;gap:4px;align-items:flex-end">
    <div style="padding:4px 12px;border-radius:20px;font-size:10px;font-weight:700;background:#1e3a5f;color:#fff">
      👤 Reporte Individual de Asistencia
    </div>
    <div style="padding:4px 12px;border-radius:20px;font-size:10px;font-weight:700;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe">
      📅 ${new Date(fechaInicio).toLocaleDateString("es-MX",{day:"numeric",month:"short",year:"numeric"})}
      → ${new Date(fechaFin).toLocaleDateString("es-MX",{day:"numeric",month:"short",year:"numeric"})}
    </div>
  </div>
</div>

<!-- DATOS DEL ALUMNO -->
<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
  <div style="display:flex;align-items:center;gap:12px;padding:12px 14px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0">
    <div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#1e3a5f,#2c6fad);
      display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;color:#fff;flex-shrink:0">
      ${INITIALS(alumno.nombre)}
    </div>
    <div>
      <div style="font-weight:800;font-size:14px">${alumno.nombre}</div>
      <div style="font-size:10px;color:#64748b;margin-top:2px">Grupo: <strong>${grupo?.nombre||alumno.grupo}</strong></div>
      <div style="font-size:10px;color:#64748b">Maestro: <strong>${maestro?.nombre||"—"}</strong></div>
    </div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
    <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:8px;text-align:center">
      <div style="font-size:22px;font-weight:800;color:#15803d">${pres}</div>
      <div style="font-size:9px;font-weight:700;color:#15803d">PRESENTES</div>
    </div>
    <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:8px;text-align:center">
      <div style="font-size:22px;font-weight:800;color:#b91c1c">${aus}</div>
      <div style="font-size:9px;font-weight:700;color:#b91c1c">AUSENTES</div>
    </div>
    <div style="background:#fefce8;border:1px solid #fde047;border-radius:8px;padding:8px;text-align:center">
      <div style="font-size:22px;font-weight:800;color:#92400e">${just}</div>
      <div style="font-size:9px;font-weight:700;color:#92400e">JUSTIFICADOS</div>
    </div>
    <div style="background:${pct>=90?"#f0fdf4":pct>=75?"#fefce8":"#fef2f2"};border:1px solid ${pct>=90?"#86efac":pct>=75?"#fde047":"#fca5a5"};border-radius:8px;padding:8px;text-align:center">
      <div style="font-size:22px;font-weight:800;color:${pctColor}">${pct!==null?pct+"%":"—"}</div>
      <div style="font-size:9px;font-weight:700;color:${pctColor}">% ASISTENCIA</div>
    </div>
  </div>
</div>

<!-- BARRA DE PROGRESO -->
<div style="background:#f1f5f9;border-radius:8px;padding:10px 14px;margin-bottom:16px;border:1px solid #e2e8f0">
  <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:5px">
    <span style="font-weight:700">Tasa de asistencia en el periodo</span>
    <span style="font-weight:800;color:${pctColor}">${pct!==null?pct+"%":"Sin datos"}</span>
  </div>
  <div style="background:#e2e8f0;border-radius:999px;height:10px;overflow:hidden">
    <div style="width:${pct||0}%;height:100%;border-radius:999px;
      background:linear-gradient(90deg,${pct>=90?"#16a34a,#4ade80":pct>=75?"#d97706,#fbbf24":"#dc2626,#f87171"})"></div>
  </div>
  <div style="display:flex;justify-content:space-between;font-size:9px;margin-top:3px;color:#64748b">
    <span>0%</span><span>Mínimo recomendado: 85%</span><span>100%</span>
  </div>
</div>

<!-- CALENDARIOS POR MES -->
<h2>📅 Calendario de Asistencia por Mes</h2>
<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-bottom:16px">
  ${Object.values(porMes).map(({ año, mes: mesIdx, dias }) => {
    const offset = new Date(año, mesIdx, 1).getDay();
    const totalDias = new Date(año, mesIdx+1, 0).getDate();
    const mapa = {};
    dias.forEach(d => { mapa[d.dia] = d.estado; });

    let semanas = [];
    let semana = Array(offset).fill(null);
    for(let d=1;d<=totalDias;d++){
      semana.push(d);
      if(semana.length===7){semanas.push([...semana]);semana=[];}
    }
    if(semana.length){while(semana.length<7)semana.push(null);semanas.push(semana);}

    const mpres = dias.filter(d=>d.estado==="presente").length;
    const maus  = dias.filter(d=>d.estado==="ausente").length;
    const mjust = dias.filter(d=>d.estado==="justificado").length;
    const mtot  = dias.filter(d=>d.estado).length;
    const mpct  = mtot>0?Math.round((mpres/mtot)*100):null;

    return `<div style="border:1px solid #e2e8f0;border-radius:10px;padding:10px;break-inside:avoid">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:7px">
        <div style="font-weight:800;font-size:12px;color:#1e3a5f">${MESES_LARGO[mesIdx]} ${año}</div>
        <div style="display:flex;gap:4px;font-size:9px">
          <span style="background:#dcfce7;color:#15803d;padding:2px 6px;border-radius:8px;font-weight:700">P:${mpres}</span>
          <span style="background:#fee2e2;color:#b91c1c;padding:2px 6px;border-radius:8px;font-weight:700">A:${maus}</span>
          <span style="background:#fef9c3;color:#92400e;padding:2px 6px;border-radius:8px;font-weight:700">J:${mjust}</span>
          ${mpct!==null?`<span style="background:#eff6ff;color:#1d4ed8;padding:2px 6px;border-radius:8px;font-weight:800">${mpct}%</span>`:""}
        </div>
      </div>
      <table style="width:100%;border-collapse:separate;border-spacing:2px">
        <thead><tr>${["D","L","M","M","J","V","S"].map(d=>`<th style="text-align:center;font-size:8px;font-weight:700;color:#94a3b8;padding:2px;width:14.28%">${d}</th>`).join("")}</tr></thead>
        <tbody>${semanas.map(sem=>`<tr>${sem.map(d=>{
          if(!d)return`<td></td>`;
          const est=mapa[d];
          let bg="#f9fafb",color="#9ca3af",letra="·";
          if(est==="presente"){bg="#dcfce7";color="#15803d";letra="P";}
          else if(est==="ausente"){bg="#fee2e2";color="#b91c1c";letra="A";}
          else if(est==="justificado"){bg="#fef9c3";color="#92400e";letra="J";}
          const dow=new Date(año,mesIdx,d).getDay();
          if((dow===0||dow===6)&&!est){bg="#f1f5f9";color="#e2e8f0";}
          return`<td style="background:${bg};color:${color};text-align:center;padding:4px 1px;border-radius:4px">
            <div style="font-size:7px;opacity:.6">${d}</div>
            <div style="font-size:9px;font-weight:800">${letra}</div>
          </td>`;
        }).join("")}</tr>`).join("")}</tbody>
      </table>
    </div>`;
  }).join("")}
</div>

<!-- DETALLE DE FALTAS -->
<h2>⚠️ Detalle de Ausencias y Justificados</h2>
<div style="margin-bottom:16px">
  ${faltasHTML}
</div>

<!-- FIRMA -->
<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:30px;margin-top:20px">
  <div style="text-align:center">
    <div style="border-top:1px solid #334155;padding-top:5px;font-size:10px;color:#475569;margin-top:28px">
      <strong>${maestro?.nombre||"_______________________"}</strong><br>Maestro Titular
    </div>
  </div>
  <div style="text-align:center">
    <div style="border-top:1px solid #334155;padding-top:5px;font-size:10px;color:#475569;margin-top:28px">
      <strong>Ma. Norma Alvarez</strong><br>Director(a)
    </div>
  </div>
  <div style="text-align:center">
    <div style="border-top:1px solid #334155;padding-top:5px;font-size:10px;color:#475569;margin-top:28px">
      <strong>_______________________</strong><br>Firma del Tutor
    </div>
  </div>
</div>

<div class="footer">
  EduGestión · Sistema de Control Escolar · Ciudad Juárez, Chihuahua · ${fechaHoy}
</div>

<script>window.onload = () => window.print();</script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=900,height=800");
  win.document.write(html);
  win.document.close();
}

/* ════════════════════════════════════════════════
   MODAL DESCARGA — elige grupo o alumno + periodo
════════════════════════════════════════════════ */
function ModalDescarga({ grupoId, alumnos, db, onClose }) {
  const grupo   = db.grupos.find(g=>g.id===grupoId);
  const maestro = grupo ? db.maestros.find(m=>m.id===grupo.maestroId) : null;
  const hoy     = new Date().toISOString().slice(0,10);
  const inicioC = CICLO_INICIO.toISOString().slice(0,10);

  const [modo,        setModo]        = useState("grupo");
  const [alumnoId,    setAlumnoId]    = useState(alumnos[0]?.id || "");
  const [fechaInicio, setFechaInicio] = useState(inicioC);
  const [fechaFin,    setFechaFin]    = useState(hoy);

  const handleDescargar = () => {
    if (!fechaInicio || !fechaFin) { toast.error("Selecciona el periodo"); return; }
    if (fechaInicio > fechaFin)    { toast.error("La fecha inicio debe ser antes que la final"); return; }

    if (modo === "grupo") {
      generarPDFGrupo(grupo, maestro, alumnos, db.asistencia, fechaInicio, fechaFin);
      toast.success("Abriendo reporte del grupo para imprimir / guardar como PDF…");
    } else {
      const al = alumnos.find(a=>a.id===alumnoId);
      if (!al) { toast.error("Selecciona un alumno"); return; }
      generarPDFAlumno(al, grupo, maestro, db.asistencia, fechaInicio, fechaFin);
      toast.success(`Abriendo reporte de ${al.nombre} para imprimir / guardar como PDF…`);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">📄 Generar Reporte de Asistencia</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        <div style={{display:"flex",gap:8,marginBottom:16}}>
          <button className={`btn btn-sm ${modo==="grupo"?"btn-primary":""}`}
            style={{flex:1}} onClick={()=>setModo("grupo")}>
            👥 Reporte de Grupo
          </button>
          <button className={`btn btn-sm ${modo==="alumno"?"btn-primary":""}`}
            style={{flex:1}} onClick={()=>setModo("alumno")}>
            👤 Reporte Individual
          </button>
        </div>

        <div style={{padding:"8px 12px",background:"var(--bg-base)",borderRadius:8,marginBottom:14,fontSize:13}}>
          <strong>Grupo:</strong> {grupo?.nombre || grupoId}
          {maestro && <span className="muted"> · Titular: {maestro.nombre}</span>}
        </div>

        {modo === "alumno" && (
          <div className="form-group" style={{marginBottom:14}}>
            <label className="form-label">Alumno</label>
            <select className="form-control" value={alumnoId} onChange={e=>setAlumnoId(e.target.value)}>
              {alumnos.map(a=><option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
          </div>
        )}

        <div className="form-grid" style={{marginBottom:10}}>
          <div className="form-group">
            <label className="form-label">Fecha inicio</label>
            <input type="date" className="form-control" value={fechaInicio}
              onChange={e=>setFechaInicio(e.target.value)} min={inicioC} max={hoy}/>
          </div>
          <div className="form-group">
            <label className="form-label">Fecha fin</label>
            <input type="date" className="form-control" value={fechaFin}
              onChange={e=>setFechaFin(e.target.value)} min={inicioC} max={hoy}/>
          </div>
        </div>

        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
          <span className="small muted" style={{alignSelf:"center"}}>Acceso rápido:</span>
          {[
            {lbl:"Ciclo completo",  ini:inicioC,      fin:hoy},
            {lbl:"Este mes",        ini:new Date(new Date().getFullYear(),new Date().getMonth(),1).toISOString().slice(0,10), fin:hoy},
            {lbl:"1er Trimestre",   ini:"2026-08-24",  fin:"2026-11-28"},
            {lbl:"2do Trimestre",   ini:"2026-12-01",  fin:"2027-03-14"},
            {lbl:"3er Trimestre",   ini:"2027-03-17",  fin:"2027-06-18"},
          ].map(({lbl,ini,fin})=>(
            <button key={lbl} className="btn btn-sm"
              onClick={()=>{setFechaInicio(ini);setFechaFin(fin>hoy?hoy:fin);}}>
              {lbl}
            </button>
          ))}
        </div>

        <div style={{padding:"8px 12px",background:"#eff6ff",border:"1px solid #93c5fd",
          borderRadius:8,fontSize:12,marginBottom:14,color:"#1e40af"}}>
          💡 Se abrirá una ventana con el reporte. Usa <strong>Ctrl+P</strong> o el menú de impresión del navegador para guardarlo como PDF.
        </div>

        <div className="form-actions">
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleDescargar}>
            📄 Generar PDF
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── MINI CALENDARIO MENSUAL ── */
function CalendarioMes({ año, mes, registros }) {
  const diasMes  = new Date(año, mes+1, 0).getDate();
  const offset   = new Date(año, mes, 1).getDay();
  const celdas   = [];
  for(let i=0;i<offset;i++) celdas.push(null);
  for(let d=1;d<=diasMes;d++) celdas.push(d);
  const DIAS = ["D","L","M","M","J","V","S"];

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
        {DIAS.map(d=>(
          <div key={d} style={{textAlign:"center",fontSize:10,fontWeight:700,color:"var(--text-muted)",padding:2}}>{d}</div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
        {celdas.map((d,i)=>{
          if(!d) return <div key={i}/>;
          const f = fmt(año,mes,d);
          const est = registros[f];
          const color = est ? ESTADO_COLOR[est] : undefined;
          const hoy   = new Date().toISOString().slice(0,10)===f;
          return (
            <div key={i} title={est ? ESTADO_LABEL[est] : "Sin registro"} style={{
              width:"100%",aspectRatio:"1",borderRadius:4,
              background: est ? color+"22" : "var(--bg-base)",
              border: hoy ? `2px solid ${color||"var(--accent)"}` : `1px solid ${est?color+"55":"var(--border)"}`,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:10,fontWeight:hoy?700:400,color: est?color:"var(--text-muted)",
              cursor:"default",
            }}>
              {d}
            </div>
          );
        })}
      </div>
      <div style={{display:"flex",gap:10,marginTop:8,flexWrap:"wrap"}}>
        {Object.entries(ESTADO_LABEL).map(([k,v])=>(
          <div key={k} style={{display:"flex",alignItems:"center",gap:4,fontSize:11}}>
            <div style={{width:10,height:10,borderRadius:2,background:ESTADO_COLOR[k]+"55",border:`1px solid ${ESTADO_COLOR[k]}`}}/>
            {v}
          </div>
        ))}
        <div style={{display:"flex",alignItems:"center",gap:4,fontSize:11}}>
          <div style={{width:10,height:10,borderRadius:2,background:"var(--bg-base)",border:"1px solid var(--border)"}}/>
          Sin registro
        </div>
      </div>
    </div>
  );
}

/* ── MODAL HISTORIAL ── */
function ModalHistorial({ alumno, grupo, db, onClose }) {
  const maestro = grupo ? db.maestros.find(m=>m.id===grupo.maestroId) : null;
  const hoy    = new Date();
  const [año,  setAño]  = useState(hoy.getFullYear());
  const [mes,  setMes]  = useState(hoy.getMonth());

  const registros = useMemo(()=>{
    const map = {};
    db.asistencia.filter(a=>a.alumnoId===alumno.id).forEach(a=>{ map[a.fecha]=a.estado; });
    return map;
  },[db.asistencia, alumno.id]);

  const faltas       = Object.values(registros).filter(e=>e==="ausente").length;
  const justificadas = Object.values(registros).filter(e=>e==="justificado").length;
  const presentes    = Object.values(registros).filter(e=>e==="presente").length;
  const totalReg     = Object.keys(registros).length;
  const pct          = totalReg ? Math.round((presentes/totalReg)*100) : 100;

  const prevMes = () => { if(mes===0){setMes(11);setAño(a=>a-1);}else setMes(m=>m-1); };
  const nextMes = () => { if(mes===11){setMes(0);setAño(a=>a+1);}else setMes(m=>m+1); };

  const hoyStr  = hoy.toISOString().slice(0,10);
  const inicioC = CICLO_INICIO.toISOString().slice(0,10);

  const handleDescargar = () => {
    generarPDFAlumno(alumno, grupo, maestro, db.asistencia, inicioC, hoyStr);
    toast.success("Abriendo reporte para imprimir / guardar como PDF…");
  };

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <div className="modal-title">📅 Historial de Asistencia</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:12,padding:12,background:"var(--bg-base)",borderRadius:10,marginBottom:16}}>
          <div className="av">{INITIALS(alumno.nombre)}</div>
          <div style={{flex:1}}>
            <div style={{fontWeight:700}}>{alumno.nombre}</div>
            <div className="small muted">Grupo {alumno.grupo}</div>
          </div>
          <button className="btn btn-sm btn-primary" onClick={handleDescargar}>
            📄 Descargar PDF
          </button>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
          {[
            {lbl:"Presentes",    val:presentes,    color:"#16a34a",bg:"#dcfce7"},
            {lbl:"Faltas",       val:faltas,       color:"#dc2626",bg:"#fee2e2"},
            {lbl:"Justificadas", val:justificadas, color:"#d97706",bg:"#fef9c3"},
            {lbl:"% Asistencia", val:pct+"%",      color:"#2563eb",bg:"#dbeafe"},
          ].map(({lbl,val,color,bg})=>(
            <div key={lbl} style={{background:bg,borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
              <div style={{fontSize:22,fontWeight:800,color}}>{val}</div>
              <div style={{fontSize:11,fontWeight:700,color}}>{lbl}</div>
            </div>
          ))}
        </div>

        <div style={{background:"var(--bg-base)",border:"1px solid var(--border)",borderRadius:10,padding:"10px 14px",marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
            <span style={{fontWeight:600}}>Ciclo 2026-2027 (SEP)</span>
            <span style={{color:"var(--text-muted)"}}>24-ago-2026 al 18-jun-2027 · ~{DIAS_HABILES_CICLO} días hábiles</span>
          </div>
          <div style={{background:"var(--border)",borderRadius:999,height:6,overflow:"hidden"}}>
            <div style={{width:`${Math.round(diasTranscurridos()/DIAS_HABILES_CICLO*100)}%`,
              background:"var(--accent)",height:"100%",borderRadius:999}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginTop:3,color:"var(--text-muted)"}}>
            <span>Transcurridos: {diasTranscurridos()} días</span>
            <span>Restantes: {DIAS_HABILES_CICLO - diasTranscurridos()} días</span>
          </div>
        </div>

        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <button className="btn btn-sm" onClick={prevMes}>‹ Anterior</button>
          <strong>{MESES_LARGO[mes]} {año}</strong>
          <button className="btn btn-sm" onClick={nextMes}>Siguiente ›</button>
        </div>

        <CalendarioMes año={año} mes={mes} registros={registros}/>

        <div className="form-actions">
          <button className="btn" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

/* ── VISTA PRINCIPAL ── */
function Asistencia() {
  const db   = useAppDB();
  const auth = useAuth();

  const today     = new Date().toISOString().slice(0,10);
  const [fecha,   setFecha]       = useState(today);
  const [histAlumno, setHistAlumno] = useState(null);
  const [modalDescarga, setModalDescarga] = useState(false);

  const [grupoId, setGrupoId] = useState(
    auth?.rol === "maestro" ? auth.grupo : (db.grupos[0]?.id || "")
  );

  const alumnosGrupo = useMemo(()=>
    db.alumnos.filter(a=>a.grupo===grupoId),
    [db.alumnos, grupoId]
  );

  const getEstado = useCallback((alumnoId)=>{
    const reg = db.asistencia.find(a=>a.alumnoId===alumnoId && a.fecha===fecha);
    return reg?.estado || "presente";
  },[db.asistencia, fecha]);

  const toggleEstado = useCallback((alumnoId)=>{
    const actual    = getEstado(alumnoId);
    const siguiente = ESTADOS[(ESTADOS.indexOf(actual)+1)%ESTADOS.length];
    const maestroId = db.grupos.find(g=>g.id===grupoId)?.maestroId || "";
    db.guardarAsistencia(alumnoId, fecha, siguiente, maestroId);
  },[getEstado, db, grupoId, fecha]);

  const guardarTodo = () => toast.success(`Asistencia del ${fecha} guardada correctamente`);

  const marcarTodos = (estado) => {
    const maestroId = db.grupos.find(g=>g.id===grupoId)?.maestroId || "";
    alumnosGrupo.forEach(a => db.guardarAsistencia(a.id, fecha, estado, maestroId));
    toast.success(`Todos marcados como ${ESTADO_LABEL[estado].toLowerCase()}`);
  };

  const asistHoy     = db.asistencia.filter(a=>a.fecha===fecha&&alumnosGrupo.some(al=>al.id===a.alumnoId));
  const presentes    = asistHoy.filter(a=>a.estado==="presente").length;
  const ausentes     = asistHoy.filter(a=>a.estado==="ausente").length;
  const justificados = asistHoy.filter(a=>a.estado==="justificado").length;
  const pctHoy       = alumnosGrupo.length ? Math.round((presentes/alumnosGrupo.length)*100) : 0;
  const pctCiclo     = Math.round(diasTranscurridos()/DIAS_HABILES_CICLO*100);

  const grupo   = db.grupos.find(g=>g.id===grupoId);
  const maestro = grupo ? db.maestros.find(m=>m.id===grupo.maestroId) : null;

  return (
    <Layout title="Control de Asistencia">
      <div className="card mb-24">
        <div className="card-header">
          <div className="card-title">📋 Pase de Lista</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
            {auth?.rol !== "maestro" && (
              <select className="form-control" style={{width:140}} value={grupoId}
                onChange={e=>setGrupoId(e.target.value)}>
                {db.grupos.map(g=><option key={g.id} value={g.id}>{g.nombre}</option>)}
              </select>
            )}
            {auth?.rol === "maestro" && (
              <span className="badge badge-info" style={{fontSize:14,padding:"6px 14px"}}>
                {grupo?.nombre || grupoId}
              </span>
            )}
            <input type="date" className="form-control" style={{width:160}}
              value={fecha} onChange={e=>setFecha(e.target.value)} max={today}/>
            <button className="btn btn-sm btn-primary" onClick={()=>setModalDescarga(true)}>
              📄 Generar PDF
            </button>
          </div>
        </div>

        {maestro && (
          <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:14,padding:"8px 12px",
            background:"var(--bg-base)",borderRadius:8,fontSize:13}}>
            <div className="av" style={{width:28,height:28,fontSize:11}}>{INITIALS(maestro.nombre)}</div>
            <span><strong>Titular:</strong> {maestro.nombre}</span>
            <span className="muted">·</span>
            <span><strong>Salón:</strong> {grupo?.salon}</span>
            <span className="muted">·</span>
            <span><strong>Turno:</strong> Vespertino</span>
          </div>
        )}

        <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
          {[
            {lbl:"PRESENTES",    val:presentes,     color:"#16a34a",bg:"#f0fdf4",border:"#86efac"},
            {lbl:"AUSENTES",     val:ausentes,      color:"#dc2626",bg:"#fef2f2",border:"#fca5a5"},
            {lbl:"JUSTIFICADOS", val:justificados,  color:"#d97706",bg:"#fffbeb",border:"#fcd34d"},
            {lbl:"ASISTENCIA",   val:pctHoy+"%",    color:"#2563eb",bg:"#eff6ff",border:"#93c5fd"},
          ].map(({lbl,val,color,bg,border})=>(
            <div key={lbl} style={{flex:1,minWidth:80,background:bg,border:`1px solid ${border}`,
              borderRadius:10,padding:"10px 14px",textAlign:"center"}}>
              <div style={{fontSize:24,fontWeight:800,color}}>{val}</div>
              <div style={{fontSize:10,fontWeight:700,color}}>{lbl}</div>
            </div>
          ))}
        </div>

        <div style={{background:"var(--bg-base)",border:"1px solid var(--border)",
          borderRadius:10,padding:"10px 14px",marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
            <strong>Ciclo escolar 2026-2027 (SEP México)</strong>
            <span style={{color:"var(--text-muted)"}}>24-ago-2026 · 18-jun-2027 · {DIAS_HABILES_CICLO} días hábiles</span>
          </div>
          <div style={{background:"var(--border)",borderRadius:999,height:8,overflow:"hidden"}}>
            <div style={{width:`${pctCiclo}%`,background:"linear-gradient(90deg,var(--accent),#7c3aed)",
              height:"100%",borderRadius:999,transition:"width .5s"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginTop:3,color:"var(--text-muted)"}}>
            <span>Días transcurridos: <strong>{diasTranscurridos()}</strong></span>
            <span>{pctCiclo}% del ciclo</span>
            <span>Días restantes: <strong>{DIAS_HABILES_CICLO - diasTranscurridos()}</strong></span>
          </div>
        </div>

        <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
          <button className="btn btn-sm btn-success" onClick={()=>marcarTodos("presente")}>✅ Todos presentes</button>
          <button className="btn btn-sm btn-danger"  onClick={()=>marcarTodos("ausente")}>❌ Todos ausentes</button>
          <button className="btn btn-sm"             onClick={()=>marcarTodos("justificado")}>📋 Todos justificados</button>
          <button className="btn btn-sm btn-primary" style={{marginLeft:"auto"}} onClick={guardarTodo}>💾 Confirmar pase de lista</button>
        </div>

        {alumnosGrupo.length===0
          ? <div className="empty-state"><div className="empty-icon">👥</div><div className="empty-title">No hay alumnos en este grupo</div></div>
          : (
            <div className="asistencia-grid">
              {alumnosGrupo.map(a=>{
                const estado = getEstado(a.id);
                return (
                  <div key={a.id} className={`asistencia-card ${estado}`}>
                    <div className="av">{INITIALS(a.nombre)}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:600,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        {a.nombre.split(" ").slice(0,2).join(" ")}
                      </div>
                      <div className="small" style={{color:ESTADO_COLOR[estado],fontWeight:600}}>
                        {ESTADO_LABEL[estado]}
                      </div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end"}}>
                      <div onClick={()=>toggleEstado(a.id)}
                        style={{cursor:"pointer",fontSize:22,userSelect:"none"}}
                        title="Clic para cambiar estado">
                        {ESTADO_ICON[estado]}
                      </div>
                      <button className="btn btn-sm" style={{fontSize:10,padding:"2px 6px"}}
                        onClick={()=>setHistAlumno(a)} title="Ver historial">
                        📅
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        }
      </div>

      {histAlumno && (
        <ModalHistorial alumno={histAlumno} grupo={grupo} db={db} onClose={()=>setHistAlumno(null)}/>
      )}

      {modalDescarga && (
        <ModalDescarga grupoId={grupoId} alumnos={alumnosGrupo} db={db} onClose={()=>setModalDescarga(false)}/>
      )}
    </Layout>
  );
}

export default Asistencia;
