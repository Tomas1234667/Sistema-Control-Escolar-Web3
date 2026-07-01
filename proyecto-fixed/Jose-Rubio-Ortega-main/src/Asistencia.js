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
const MESES_LARGO = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const MESES_CORTO = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

function diasTranscurridos() {
  const hoy = new Date();
  const fin  = hoy < CICLO_FIN ? hoy : CICLO_FIN;
  if (fin < CICLO_INICIO) return 0;
  return Math.min(Math.round(Math.floor((fin-CICLO_INICIO)/(1000*60*60*24))*0.7), DIAS_HABILES_CICLO);
}

const padZ = n => String(n).padStart(2,"0");
const fmt  = (y,m,d) => `${y}-${padZ(m+1)}-${padZ(d)}`;

/* ════════════════════════════════════
   CSS COMPARTIDO PDFs
════════════════════════════════════ */
const PDF_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Plus Jakarta Sans',Arial,sans-serif;color:#1e293b;background:#fff;padding:20px;font-size:11px}
  .hdr{display:flex;align-items:center;gap:16px;border-bottom:4px solid #1e3a5f;padding-bottom:12px;margin-bottom:14px}
  .esc{width:50px;height:50px;background:linear-gradient(135deg,#1e3a5f,#2563eb);border-radius:12px;
    display:flex;align-items:center;justify-content:center;font-size:24px;color:#fff;flex-shrink:0}
  .ei h1{font-size:15px;font-weight:800;color:#1e3a5f}
  .ei p{font-size:9px;color:#64748b;margin-top:2px}
  .badge{padding:3px 11px;border-radius:16px;font-size:9px;font-weight:700;white-space:nowrap}
  h2{font-size:10px;font-weight:700;color:#1e3a5f;border-left:3px solid #1e3a5f;padding-left:7px;
    text-transform:uppercase;letter-spacing:.5px;margin:12px 0 6px}
  .info4{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:12px}
  .info2{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px}
  .field{padding:5px 9px;background:#f1f5f9;border-radius:6px}
  .field label{font-size:8px;font-weight:700;color:#64748b;text-transform:uppercase}
  .field span{display:block;font-weight:700;font-size:11px;margin-top:2px}
  .stats{display:grid;gap:7px;margin-bottom:12px}
  .sc{padding:8px;border-radius:7px;text-align:center;border:1px solid}
  .sc .n{font-size:19px;font-weight:800}
  .sc .l{font-size:8px;font-weight:700;margin-top:1px}
  table{width:100%;border-collapse:collapse;font-size:10px;margin-bottom:12px}
  th{background:#1e3a5f;color:#e2e8f0;padding:6px 8px;text-align:left;font-size:9px;font-weight:700}
  th:not(:first-child){text-align:center}
  td{padding:5px 8px;border-bottom:1px solid #e2e8f0}
  tr:nth-child(even) td{background:#f8fafc}
  .firma-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:28px;margin-top:20px}
  .firma{text-align:center;border-top:1px solid #334155;padding-top:5px;font-size:9px;color:#475569;margin-top:26px}
  .footer{margin-top:12px;text-align:center;font-size:8px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:7px}
  .P{background:#dcfce7;color:#15803d;font-weight:800;text-align:center}
  .A{background:#fee2e2;color:#b91c1c;font-weight:800;text-align:center}
  .J{background:#fef9c3;color:#92400e;font-weight:800;text-align:center}
  .SR{background:#f9fafb;color:#9ca3af;text-align:center}
`;

const hdrHTML = (titulo, subtitulo, fechaHoy) => `
<div class="hdr">
  <div class="esc">🏫</div>
  <div class="ei">
    <h1>Escuela Primaria EduGestión</h1>
    <p>Ciudad Juárez, Chihuahua · Turno Vespertino · Ciclo 2026-2027</p>
    <p>Documento generado el ${fechaHoy}</p>
  </div>
  <div style="margin-left:auto;display:flex;flex-direction:column;gap:4px;align-items:flex-end">
    <span class="badge" style="background:#1e3a5f;color:#fff">${titulo}</span>
    <span class="badge" style="background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe">${subtitulo}</span>
  </div>
</div>`;

const abrirVentana = (html, ancho=1100, alto=800) => {
  const win = window.open("", "_blank", `width=${ancho},height=${alto}`);
  win.document.write(html);
  win.document.close();
};

/* ════════════════════════════════════
   HELPERS — obtener rango de fechas para una semana
   Dado cualquier día, devuelve [lunes, domingo] de esa semana
════════════════════════════════════ */
function semanaDeF(fecha) {
  const d = new Date(fecha + "T12:00:00");
  const dow = d.getDay(); // 0=dom
  const lunes = new Date(d);
  lunes.setDate(d.getDate() - (dow===0?6:dow-1));
  const domingo = new Date(lunes);
  domingo.setDate(lunes.getDate()+6);
  return [lunes.toISOString().slice(0,10), domingo.toISOString().slice(0,10)];
}

function fechasEnRango(inicio, fin) {
  const arr = [];
  const d = new Date(inicio+"T12:00:00");
  const f = new Date(fin+"T12:00:00");
  while (d <= f) { arr.push(d.toISOString().slice(0,10)); d.setDate(d.getDate()+1); }
  return arr;
}

function fmtFechaLarga(f) {
  const [y,m,d] = f.split("-");
  const dias = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
  return `${dias[new Date(f+"T12:00:00").getDay()]} ${parseInt(d)} de ${MESES_LARGO[parseInt(m)-1]} de ${y}`;
}

function fmtFechaCorta(f) {
  const [y,m,d] = f.split("-");
  return `${parseInt(d)} ${MESES_CORTO[parseInt(m)-1]} ${y}`;
}

/* ════════════════════════════════════
   PDF — ASISTENCIA POR DÍA
   Grupo o individual para una fecha específica.
════════════════════════════════════ */
function generarPDFDia(modo, fecha, grupo, maestro, alumnos, todasAsistencias, alumnoIndividual=null) {
  const fechaHoy = new Date().toLocaleDateString("es-MX",{year:"numeric",month:"long",day:"numeric"});
  const fechaStr = fmtFechaLarga(fecha);

  const getEst = (alumnoId) => {
    const r = todasAsistencias.find(a=>a.alumnoId===alumnoId && a.fecha===fecha);
    return r?.estado || null;
  };

  const LCLASS = {presente:"P",ausente:"A",justificado:"J",null:"SR"};
  const LTXT   = {presente:"Presente",ausente:"Ausente",justificado:"Justificado",null:"Sin registro"};

  if (modo==="alumno" && alumnoIndividual) {
    const est = getEst(alumnoIndividual.id);
    const clr = est ? ESTADO_COLOR[est] : "#94a3b8";
    const bg  = est==="presente"?"#f0fdf4":est==="ausente"?"#fef2f2":est==="justificado"?"#fffbeb":"#f8fafc";

    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/>
<title>Asistencia ${fecha} — ${alumnoIndividual.nombre}</title>
<style>${PDF_CSS}@media print{body{padding:12px}button{display:none!important}@page{size:portrait;margin:1.5cm}}</style></head><body>
${hdrHTML("👤 Asistencia Individual — Un Día", fechaStr, fechaHoy)}
<div class="info2">
  <div class="field"><label>Alumno</label><span>${alumnoIndividual.nombre}</span></div>
  <div class="field"><label>Grupo</label><span>${grupo?.nombre||alumnoIndividual.grupo}</span></div>
  <div class="field"><label>Maestro titular</label><span>${maestro?.nombre||"—"}</span></div>
  <div class="field"><label>Fecha</label><span>${fmtFechaCorta(fecha)}</span></div>
</div>
<div style="margin:20px 0;padding:24px;background:${bg};border-radius:12px;text-align:center;border:2px solid ${clr}22">
  <div style="font-size:48px;margin-bottom:8px">${est==="presente"?"✅":est==="ausente"?"❌":est==="justificado"?"📋":"❓"}</div>
  <div style="font-size:22px;font-weight:800;color:${clr}">${LTXT[est]}</div>
  <div style="font-size:12px;color:#64748b;margin-top:4px">${fechaStr}</div>
</div>
<div class="firma-row">
  <div class="firma"><strong>${maestro?.nombre||"_______________"}</strong><br>Maestro Titular</div>
  <div class="firma"><strong>Ma. Norma Alvarez</strong><br>Director(a)</div>
  <div class="firma"><strong>_______________</strong><br>Firma del Tutor</div>
</div>
<div class="footer">EduGestión · Sistema de Control Escolar · Ciudad Juárez, Chihuahua · ${fechaHoy}</div>
<script>window.onload=()=>window.print();</script>
</body></html>`;
    abrirVentana(html, 700, 600);
    return;
  }

  /* Modo grupo */
  let pres=0,aus=0,just=0,sr=0;
  const filasHTML = alumnos.map((al,i)=>{
    const est = getEst(al.id);
    const cls = LCLASS[est];
    if(est==="presente")pres++; else if(est==="ausente")aus++; else if(est==="justificado")just++; else sr++;
    const bg = i%2===0?"#fff":"#f8fafc";
    return `<tr style="background:${bg}">
      <td style="font-weight:600">${i+1}. ${al.nombre}</td>
      <td class="${cls}">${LTXT[est]}</td>
    </tr>`;
  }).join("");
  const total = alumnos.length;
  const pct = total>0?Math.round((pres/total)*100):0;

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/>
<title>Asistencia ${fecha} — ${grupo?.nombre}</title>
<style>${PDF_CSS}@media print{body{padding:12px}button{display:none!important}@page{size:portrait;margin:1cm}}</style></head><body>
${hdrHTML("👥 Asistencia del Grupo — Un Día", fechaStr, fechaHoy)}
<div class="info4">
  <div class="field"><label>Grupo</label><span>${grupo?.nombre||"—"}</span></div>
  <div class="field"><label>Maestro titular</label><span>${maestro?.nombre||"—"}</span></div>
  <div class="field"><label>Fecha</label><span>${fmtFechaCorta(fecha)}</span></div>
  <div class="field"><label>Total alumnos</label><span>${total}</span></div>
</div>
<div class="stats" style="grid-template-columns:repeat(5,1fr)">
  <div class="sc" style="background:#f0fdf4;border-color:#86efac"><div class="n" style="color:#15803d">${pres}</div><div class="l" style="color:#15803d">PRESENTES</div></div>
  <div class="sc" style="background:#fef2f2;border-color:#fca5a5"><div class="n" style="color:#b91c1c">${aus}</div><div class="l" style="color:#b91c1c">AUSENTES</div></div>
  <div class="sc" style="background:#fefce8;border-color:#fde047"><div class="n" style="color:#92400e">${just}</div><div class="l" style="color:#92400e">JUSTIFICADOS</div></div>
  <div class="sc" style="background:#f8fafc;border-color:#e2e8f0"><div class="n" style="color:#64748b">${sr}</div><div class="l" style="color:#64748b">SIN REGISTRO</div></div>
  <div class="sc" style="background:${pct>=90?"#f0fdf4":pct>=75?"#fefce8":"#fef2f2"};border-color:${pct>=90?"#86efac":pct>=75?"#fde047":"#fca5a5"}">
    <div class="n" style="color:${pct>=90?"#15803d":pct>=75?"#92400e":"#b91c1c"}">${pct}%</div>
    <div class="l" style="color:${pct>=90?"#15803d":pct>=75?"#92400e":"#b91c1c"}">ASISTENCIA</div>
  </div>
</div>
<h2>Lista de Asistencia</h2>
<table>
  <thead><tr><th>Alumno</th><th style="text-align:center">Estado</th></tr></thead>
  <tbody>${filasHTML}</tbody>
</table>
<div class="firma-row">
  <div class="firma"><strong>${maestro?.nombre||"_______________"}</strong><br>Maestro Titular</div>
  <div class="firma"><strong>Ma. Norma Alvarez</strong><br>Director(a)</div>
  <div class="firma"><strong>_______________</strong><br>Sello Institucional</div>
</div>
<div class="footer">EduGestión · Sistema de Control Escolar · Ciudad Juárez, Chihuahua · ${fechaHoy}</div>
<script>window.onload=()=>window.print();</script>
</body></html>`;
  abrirVentana(html, 800, 700);
}

/* ════════════════════════════════════
   PDF — ASISTENCIA POR SEMANA
   Tabla: alumnos en filas, días de la semana (Lun–Dom) en columnas.
════════════════════════════════════ */
function generarPDFSemana(modo, fechaRef, grupo, maestro, alumnos, todasAsistencias, alumnoIndividual=null) {
  const [lunes, domingo] = semanaDeF(fechaRef);
  const fechas = fechasEnRango(lunes, domingo);
  const fechaHoy = new Date().toLocaleDateString("es-MX",{year:"numeric",month:"long",day:"numeric"});

  const tituloRango = `${fmtFechaCorta(lunes)} — ${fmtFechaCorta(domingo)}`;
  const DIAS_NOMBRES = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];

  const LCLASS = {presente:"P",ausente:"A",justificado:"J"};
  const LTXT   = {presente:"P",ausente:"A",justificado:"J"};

  const regMap = (alumnoId) => {
    const m = {};
    todasAsistencias.filter(a=>a.alumnoId===alumnoId).forEach(a=>{ m[a.fecha]=a.estado; });
    return m;
  };

  const stats = (reg) => {
    let p=0,a=0,j=0;
    fechas.forEach(f=>{ if(reg[f]==="presente")p++; else if(reg[f]==="ausente")a++; else if(reg[f]==="justificado")j++; });
    return {p,a,j,total:p+a+j,pct:fechas.length>0?Math.round((p/fechas.length)*100):0};
  };

  if (modo==="alumno" && alumnoIndividual) {
    const reg = regMap(alumnoIndividual.id);
    const s   = stats(reg);

    const filasHTML = fechas.map((f,i) => {
      const est = reg[f];
      const bg  = i%2===0?"#fff":"#f8fafc";
      const DIAS_DOW = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
      const dow = DIAS_DOW[new Date(f+"T12:00:00").getDay()];
      const esFS = dow==="Sábado"||dow==="Domingo";
      return `<tr style="background:${esFS?"#f1f5f9":bg}">
        <td style="font-weight:600;color:${esFS?"#94a3b8":"inherit"}">${dow}</td>
        <td style="color:#64748b">${fmtFechaCorta(f)}</td>
        <td class="${est?LCLASS[est]:"SR"}" style="text-align:center">${est?ESTADO_LABEL[est]:"Sin registro"}</td>
      </tr>`;
    }).join("");

    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/>
<title>Asistencia Semana ${lunes} — ${alumnoIndividual.nombre}</title>
<style>${PDF_CSS}@media print{body{padding:12px}button{display:none!important}@page{size:portrait;margin:1cm}}</style></head><body>
${hdrHTML("👤 Asistencia Individual — Por Semana", tituloRango, fechaHoy)}
<div class="info2">
  <div class="field"><label>Alumno</label><span>${alumnoIndividual.nombre}</span></div>
  <div class="field"><label>Grupo</label><span>${grupo?.nombre||alumnoIndividual.grupo}</span></div>
  <div class="field"><label>Maestro titular</label><span>${maestro?.nombre||"—"}</span></div>
  <div class="field"><label>Semana</label><span>${tituloRango}</span></div>
</div>
<div class="stats" style="grid-template-columns:repeat(4,1fr)">
  <div class="sc" style="background:#f0fdf4;border-color:#86efac"><div class="n" style="color:#15803d">${s.p}</div><div class="l" style="color:#15803d">PRESENTES</div></div>
  <div class="sc" style="background:#fef2f2;border-color:#fca5a5"><div class="n" style="color:#b91c1c">${s.a}</div><div class="l" style="color:#b91c1c">AUSENTES</div></div>
  <div class="sc" style="background:#fefce8;border-color:#fde047"><div class="n" style="color:#92400e">${s.j}</div><div class="l" style="color:#92400e">JUSTIFICADOS</div></div>
  <div class="sc" style="background:#eff6ff;border-color:#93c5fd"><div class="n" style="color:#1d4ed8">${s.pct}%</div><div class="l" style="color:#1d4ed8">ASISTENCIA</div></div>
</div>
<h2>Detalle por Día</h2>
<table>
  <thead><tr><th>Día</th><th>Fecha</th><th style="text-align:center">Estado</th></tr></thead>
  <tbody>${filasHTML}</tbody>
</table>
<div class="firma-row">
  <div class="firma"><strong>${maestro?.nombre||"_______________"}</strong><br>Maestro Titular</div>
  <div class="firma"><strong>Ma. Norma Alvarez</strong><br>Director(a)</div>
  <div class="firma"><strong>_______________</strong><br>Firma del Tutor</div>
</div>
<div class="footer">EduGestión · Sistema de Control Escolar · Ciudad Juárez, Chihuahua · ${fechaHoy}</div>
<script>window.onload=()=>window.print();</script>
</body></html>`;
    abrirVentana(html, 800, 700);
    return;
  }

  /* Modo grupo — tabla cruzada alumnos × días */
  const thDias = fechas.map((f,i) => {
    const dow = new Date(f+"T12:00:00").getDay();
    const esFS = dow===0||dow===6;
    return `<th style="text-align:center;background:${esFS?"#374151":"#1e3a5f"};font-size:9px;min-width:30px">
      ${DIAS_NOMBRES[i==="undefined"?i:i]}<br><span style="font-weight:400;opacity:.8">${fmtFechaCorta(f)}</span>
    </th>`;
  }).join("");

  let gpres=0,gaus=0,gjust=0;
  const filasHTML = alumnos.map((al,i) => {
    const reg = regMap(al.id);
    const s   = stats(reg);
    gpres+=s.p; gaus+=s.a; gjust+=s.j;
    const bg = i%2===0?"#fff":"#f8fafc";
    const celdas = fechas.map(f => {
      const est = reg[f];
      const cls = est?LCLASS[est]:"SR";
      return `<td class="${cls}" style="min-width:30px">${est?LTXT[est]:"·"}</td>`;
    }).join("");
    const pctCol = s.total>0?Math.round((s.p/s.total)*100):null;
    const pctClr = pctCol===null?"#94a3b8":pctCol>=90?"#15803d":pctCol>=75?"#92400e":"#b91c1c";
    return `<tr style="background:${bg}">
      <td style="font-weight:600;white-space:nowrap">${i+1}. ${al.nombre}</td>
      ${celdas}
      <td style="text-align:center;color:#15803d;font-weight:700">${s.p}</td>
      <td style="text-align:center;color:#b91c1c;font-weight:700">${s.a}</td>
      <td style="text-align:center;color:#92400e;font-weight:700">${s.j}</td>
      <td style="text-align:center;font-weight:800;color:${pctClr}">${pctCol!==null?pctCol+"%":"—"}</td>
    </tr>`;
  }).join("");

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/>
<title>Asistencia Semana ${lunes} — ${grupo?.nombre}</title>
<style>${PDF_CSS}
.tabla-wrap{overflow-x:auto}
@media print{body{padding:12px}button{display:none!important}@page{size:landscape;margin:.8cm}}</style></head><body>
${hdrHTML("👥 Asistencia del Grupo — Por Semana", tituloRango, fechaHoy)}
<div class="info4">
  <div class="field"><label>Grupo</label><span>${grupo?.nombre||"—"}</span></div>
  <div class="field"><label>Maestro titular</label><span>${maestro?.nombre||"—"}</span></div>
  <div class="field"><label>Semana</label><span>${tituloRango}</span></div>
  <div class="field"><label>Total alumnos</label><span>${alumnos.length}</span></div>
</div>
<div class="stats" style="grid-template-columns:repeat(4,1fr)">
  <div class="sc" style="background:#f0fdf4;border-color:#86efac"><div class="n" style="color:#15803d">${gpres}</div><div class="l" style="color:#15803d">PRESENCIAS TOTALES</div></div>
  <div class="sc" style="background:#fef2f2;border-color:#fca5a5"><div class="n" style="color:#b91c1c">${gaus}</div><div class="l" style="color:#b91c1c">AUSENCIAS TOTALES</div></div>
  <div class="sc" style="background:#fefce8;border-color:#fde047"><div class="n" style="color:#92400e">${gjust}</div><div class="l" style="color:#92400e">JUSTIFICADAS</div></div>
  <div class="sc" style="background:#eff6ff;border-color:#93c5fd"><div class="n" style="color:#1d4ed8">${fechas.length}</div><div class="l" style="color:#1d4ed8">DÍAS EN SEMANA</div></div>
</div>
<div class="tabla-wrap">
<table>
  <thead>
    <tr>
      <th style="min-width:140px">Alumno</th>
      ${thDias}
      <th style="text-align:center;background:#166534;min-width:24px">P</th>
      <th style="text-align:center;background:#991b1b;min-width:24px">A</th>
      <th style="text-align:center;background:#78350f;min-width:24px">J</th>
      <th style="text-align:center;background:#0f2744;min-width:30px">%</th>
    </tr>
  </thead>
  <tbody>${filasHTML}</tbody>
</table>
</div>
<div style="display:flex;gap:12px;margin-top:8px;font-size:9px;flex-wrap:wrap">
  <span><span style="background:#dcfce7;color:#15803d;padding:1px 6px;border-radius:4px;font-weight:700">P</span> Presente</span>
  <span><span style="background:#fee2e2;color:#b91c1c;padding:1px 6px;border-radius:4px;font-weight:700">A</span> Ausente</span>
  <span><span style="background:#fef9c3;color:#92400e;padding:1px 6px;border-radius:4px;font-weight:700">J</span> Justificado</span>
  <span><span style="background:#f9fafb;color:#9ca3af;padding:1px 6px;border-radius:4px;font-weight:700">·</span> Sin registro</span>
</div>
<div class="firma-row">
  <div class="firma"><strong>${maestro?.nombre||"_______________"}</strong><br>Maestro Titular</div>
  <div class="firma"><strong>Ma. Norma Alvarez</strong><br>Director(a)</div>
  <div class="firma"><strong>_______________</strong><br>Sello Institucional</div>
</div>
<div class="footer">EduGestión · Sistema de Control Escolar · Ciudad Juárez, Chihuahua · ${fechaHoy}</div>
<script>window.onload=()=>window.print();</script>
</body></html>`;
  abrirVentana(html, 1100, 800);
}

/* ════════════════════════════════════
   PDF — ASISTENCIA POR PERIODO (ya existía, mejorado)
════════════════════════════════════ */
function generarPDFGrupo(grupo, maestro, alumnos, todasAsistencias, fechaInicio, fechaFin) {
  const inicio = new Date(fechaInicio+"T12:00:00");
  const fin    = new Date(fechaFin+"T12:00:00");
  const fechaHoy = new Date().toLocaleDateString("es-MX",{year:"numeric",month:"long",day:"numeric"});

  const fechas = fechasEnRango(fechaInicio, fechaFin);

  const meses = [];
  fechas.forEach(f => {
    const [y,m] = f.split("-");
    const key = `${y}-${m}`;
    if (!meses.length || meses[meses.length-1].key!==key)
      meses.push({key,label:`${MESES_CORTO[parseInt(m)-1]} ${y}`,count:1});
    else meses[meses.length-1].count++;
  });

  const mapaAsist = {};
  alumnos.forEach(al => {
    mapaAsist[al.id]={};
    todasAsistencias.filter(a=>a.alumnoId===al.id).forEach(a=>{ mapaAsist[al.id][a.fecha]=a.estado; });
  });

  const statsAl = (id) => {
    let p=0,a=0,j=0,t=0;
    fechas.forEach(f=>{ const e=mapaAsist[id]?.[f]; if(e){t++;if(e==="presente")p++;else if(e==="ausente")a++;else if(e==="justificado")j++;} });
    return {p,a,j,t,pct:t>0?Math.round((p/t)*100):null};
  };

  let gp=0,ga=0,gj=0,gt=0;
  alumnos.forEach(al=>{const s=statsAl(al.id);gp+=s.p;ga+=s.a;gj+=s.j;gt+=s.t;});
  const gpct = gt>0?Math.round((gp/gt)*100):null;

  const thMeses = meses.map(m=>`<th colspan="${m.count}" style="background:#1e3a5f;color:#fff;text-align:center;font-size:9px;font-weight:700;border-right:1px solid #2d5a8e">${m.label}</th>`).join("");
  const thDias  = fechas.map(f=>{
    const dow=new Date(f+"T12:00:00").getDay();
    const fs=dow===0||dow===6;
    return `<th style="background:${fs?"#374151":"#2c4a6e"};color:${fs?"#9ca3af":"#e2e8f0"};text-align:center;font-size:8px;min-width:16px;padding:3px 1px">${parseInt(f.split("-")[2])}</th>`;
  }).join("");

  const filasHTML = alumnos.map((al,i)=>{
    const s=statsAl(al.id);
    const bg=i%2===0?"#fff":"#f8fafc";
    const pctClr=s.pct===null?"#94a3b8":s.pct>=90?"#15803d":s.pct>=75?"#92400e":"#b91c1c";
    const celdas=fechas.map(f=>{
      const e=mapaAsist[al.id]?.[f];
      const cls=e==="presente"?"P":e==="ausente"?"A":e==="justificado"?"J":"SR";
      return `<td class="${cls}" style="font-size:8px;padding:2px 1px">${e==="presente"?"P":e==="ausente"?"A":e==="justificado"?"J":"·"}</td>`;
    }).join("");
    return `<tr style="background:${bg}">
      <td style="font-weight:600;font-size:9px;white-space:nowrap;border-right:2px solid #e2e8f0">${i+1}. ${al.nombre}</td>
      ${celdas}
      <td style="text-align:center;color:#15803d;font-weight:700">${s.p}</td>
      <td style="text-align:center;color:#b91c1c;font-weight:700">${s.a}</td>
      <td style="text-align:center;color:#92400e;font-weight:700">${s.j}</td>
      <td style="text-align:center;font-weight:800;color:${pctClr};border-left:2px solid #e2e8f0">${s.pct!==null?s.pct+"%":"—"}</td>
    </tr>`;
  }).join("");

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/>
<title>Asistencia ${grupo?.nombre} ${fechaInicio} al ${fechaFin}</title>
<style>${PDF_CSS}
table{font-size:9px}
.tabla-wrap{border-radius:8px;border:1px solid #e2e8f0;overflow:hidden}
@media print{body{padding:10px}button{display:none!important}@page{size:landscape;margin:.8cm}}</style></head><body>
${hdrHTML("👥 Reporte de Asistencia — Grupo", `${fmtFechaCorta(fechaInicio)} al ${fmtFechaCorta(fechaFin)}`, fechaHoy)}
<div class="info4">
  <div class="field"><label>Grupo</label><span>${grupo?.nombre||"—"}</span></div>
  <div class="field"><label>Maestro titular</label><span>${maestro?.nombre||"—"}</span></div>
  <div class="field"><label>Total alumnos</label><span>${alumnos.length}</span></div>
  <div class="field"><label>Días en el periodo</label><span>${fechas.length}</span></div>
</div>
<div class="stats" style="grid-template-columns:repeat(5,1fr)">
  <div class="sc" style="background:#f0fdf4;border-color:#86efac"><div class="n" style="color:#15803d">${gp}</div><div class="l" style="color:#15803d">PRESENCIAS</div></div>
  <div class="sc" style="background:#fef2f2;border-color:#fca5a5"><div class="n" style="color:#b91c1c">${ga}</div><div class="l" style="color:#b91c1c">AUSENCIAS</div></div>
  <div class="sc" style="background:#fefce8;border-color:#fde047"><div class="n" style="color:#92400e">${gj}</div><div class="l" style="color:#92400e">JUSTIFICADAS</div></div>
  <div class="sc" style="background:#eff6ff;border-color:#93c5fd"><div class="n" style="color:#1d4ed8">${gt}</div><div class="l" style="color:#1d4ed8">REGISTROS</div></div>
  <div class="sc" style="background:${gpct>=90?"#f0fdf4":gpct>=75?"#fefce8":"#fef2f2"};border-color:${gpct>=90?"#86efac":gpct>=75?"#fde047":"#fca5a5"}">
    <div class="n" style="color:${gpct>=90?"#15803d":gpct>=75?"#92400e":"#b91c1c"}">${gpct!==null?gpct+"%":"—"}</div>
    <div class="l" style="color:${gpct>=90?"#15803d":gpct>=75?"#92400e":"#b91c1c"}">% ASISTENCIA</div>
  </div>
</div>
<div class="tabla-wrap">
<table style="border-collapse:collapse;width:100%">
  <thead>
    <tr><th rowspan="2" style="background:#0f2744;color:#fff;font-size:9px;min-width:130px">ALUMNO</th>${thMeses}
      <th colspan="3" style="background:#1e3a5f;color:#fff;text-align:center;font-size:9px">RESUMEN</th>
      <th rowspan="2" style="background:#0f2744;color:#e2e8f0;text-align:center;font-size:9px;min-width:30px">%</th>
    </tr>
    <tr>${thDias}
      <th style="background:#166534;color:#dcfce7;text-align:center;font-size:8px;min-width:20px">P</th>
      <th style="background:#991b1b;color:#fee2e2;text-align:center;font-size:8px;min-width:20px">A</th>
      <th style="background:#78350f;color:#fef9c3;text-align:center;font-size:8px;min-width:20px">J</th>
    </tr>
  </thead>
  <tbody>${filasHTML}</tbody>
</table>
</div>
<div style="display:flex;gap:12px;margin-top:8px;font-size:9px">
  <span style="font-weight:700;color:#475569">Leyenda:</span>
  <span><b style="color:#15803d">P</b>=Presente</span>
  <span><b style="color:#b91c1c">A</b>=Ausente</span>
  <span><b style="color:#92400e">J</b>=Justificado</span>
  <span style="color:#9ca3af">·=Sin registro</span>
</div>
<div class="firma-row">
  <div class="firma"><strong>${maestro?.nombre||"_______________"}</strong><br>Maestro Titular</div>
  <div class="firma"><strong>Ma. Norma Alvarez</strong><br>Director(a)</div>
  <div class="firma"><strong>_______________</strong><br>Sello Institucional</div>
</div>
<div class="footer">EduGestión · Sistema de Control Escolar · Ciudad Juárez, Chihuahua · ${fechaHoy}</div>
<script>window.onload=()=>window.print();</script>
</body></html>`;
  abrirVentana(html,1200,800);
}

function generarPDFAlumno(alumno, grupo, maestro, asistencias, fechaInicio, fechaFin) {
  const fechaHoy = new Date().toLocaleDateString("es-MX",{year:"numeric",month:"long",day:"numeric"});
  const reg = {};
  asistencias.filter(a=>a.alumnoId===alumno.id).forEach(a=>{ reg[a.fecha]=a.estado; });

  let p=0,a=0,j=0,t=0;
  const fechas = fechasEnRango(fechaInicio, fechaFin);
  fechas.forEach(f=>{ const e=reg[f]; if(e){t++;if(e==="presente")p++;else if(e==="ausente")a++;else if(e==="justificado")j++;} });
  const pct=t>0?Math.round((p/t)*100):null;
  const pctClr=pct===null?"#94a3b8":pct>=90?"#15803d":pct>=75?"#92400e":"#b91c1c";

  /* Calendarios por mes */
  const porMes = {};
  fechas.forEach(f=>{
    const [y,m]=f.split("-"); const key=`${y}-${m}`;
    if(!porMes[key]) porMes[key]={año:parseInt(y),mes:parseInt(m)-1,dias:[]};
    porMes[key].dias.push({f,d:parseInt(f.split("-")[2]),e:reg[f]||null});
  });

  const calHtml = Object.values(porMes).map(({año,mes,dias})=>{
    const off=new Date(año,mes,1).getDay();
    const tot=new Date(año,mes+1,0).getDate();
    const mapa={}; dias.forEach(d=>{mapa[d.d]=d.e;});
    let sems=[]; let sem=Array(off).fill(null);
    for(let d=1;d<=tot;d++){
      sem.push(d); if(sem.length===7){sems.push([...sem]);sem=[];}
    }
    if(sem.length){while(sem.length<7)sem.push(null);sems.push(sem);}
    const mp=dias.filter(d=>d.e==="presente").length;
    const ma=dias.filter(d=>d.e==="ausente").length;
    const mj=dias.filter(d=>d.e==="justificado").length;
    const mt=dias.filter(d=>d.e).length;
    const mpct=mt>0?Math.round((mp/mt)*100):null;
    return `<div style="border:1px solid #e2e8f0;border-radius:8px;padding:9px;break-inside:avoid">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <div style="font-weight:800;font-size:11px;color:#1e3a5f">${MESES_LARGO[mes]} ${año}</div>
        <div style="display:flex;gap:3px;font-size:8px">
          <span style="background:#dcfce7;color:#15803d;padding:1px 5px;border-radius:6px;font-weight:700">P:${mp}</span>
          <span style="background:#fee2e2;color:#b91c1c;padding:1px 5px;border-radius:6px;font-weight:700">A:${ma}</span>
          <span style="background:#fef9c3;color:#92400e;padding:1px 5px;border-radius:6px;font-weight:700">J:${mj}</span>
          ${mpct!==null?`<span style="background:#eff6ff;color:#1d4ed8;padding:1px 5px;border-radius:6px;font-weight:800">${mpct}%</span>`:""}
        </div>
      </div>
      <table style="width:100%;border-collapse:separate;border-spacing:2px">
        <thead><tr>${["D","L","M","M","J","V","S"].map(d=>`<th style="text-align:center;font-size:8px;color:#94a3b8;font-weight:700;width:14.28%">${d}</th>`).join("")}</tr></thead>
        <tbody>${sems.map(s=>`<tr>${s.map(d=>{
          if(!d)return`<td></td>`;
          const e=mapa[d];
          let bg="#f9fafb",c="#9ca3af",l="·";
          if(e==="presente"){bg="#dcfce7";c="#15803d";l="P";}
          else if(e==="ausente"){bg="#fee2e2";c="#b91c1c";l="A";}
          else if(e==="justificado"){bg="#fef9c3";c="#92400e";l="J";}
          const dow=new Date(año,mes,d).getDay();
          if((dow===0||dow===6)&&!e){bg="#f1f5f9";c="#e2e8f0";}
          return`<td style="background:${bg};color:${c};text-align:center;padding:4px 1px;border-radius:3px">
            <div style="font-size:7px;opacity:.6">${d}</div>
            <div style="font-size:9px;font-weight:800">${l}</div>
          </td>`;
        }).join("")}</tr>`).join("")}</tbody>
      </table>
    </div>`;
  }).join("");

  const faltas = fechas.filter(f=>reg[f]==="ausente"||reg[f]==="justificado");
  const faltasHtml = faltas.length===0
    ? `<div style="padding:8px 12px;background:#dcfce7;border-radius:7px;color:#15803d;font-weight:700;font-size:11px">✅ Sin ausencias ni justificados en este periodo</div>`
    : `<table><thead><tr><th>#</th><th>Fecha</th><th style="text-align:center">Estado</th></tr></thead>
       <tbody>${faltas.map((f,i)=>`<tr style="background:${i%2?"#f8fafc":"#fff"}">
         <td style="color:#64748b">${i+1}</td>
         <td style="font-weight:600">${fmtFechaLarga(f)}</td>
         <td class="${reg[f]==="ausente"?"A":"J"}" style="text-align:center">${ESTADO_LABEL[reg[f]]}</td>
       </tr>`).join("")}</tbody></table>`;

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/>
<title>Asistencia ${alumno.nombre} ${fechaInicio} al ${fechaFin}</title>
<style>${PDF_CSS}
.cal-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:14px}
@media print{body{padding:12px}button{display:none!important}@page{size:portrait;margin:1cm}}</style></head><body>
${hdrHTML("👤 Reporte Individual de Asistencia", `${fmtFechaCorta(fechaInicio)} al ${fmtFechaCorta(fechaFin)}`, fechaHoy)}
<div class="info2">
  <div class="field"><label>Alumno</label><span>${alumno.nombre}</span></div>
  <div class="field"><label>Grupo</label><span>${grupo?.nombre||alumno.grupo}</span></div>
  <div class="field"><label>Maestro titular</label><span>${maestro?.nombre||"—"}</span></div>
  <div class="field"><label>Periodo</label><span>${fmtFechaCorta(fechaInicio)} — ${fmtFechaCorta(fechaFin)}</span></div>
</div>
<div class="stats" style="grid-template-columns:repeat(4,1fr)">
  <div class="sc" style="background:#f0fdf4;border-color:#86efac"><div class="n" style="color:#15803d">${p}</div><div class="l" style="color:#15803d">PRESENTES</div></div>
  <div class="sc" style="background:#fef2f2;border-color:#fca5a5"><div class="n" style="color:#b91c1c">${a}</div><div class="l" style="color:#b91c1c">AUSENTES</div></div>
  <div class="sc" style="background:#fefce8;border-color:#fde047"><div class="n" style="color:#92400e">${j}</div><div class="l" style="color:#92400e">JUSTIFICADOS</div></div>
  <div class="sc" style="background:${pct>=90?"#f0fdf4":pct>=75?"#fefce8":"#fef2f2"};border-color:${pct>=90?"#86efac":pct>=75?"#fde047":"#fca5a5"}">
    <div class="n" style="color:${pctClr}">${pct!==null?pct+"%":"—"}</div><div class="l" style="color:${pctClr}">% ASISTENCIA</div>
  </div>
</div>
<div style="background:#f1f5f9;border-radius:7px;padding:8px 12px;margin-bottom:12px">
  <div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:4px">
    <strong>Tasa de asistencia en el periodo</strong>
    <span style="font-weight:800;color:${pctClr}">${pct!==null?pct+"%":"Sin datos"}</span>
  </div>
  <div style="background:#e2e8f0;border-radius:999px;height:8px;overflow:hidden">
    <div style="width:${pct||0}%;height:100%;border-radius:999px;background:linear-gradient(90deg,${pct>=90?"#16a34a,#4ade80":pct>=75?"#d97706,#fbbf24":"#dc2626,#f87171"})"></div>
  </div>
</div>
<h2>📅 Calendario por Mes</h2>
<div class="cal-grid">${calHtml}</div>
<h2>⚠️ Detalle de Ausencias y Justificados</h2>
${faltasHtml}
<div class="firma-row">
  <div class="firma"><strong>${maestro?.nombre||"_______________"}</strong><br>Maestro Titular</div>
  <div class="firma"><strong>Ma. Norma Alvarez</strong><br>Director(a)</div>
  <div class="firma"><strong>_______________</strong><br>Firma del Tutor</div>
</div>
<div class="footer">EduGestión · Sistema de Control Escolar · Ciudad Juárez, Chihuahua · ${fechaHoy}</div>
<script>window.onload=()=>window.print();</script>
</body></html>`;
  abrirVentana(html,900,800);
}

/* ════════════════════════════════════
   MODAL DESCARGA — ahora con modo: día, semana, periodo
════════════════════════════════════ */
function ModalDescarga({ grupoId, alumnos, db, onClose }) {
  const grupo   = db.grupos.find(g=>g.id===grupoId);
  const maestro = grupo ? db.maestros.find(m=>m.id===grupo.maestroId) : null;
  const hoy     = new Date().toISOString().slice(0,10);
  const inicioC = CICLO_INICIO.toISOString().slice(0,10);

  /* tipo: dia | semana | periodo */
  const [tipo,        setTipo]        = useState("dia");
  /* quién: grupo | alumno */
  const [quien,       setQuien]       = useState("grupo");
  const [alumnoId,    setAlumnoId]    = useState(alumnos[0]?.id||"");
  /* para día */
  const [fechaDia,    setFechaDia]    = useState(hoy);
  /* para semana */
  const [fechaSem,    setFechaSem]    = useState(hoy);
  /* para periodo */
  const [fechaIni,    setFechaIni]    = useState(inicioC);
  const [fechaFin,    setFechaFin]    = useState(hoy);

  /* Preview semana */
  const [lunSem, domSem] = semanaDeF(fechaSem);

  const handleGenerar = () => {
    const al = alumnos.find(a=>a.id===alumnoId);
    if (quien==="alumno" && !al) { toast.error("Selecciona un alumno"); return; }

    if (tipo==="dia") {
      generarPDFDia(quien, fechaDia, grupo, maestro, alumnos, db.asistencia, al);
      toast.success("Abriendo reporte del día…");
    } else if (tipo==="semana") {
      generarPDFSemana(quien, fechaSem, grupo, maestro, alumnos, db.asistencia, al);
      toast.success("Abriendo reporte semanal…");
    } else {
      if (fechaIni>fechaFin) { toast.error("La fecha inicio debe ser antes que la final"); return; }
      if (quien==="grupo") {
        generarPDFGrupo(grupo,maestro,alumnos,db.asistencia,fechaIni,fechaFin);
      } else {
        generarPDFAlumno(al,grupo,maestro,db.asistencia,fechaIni,fechaFin);
      }
      toast.success("Abriendo reporte del periodo…");
    }
    onClose();
  };

  const TIPOS = [
    {v:"dia",    lbl:"📅 Por Día"},
    {v:"semana", lbl:"🗓️ Por Semana"},
    {v:"periodo",lbl:"📆 Por Periodo"},
  ];

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">📄 Generar Reporte de Asistencia</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        {/* Selector tipo */}
        <div style={{marginBottom:14}}>
          <div className="form-label" style={{marginBottom:6}}>Tipo de reporte</div>
          <div style={{display:"flex",gap:6}}>
            {TIPOS.map(({v,lbl})=>(
              <button key={v} className={`btn btn-sm ${tipo===v?"btn-primary":""}`}
                style={{flex:1,fontSize:12}} onClick={()=>setTipo(v)}>{lbl}</button>
            ))}
          </div>
        </div>

        {/* Selector quién */}
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          <button className={`btn btn-sm ${quien==="grupo"?"btn-primary":""}`} style={{flex:1}} onClick={()=>setQuien("grupo")}>👥 Grupo completo</button>
          <button className={`btn btn-sm ${quien==="alumno"?"btn-primary":""}`} style={{flex:1}} onClick={()=>setQuien("alumno")}>👤 Alumno individual</button>
        </div>

        {quien==="alumno" && (
          <div className="form-group" style={{marginBottom:14}}>
            <label className="form-label">Alumno</label>
            <select className="form-control" value={alumnoId} onChange={e=>setAlumnoId(e.target.value)}>
              {alumnos.map(a=><option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
          </div>
        )}

        {/* Info grupo */}
        <div style={{padding:"7px 11px",background:"var(--bg-base)",borderRadius:8,marginBottom:12,fontSize:12}}>
          <strong>Grupo:</strong> {grupo?.nombre||grupoId}
          {maestro && <span className="muted"> · {maestro.nombre}</span>}
        </div>

        {/* Campos según tipo */}
        {tipo==="dia" && (
          <div className="form-group" style={{marginBottom:14}}>
            <label className="form-label">Fecha del día</label>
            <input type="date" className="form-control" value={fechaDia}
              onChange={e=>setFechaDia(e.target.value)} min={inicioC} max={hoy}/>
            <div style={{marginTop:4,fontSize:11,color:"var(--text-muted)"}}>
              {fmtFechaLarga(fechaDia)}
            </div>
          </div>
        )}

        {tipo==="semana" && (
          <div className="form-group" style={{marginBottom:14}}>
            <label className="form-label">Cualquier día de la semana que quieres</label>
            <input type="date" className="form-control" value={fechaSem}
              onChange={e=>setFechaSem(e.target.value)} min={inicioC} max={hoy}/>
            <div style={{marginTop:6,padding:"6px 10px",background:"#eff6ff",borderRadius:7,fontSize:11,color:"#1d4ed8"}}>
              📅 Semana: <strong>{fmtFechaCorta(lunSem)}</strong> al <strong>{fmtFechaCorta(domSem)}</strong> (Lunes → Domingo)
            </div>
          </div>
        )}

        {tipo==="periodo" && (
          <>
            <div className="form-grid" style={{marginBottom:10}}>
              <div className="form-group">
                <label className="form-label">Fecha inicio</label>
                <input type="date" className="form-control" value={fechaIni}
                  onChange={e=>setFechaIni(e.target.value)} min={inicioC} max={hoy}/>
              </div>
              <div className="form-group">
                <label className="form-label">Fecha fin</label>
                <input type="date" className="form-control" value={fechaFin}
                  onChange={e=>setFechaFin(e.target.value)} min={inicioC} max={hoy}/>
              </div>
            </div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
              <span className="small muted" style={{alignSelf:"center"}}>Acceso rápido:</span>
              {[
                {lbl:"Ciclo completo",ini:inicioC,fin:hoy},
                {lbl:"Este mes",ini:new Date(new Date().getFullYear(),new Date().getMonth(),1).toISOString().slice(0,10),fin:hoy},
                {lbl:"1er Trimestre",ini:"2026-08-24",fin:"2026-11-28"},
                {lbl:"2do Trimestre",ini:"2026-12-01",fin:"2027-03-14"},
                {lbl:"3er Trimestre",ini:"2027-03-17",fin:"2027-06-18"},
              ].map(({lbl,ini,fin})=>(
                <button key={lbl} className="btn btn-sm"
                  onClick={()=>{setFechaIni(ini);setFechaFin(fin>hoy?hoy:fin);}}>
                  {lbl}
                </button>
              ))}
            </div>
          </>
        )}

        <div style={{padding:"7px 11px",background:"#eff6ff",border:"1px solid #93c5fd",borderRadius:7,fontSize:11,color:"#1e40af",marginBottom:14}}>
          💡 Se abrirá una ventana. Usa <strong>Ctrl+P</strong> para guardar como PDF.
        </div>

        <div className="form-actions">
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleGenerar}>📄 Generar PDF</button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════
   MINI CALENDARIO MENSUAL (componente React)
════════════════════════════════════ */
function CalendarioMes({ año, mes, registros }) {
  const diasMes = new Date(año,mes+1,0).getDate();
  const offset  = new Date(año,mes,1).getDay();
  const celdas  = [];
  for(let i=0;i<offset;i++) celdas.push(null);
  for(let d=1;d<=diasMes;d++) celdas.push(d);
  const DIAS = ["D","L","M","M","J","V","S"];
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
        {DIAS.map((d,i)=><div key={i} style={{textAlign:"center",fontSize:10,fontWeight:700,color:"var(--text-muted)",padding:2}}>{d}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
        {celdas.map((d,i)=>{
          if(!d) return <div key={i}/>;
          const f   = fmt(año,mes,d);
          const est = registros[f];
          const clr = est ? ESTADO_COLOR[est] : undefined;
          const hoy = new Date().toISOString().slice(0,10)===f;
          return (
            <div key={i} title={est?ESTADO_LABEL[est]:"Sin registro"} style={{
              width:"100%",aspectRatio:"1",borderRadius:4,
              background:est?clr+"22":"var(--bg-base)",
              border:hoy?`2px solid ${clr||"var(--accent)"}`:`1px solid ${est?clr+"55":"var(--border)"}`,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:10,fontWeight:hoy?700:400,color:est?clr:"var(--text-muted)",cursor:"default",
            }}>{d}</div>
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

/* ════════════════════════════════════
   MODAL HISTORIAL
════════════════════════════════════ */
function ModalHistorial({ alumno, grupo, db, onClose }) {
  const maestro = grupo ? db.maestros.find(m=>m.id===grupo.maestroId) : null;
  const hoy = new Date();
  const [año, setAño] = useState(hoy.getFullYear());
  const [mes, setMes] = useState(hoy.getMonth());

  const registros = useMemo(()=>{
    const map={};
    db.asistencia.filter(a=>a.alumnoId===alumno.id).forEach(a=>{map[a.fecha]=a.estado;});
    return map;
  },[db.asistencia,alumno.id]);

  const faltas       = Object.values(registros).filter(e=>e==="ausente").length;
  const justificadas = Object.values(registros).filter(e=>e==="justificado").length;
  const presentes    = Object.values(registros).filter(e=>e==="presente").length;
  const totalReg     = Object.keys(registros).length;
  const pct          = totalReg ? Math.round((presentes/totalReg)*100) : 100;

  const prevMes = ()=>{ if(mes===0){setMes(11);setAño(a=>a-1);}else setMes(m=>m-1); };
  const nextMes = ()=>{ if(mes===11){setMes(0);setAño(a=>a+1);}else setMes(m=>m+1); };

  const hoyStr  = hoy.toISOString().slice(0,10);
  const inicioC = CICLO_INICIO.toISOString().slice(0,10);

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
          <button className="btn btn-sm btn-primary"
            onClick={()=>{generarPDFAlumno(alumno,grupo,maestro,db.asistencia,inicioC,hoyStr);toast.success("Abriendo reporte…");}}>
            📄 PDF Ciclo completo
          </button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
          {[
            {lbl:"Presentes",val:presentes,color:"#16a34a",bg:"#dcfce7"},
            {lbl:"Faltas",val:faltas,color:"#dc2626",bg:"#fee2e2"},
            {lbl:"Justificadas",val:justificadas,color:"#d97706",bg:"#fef9c3"},
            {lbl:"% Asistencia",val:pct+"%",color:"#2563eb",bg:"#dbeafe"},
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
            <div style={{width:`${Math.round(diasTranscurridos()/DIAS_HABILES_CICLO*100)}%`,background:"var(--accent)",height:"100%",borderRadius:999}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginTop:3,color:"var(--text-muted)"}}>
            <span>Transcurridos: {diasTranscurridos()} días</span>
            <span>Restantes: {DIAS_HABILES_CICLO-diasTranscurridos()} días</span>
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

/* ════════════════════════════════════
   VISTA PRINCIPAL
════════════════════════════════════ */
function Asistencia() {
  const db   = useAppDB();
  const auth = useAuth();

  const today = new Date().toISOString().slice(0,10);
  const [fecha,         setFecha]         = useState(today);
  const [histAlumno,    setHistAlumno]    = useState(null);
  const [modalDescarga, setModalDescarga] = useState(false);

  const [grupoId, setGrupoId] = useState(
    auth?.rol==="maestro" ? auth.grupo : (db.grupos[0]?.id||"")
  );

  const alumnosGrupo = useMemo(()=>db.alumnos.filter(a=>a.grupo===grupoId),[db.alumnos,grupoId]);

  const getEstado = useCallback((alumnoId)=>{
    const reg = db.asistencia.find(a=>a.alumnoId===alumnoId&&a.fecha===fecha);
    return reg?.estado||"presente";
  },[db.asistencia,fecha]);

  const toggleEstado = useCallback((alumnoId)=>{
    const actual    = getEstado(alumnoId);
    const siguiente = ESTADOS[(ESTADOS.indexOf(actual)+1)%ESTADOS.length];
    const maestroId = db.grupos.find(g=>g.id===grupoId)?.maestroId||"";
    db.guardarAsistencia(alumnoId,fecha,siguiente,maestroId);
  },[getEstado,db,grupoId,fecha]);

  const guardarTodo = ()=>toast.success(`Asistencia del ${fecha} guardada`);
  const marcarTodos = (estado)=>{
    const maestroId=db.grupos.find(g=>g.id===grupoId)?.maestroId||"";
    alumnosGrupo.forEach(a=>db.guardarAsistencia(a.id,fecha,estado,maestroId));
    toast.success(`Todos marcados como ${ESTADO_LABEL[estado].toLowerCase()}`);
  };

  const asistHoy     = db.asistencia.filter(a=>a.fecha===fecha&&alumnosGrupo.some(al=>al.id===a.alumnoId));
  const presentes    = asistHoy.filter(a=>a.estado==="presente").length;
  const ausentes     = asistHoy.filter(a=>a.estado==="ausente").length;
  const justificados = asistHoy.filter(a=>a.estado==="justificado").length;
  const pctHoy       = alumnosGrupo.length?Math.round((presentes/alumnosGrupo.length)*100):0;
  const pctCiclo     = Math.round(diasTranscurridos()/DIAS_HABILES_CICLO*100);

  const grupo   = db.grupos.find(g=>g.id===grupoId);
  const maestro = grupo ? db.maestros.find(m=>m.id===grupo.maestroId) : null;

  return (
    <Layout title="Control de Asistencia">
      <div className="card mb-24">
        <div className="card-header">
          <div className="card-title">📋 Pase de Lista</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
            {auth?.rol!=="maestro" && (
              <select className="form-control" style={{width:140}} value={grupoId} onChange={e=>setGrupoId(e.target.value)}>
                {db.grupos.map(g=><option key={g.id} value={g.id}>{g.nombre}</option>)}
              </select>
            )}
            {auth?.rol==="maestro" && (
              <span className="badge badge-info" style={{fontSize:14,padding:"6px 14px"}}>{grupo?.nombre||grupoId}</span>
            )}
            <input type="date" className="form-control" style={{width:160}} value={fecha}
              onChange={e=>setFecha(e.target.value)} max={today}/>
            <button className="btn btn-sm btn-primary" onClick={()=>setModalDescarga(true)}>📄 Generar PDF</button>
          </div>
        </div>

        {maestro && (
          <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:14,padding:"8px 12px",background:"var(--bg-base)",borderRadius:8,fontSize:13}}>
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
            {lbl:"PRESENTES",val:presentes,color:"#16a34a",bg:"#f0fdf4",border:"#86efac"},
            {lbl:"AUSENTES",val:ausentes,color:"#dc2626",bg:"#fef2f2",border:"#fca5a5"},
            {lbl:"JUSTIFICADOS",val:justificados,color:"#d97706",bg:"#fffbeb",border:"#fcd34d"},
            {lbl:"ASISTENCIA",val:pctHoy+"%",color:"#2563eb",bg:"#eff6ff",border:"#93c5fd"},
          ].map(({lbl,val,color,bg,border})=>(
            <div key={lbl} style={{flex:1,minWidth:80,background:bg,border:`1px solid ${border}`,borderRadius:10,padding:"10px 14px",textAlign:"center"}}>
              <div style={{fontSize:24,fontWeight:800,color}}>{val}</div>
              <div style={{fontSize:10,fontWeight:700,color}}>{lbl}</div>
            </div>
          ))}
        </div>

        <div style={{background:"var(--bg-base)",border:"1px solid var(--border)",borderRadius:10,padding:"10px 14px",marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
            <strong>Ciclo escolar 2026-2027 (SEP México)</strong>
            <span style={{color:"var(--text-muted)"}}>24-ago-2026 · 18-jun-2027 · {DIAS_HABILES_CICLO} días hábiles</span>
          </div>
          <div style={{background:"var(--border)",borderRadius:999,height:8,overflow:"hidden"}}>
            <div style={{width:`${pctCiclo}%`,background:"linear-gradient(90deg,var(--accent),#7c3aed)",height:"100%",borderRadius:999,transition:"width .5s"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginTop:3,color:"var(--text-muted)"}}>
            <span>Días transcurridos: <strong>{diasTranscurridos()}</strong></span>
            <span>{pctCiclo}% del ciclo</span>
            <span>Días restantes: <strong>{DIAS_HABILES_CICLO-diasTranscurridos()}</strong></span>
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
                const estado=getEstado(a.id);
                return (
                  <div key={a.id} className={`asistencia-card ${estado}`}>
                    <div className="av">{INITIALS(a.nombre)}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:600,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        {a.nombre.split(" ").slice(0,2).join(" ")}
                      </div>
                      <div className="small" style={{color:ESTADO_COLOR[estado],fontWeight:600}}>{ESTADO_LABEL[estado]}</div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end"}}>
                      <div onClick={()=>toggleEstado(a.id)} style={{cursor:"pointer",fontSize:22,userSelect:"none"}} title="Clic para cambiar estado">
                        {ESTADO_ICON[estado]}
                      </div>
                      <button className="btn btn-sm" style={{fontSize:10,padding:"2px 6px"}} onClick={()=>setHistAlumno(a)} title="Ver historial">📅</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        }
      </div>

      {histAlumno && <ModalHistorial alumno={histAlumno} grupo={grupo} db={db} onClose={()=>setHistAlumno(null)}/>}
      {modalDescarga && <ModalDescarga grupoId={grupoId} alumnos={alumnosGrupo} db={db} onClose={()=>setModalDescarga(false)}/>}
    </Layout>
  );
}

export default Asistencia;
