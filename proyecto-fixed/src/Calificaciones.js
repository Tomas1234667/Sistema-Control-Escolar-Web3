import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAppDB, Layout } from "./App";

const CICLO = "2026-2027";

const MATERIAS = [
  "Matemáticas","Español","Ciencias Naturales",
  "Historia","Geografía","Formación Cívica y Ética","Educación Artística",
  "Educación Física",
];

/* ════════════════════════════════════
   UTILIDADES
════════════════════════════════════ */
const clrNum = (n) =>
  n >= 9 ? "#166534" : n >= 8 ? "#15803d" : n >= 7 ? "#92400e" : n >= 6 ? "#b45309" : "#991b1b";

const valTri = (v) => v !== "" && v !== null && v !== undefined && Number(v) !== 0;

/* Promedio REAL de un solo trimestre (no divide entre 3) */
const promTri = (c, t) => {
  if (t === "t1") return valTri(c.tri1) ? +Number(c.tri1).toFixed(1) : null;
  if (t === "t2") return valTri(c.tri2) ? +Number(c.tri2).toFixed(1) : null;
  if (t === "t3") return valTri(c.tri3) ? +Number(c.tri3).toFixed(1) : null;
  /* "todos" → promedio final real (T1+T2+T3)/3 solo si los 3 existen */
  if (valTri(c.tri1) && valTri(c.tri2) && valTri(c.tri3))
    return +((Number(c.tri1)+Number(c.tri2)+Number(c.tri3))/3).toFixed(1);
  return null;
};

/* ════════════════════════════════════
   CSS COMPARTIDO PARA PDFs
════════════════════════════════════ */
const PDF_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Plus Jakarta Sans',Arial,sans-serif;color:#1e293b;background:#fff;padding:26px;font-size:12px}
  .hdr{display:flex;align-items:center;gap:16px;border-bottom:4px solid #1e3a5f;padding-bottom:12px;margin-bottom:16px}
  .esc{width:52px;height:52px;background:linear-gradient(135deg,#1e3a5f,#2563eb);border-radius:12px;
    display:flex;align-items:center;justify-content:center;font-size:26px;color:#fff;flex-shrink:0}
  .ei h1{font-size:16px;font-weight:800;color:#1e3a5f}
  .ei p{font-size:10px;color:#64748b;margin-top:2px}
  .badge{padding:4px 12px;border-radius:20px;font-size:10px;font-weight:700;white-space:nowrap}
  h2{font-size:11px;font-weight:700;color:#1e3a5f;border-left:4px solid #1e3a5f;padding-left:8px;
    text-transform:uppercase;letter-spacing:.5px;margin:14px 0 7px}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:14px}
  .grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-bottom:14px}
  .field{padding:6px 10px;background:#f1f5f9;border-radius:7px}
  .field label{font-size:9px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.4px}
  .field span{display:block;font-weight:700;font-size:12px;margin-top:2px;color:#1e293b}
  table{width:100%;border-collapse:collapse;margin-bottom:14px;font-size:11px}
  th{background:#1e3a5f;color:#e2e8f0;padding:7px 10px;text-align:left;font-size:10px;font-weight:700}
  th:not(:first-child){text-align:center}
  td{padding:6px 10px;border-bottom:1px solid #e2e8f0}
  tr:nth-child(even) td{background:#f8fafc}
  .chip{display:inline-block;padding:2px 8px;border-radius:5px;font-size:10px;font-weight:600;margin:2px}
  .res{display:grid;gap:8px;margin-bottom:14px}
  .rc{padding:10px;border-radius:8px;text-align:center;border:1px solid}
  .rc .v{font-size:22px;font-weight:800}
  .rc .l{font-size:9px;font-weight:700;margin-top:2px}
  .firma-row{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:22px}
  .firma{text-align:center;border-top:1px solid #334155;padding-top:5px;font-size:10px;color:#475569;margin-top:28px}
  .footer{margin-top:14px;text-align:center;font-size:9px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:7px}
  .pen{background:#fffbeb;color:#92400e;font-style:italic}
  @media print{body{padding:12px}button{display:none!important}}
`;

const hdrHTML = (titulo, subtitulo, fechaHoy) => `
<div class="hdr">
  <div class="esc">🏫</div>
  <div class="ei">
    <h1>Escuela Primaria EduGestión</h1>
    <p>Ciudad Juárez, Chihuahua · Turno Vespertino · Ciclo ${CICLO}</p>
    <p>Documento generado el ${fechaHoy}</p>
  </div>
  <div style="margin-left:auto;display:flex;flex-direction:column;gap:4px;align-items:flex-end">
    <span class="badge" style="background:#1e3a5f;color:#fff">${titulo}</span>
    <span class="badge" style="background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe">${subtitulo}</span>
  </div>
</div>`;

const abrirVentana = (html, ancho=960, alto=720) => {
  const win = window.open("", "_blank", `width=${ancho},height=${alto}`);
  win.document.write(html);
  win.document.close();
};

/* ════════════════════════════════════
   PDF — BOLETA INDIVIDUAL
   Muestra solo las materias que tienen calificación en el trimestre pedido.
   Las sin calificar aparecen en la tabla pero con fondo amarillo.
   Al IMPRIMIR solo salen las registradas (las sin calificar se ocultan con @media print).
   En "todos" muestra todos los trimestres + promedio final (T1+T2+T3)/3.
════════════════════════════════════ */
function generarBoletaPDF(alumno, db, triSel) {
  const grupo   = db.grupos.find(g => g.id === alumno.grupo);
  const maestro = db.maestros.find(m => m.id === grupo?.maestroId);
  const todas   = db.calificaciones.filter(c => c.alumnoId === alumno.id && c.ciclo === CICLO);
  const fechaHoy = new Date().toLocaleDateString("es-MX",{year:"numeric",month:"long",day:"numeric"});

  const TL = { t1:"1er Trimestre", t2:"2do Trimestre", t3:"3er Trimestre", todos:"Todos los Trimestres" };

  /* Calificaciones que tienen dato en el trimestre seleccionado */
  const conDato = (c) => {
    if (triSel === "t1") return valTri(c.tri1);
    if (triSel === "t2") return valTri(c.tri2);
    if (triSel === "t3") return valTri(c.tri3);
    return true; // todos → siempre mostrar
  };

  /* Calcular promedio del trimestre para el encabezado de resumen */
  const califConDato = MATERIAS.map(m => todas.find(c=>c.materia===m)).filter(c=>c && conDato(c));
  const promsValidos = califConDato.map(c=>promTri(c,triSel)).filter(v=>v!==null);
  const promResumen  = promsValidos.length
    ? (promsValidos.reduce((a,b)=>a+b,0)/promsValidos.length).toFixed(1)
    : "—";

  /* Columnas del encabezado de tabla según triSel */
  const thExtra = triSel==="todos"
    ? "<th>1er Trim.</th><th>2do Trim.</th><th>3er Trim.</th><th>Prom. Final</th>"
    : `<th>${TL[triSel]}</th>`;

  /* Filas de la tabla */
  const filasHTML = MATERIAS.map(m => {
    const c = todas.find(cx=>cx.materia===m);
    const tieneDato = c && conDato(c);
    const p = c ? promTri(c, triSel) : null;

    if (!tieneDato) {
      /* Sin calificar — visible en pantalla, oculta al imprimir */
      const colsVacias = triSel==="todos"
        ? "<td>—</td><td>—</td><td>—</td><td>—</td>"
        : "<td>—</td>";
      return `<tr class="pen no-print">
        <td><span style="color:#d97706">⚠</span> ${m} <span class="chip" style="background:#fef3c7;color:#92400e">Sin calificar</span></td>
        ${colsVacias}
      </tr>`;
    }

    const colsValor = triSel==="todos"
      ? `<td style="text-align:center">${valTri(c.tri1)?Number(c.tri1).toFixed(1):"—"}</td>
         <td style="text-align:center">${valTri(c.tri2)?Number(c.tri2).toFixed(1):"—"}</td>
         <td style="text-align:center">${valTri(c.tri3)?Number(c.tri3).toFixed(1):"—"}</td>
         <td style="text-align:center;font-weight:800;color:${clrNum(p??0)}">${p??'—'}</td>`
      : `<td style="text-align:center;font-weight:800;color:${clrNum(p??0)}">${p??'—'}</td>`;

    return `<tr><td style="font-weight:600">${m}</td>${colsValor}</tr>`;
  }).join("");

  /* Aviso materias sin calificar */
  const sinCal = MATERIAS.filter(m => {
    const c = todas.find(cx=>cx.materia===m);
    return !(c && conDato(c));
  });
  const avisoHTML = sinCal.length > 0
    ? `<div style="padding:8px 12px;background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;margin-bottom:12px;font-size:11px">
        <strong>⚠️ No se imprimirán (sin calificar en ${TL[triSel]}):</strong>
        ${sinCal.map(m=>`<span class="chip" style="background:#ffe4b5;color:#92400e">${m}</span>`).join("")}
       </div>`
    : `<div style="padding:8px 12px;background:#dcfce7;border:1px solid #86efac;border-radius:8px;margin-bottom:12px;font-size:11px">
        ✅ Todas las materias están calificadas en ${TL[triSel]}
       </div>`;

  /* Tarjetas de resumen */
  const resCards = triSel === "todos"
    ? `<div class="res" style="grid-template-columns:repeat(4,1fr)">
        ${["t1","t2","t3"].map((t,i)=>{
          const ps = MATERIAS.map(m=>todas.find(c=>c.materia===m)).filter(c=>c&&valTri(c[t]));
          const avg = ps.length ? (ps.map(c=>Number(c[t])).reduce((a,b)=>a+b,0)/ps.length).toFixed(1) : "—";
          const bg = ["#eff6ff","#f0fdf4","#fdf4ff"][i];
          const col = ["#1d4ed8","#15803d","#7e22ce"][i];
          return `<div class="rc" style="background:${bg};border-color:${col}44">
            <div class="v" style="color:${col}">${avg}</div>
            <div class="l" style="color:${col}">${["1er","2do","3er"][i]} Trim.</div>
          </div>`;
        }).join("")}
        <div class="rc" style="background:#fefce8;border-color:#ca8a04">
          <div class="v" style="color:${clrNum(Number(promResumen))}">${promResumen}</div>
          <div class="l" style="color:#92400e">Promedio Final</div>
        </div>
      </div>`
    : `<div class="res" style="grid-template-columns:repeat(3,1fr)">
        <div class="rc" style="background:#eff6ff;border-color:#93c5fd">
          <div class="v" style="color:${clrNum(Number(promResumen))}">${promResumen}</div>
          <div class="l" style="color:#1d4ed8">Promedio ${TL[triSel]}</div>
        </div>
        <div class="rc" style="background:#f0fdf4;border-color:#86efac">
          <div class="v" style="color:#15803d">${califConDato.length}/${MATERIAS.length}</div>
          <div class="l" style="color:#15803d">Materias calificadas</div>
        </div>
        <div class="rc" style="background:${sinCal.length===0?"#dcfce7":"#fef3c7"};border-color:${sinCal.length===0?"#86efac":"#fcd34d"}">
          <div class="v" style="color:${sinCal.length===0?"#15803d":"#92400e"}">${sinCal.length}</div>
          <div class="l" style="color:${sinCal.length===0?"#15803d":"#92400e"}">Sin calificar</div>
        </div>
      </div>`;

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/>
<title>Boleta ${TL[triSel]} — ${alumno.nombre}</title>
<style>
${PDF_CSS}
.no-print{} /* visible en pantalla */
@media print{.no-print{display:none!important}}
</style></head><body>
${hdrHTML("📄 Boleta de Calificaciones", TL[triSel], fechaHoy)}
<h2>Datos del Alumno</h2>
<div class="grid2">
  <div class="field"><label>Nombre completo</label><span>${alumno.nombre}</span></div>
  <div class="field"><label>CURP</label><span style="font-size:10px">${alumno.curp||"—"}</span></div>
  <div class="field"><label>Grupo</label><span>${alumno.grupo} — ${grupo?.nombre||""}</span></div>
  <div class="field"><label>Maestro titular</label><span>${maestro?.nombre||"—"}</span></div>
  <div class="field"><label>Fecha de nacimiento</label><span>${alumno.fechaNac||"—"}</span></div>
  <div class="field"><label>Tutor</label><span>${alumno.tutor||"—"}</span></div>
</div>
<h2>Calificaciones — ${TL[triSel]}</h2>
${avisoHTML}
<table>
  <thead><tr><th>Materia</th>${thExtra}</tr></thead>
  <tbody>${filasHTML}</tbody>
</table>
<h2>Resumen</h2>
${resCards}
<div class="firma-row">
  <div class="firma"><strong>${maestro?.nombre||"___________________"}</strong><br>Maestro Titular</div>
  <div class="firma"><strong>Ma. Norma Alvarez</strong><br>Director(a)</div>
</div>
<div class="footer">EduGestión · Sistema de Control Escolar · Ciudad Juárez, Chihuahua · ${fechaHoy}</div>
<script>window.onload=()=>window.print();</script>
</body></html>`;

  abrirVentana(html);
}

/* ════════════════════════════════════
   PDF — BOLETA DE TODO EL GRUPO
   Por trimestre seleccionado o todos.
   Solo muestra calificación del tri pedido.
   Promedio del tri = promedio real de ese trimestre.
   En "todos" = (T1+T2+T3)/3.
════════════════════════════════════ */
function generarBoletaGrupoPDF(grupo, maestro, alumnos, todasCalifs, triSel) {
  const TL = { t1:"1er Trimestre", t2:"2do Trimestre", t3:"3er Trimestre", todos:"Todos los Trimestres" };
  const fechaHoy = new Date().toLocaleDateString("es-MX",{year:"numeric",month:"long",day:"numeric"});

  const datosAlumnos = alumnos.map(al => {
    const califs = todasCalifs.filter(c=>c.alumnoId===al.id && c.ciclo===CICLO);
    const conDato = califs.filter(c => {
      if (triSel==="t1") return valTri(c.tri1);
      if (triSel==="t2") return valTri(c.tri2);
      if (triSel==="t3") return valTri(c.tri3);
      return valTri(c.tri1)&&valTri(c.tri2)&&valTri(c.tri3);
    });
    const proms = conDato.map(c=>promTri(c,triSel)).filter(v=>v!==null);
    const prom  = proms.length ? (proms.reduce((a,b)=>a+b,0)/proms.length).toFixed(1) : null;
    const sinCal = MATERIAS.length - conDato.length;
    return { al, conDato, sinCal, prom };
  });

  const promGrupoVals = datosAlumnos.map(d=>d.prom).filter(Boolean).map(Number);
  const promGrupo = promGrupoVals.length
    ? (promGrupoVals.reduce((a,b)=>a+b,0)/promGrupoVals.length).toFixed(1) : "—";
  const completos = datosAlumnos.filter(d=>d.sinCal===0).length;

  /* Columnas del header */
  const thExtra = triSel==="todos"
    ? "<th>1er Trim.</th><th>2do Trim.</th><th>3er Trim.</th><th>Prom. Final</th>"
    : `<th>Prom. ${TL[triSel]}</th>`;

  const filasHTML = datosAlumnos.map(({al,conDato,sinCal,prom},i) => {
    const bg = i%2===0?"#fff":"#f8fafc";
    let calCols = "";
    if (triSel==="todos") {
      const califs = todasCalifs.filter(c=>c.alumnoId===al.id&&c.ciclo===CICLO);
      const avg = (t) => {
        const ps = califs.filter(c=>valTri(c[t])).map(c=>Number(c[t]));
        return ps.length ? (ps.reduce((a,b)=>a+b,0)/ps.length).toFixed(1) : "—";
      };
      calCols = `<td style="text-align:center">${avg("tri1")}</td>
                 <td style="text-align:center">${avg("tri2")}</td>
                 <td style="text-align:center">${avg("tri3")}</td>
                 <td style="text-align:center;font-weight:800;color:${clrNum(Number(prom||0))}">${prom??'—'}</td>`;
    } else {
      calCols = `<td style="text-align:center;font-weight:800;color:${clrNum(Number(prom||0))}">${prom??'—'}</td>`;
    }
    const estadoBadge = sinCal===0
      ? `<span style="background:#dcfce7;color:#166534;padding:2px 9px;border-radius:10px;font-weight:700;font-size:10px">✓ Completo</span>`
      : `<span style="background:#fef3c7;color:#92400e;padding:2px 9px;border-radius:10px;font-weight:700;font-size:10px">${sinCal} pendiente${sinCal>1?"s":""}</span>`;
    return `<tr style="background:${bg}">
      <td style="font-weight:600">${i+1}. ${al.nombre}</td>
      <td style="text-align:center">${conDato.length}/${MATERIAS.length}</td>
      <td style="text-align:center">${estadoBadge}</td>
      ${calCols}
    </tr>`;
  }).join("");

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/>
<title>Calificaciones Grupo ${grupo?.nombre||""} — ${TL[triSel]}</title>
<style>
${PDF_CSS}
@media print{@page{size:${triSel==="todos"?"landscape":"portrait"};margin:1cm}}
</style></head><body>
${hdrHTML("📊 Boleta de Grupo", TL[triSel], fechaHoy)}
<div class="grid4">
  <div class="field"><label>Grupo</label><span>${grupo?.nombre||"—"}</span></div>
  <div class="field"><label>Maestro titular</label><span>${maestro?.nombre||"—"}</span></div>
  <div class="field"><label>Total alumnos</label><span>${alumnos.length}</span></div>
  <div class="field"><label>Alumnos completos</label><span>${completos} / ${alumnos.length}</span></div>
</div>
<div class="res" style="grid-template-columns:repeat(3,1fr);margin-bottom:14px">
  <div class="rc" style="background:#eff6ff;border-color:#93c5fd">
    <div class="v" style="color:${clrNum(Number(promGrupo))}">${promGrupo}</div>
    <div class="l" style="color:#1d4ed8">Promedio del Grupo</div>
  </div>
  <div class="rc" style="background:#f0fdf4;border-color:#86efac">
    <div class="v" style="color:#15803d">${completos}</div>
    <div class="l" style="color:#15803d">Alumnos Completos</div>
  </div>
  <div class="rc" style="background:#fef2f2;border-color:#fca5a5">
    <div class="v" style="color:#b91c1c">${alumnos.length-completos}</div>
    <div class="l" style="color:#b91c1c">Con Pendientes</div>
  </div>
</div>
<h2>Concentrado — ${TL[triSel]}</h2>
<table>
  <thead><tr>
    <th>Alumno</th>
    <th style="text-align:center">Materias</th>
    <th style="text-align:center">Estado</th>
    ${thExtra}
  </tr></thead>
  <tbody>${filasHTML}</tbody>
</table>
<div class="firma-row">
  <div class="firma"><strong>${maestro?.nombre||"___________________"}</strong><br>Maestro Titular</div>
  <div class="firma"><strong>Ma. Norma Alvarez</strong><br>Director(a)</div>
</div>
<div class="footer">EduGestión · Sistema de Control Escolar · Ciudad Juárez, Chihuahua · ${fechaHoy}</div>
<script>window.onload=()=>window.print();</script>
</body></html>`;

  abrirVentana(html, 1100, 800);
}

/* ════════════════════════════════════
   MODAL CALIFICACION (sin cambios de lógica)
════════════════════════════════════ */
function ModalCalificacion({ alumno, califExistente, materiasDisponibles, trimestre, onClose, onSave }) {
  const db = useAppDB();
  const esEdicion = !!califExistente;
  const [materia, setMateria] = useState(califExistente?.materia || materiasDisponibles[0] || "");

  /* Registro real ya guardado para la materia seleccionada (si existe).
     Esto es lo que evita que al registrar/editar UN trimestre se
     pisen los valores ya guardados de los OTROS trimestres. */
  const buscarExistente = (m) =>
    califExistente && califExistente.materia === m
      ? califExistente
      : db.calificaciones.find(c=>c.alumnoId===alumno.id && c.materia===m && c.ciclo===CICLO) || null;

  const [existente, setExistente] = useState(() => buscarExistente(materia));
  const [tri1, setTri1] = useState(existente?.tri1 ?? "");
  const [tri2, setTri2] = useState(existente?.tri2 ?? "");
  const [tri3, setTri3] = useState(existente?.tri3 ?? "");

  /* Al cambiar de materia (solo posible cuando se registran varias
     materias pendientes a la vez) recargamos SU propio registro,
     para no arrastrar valores de la materia anterior. */
  useEffect(() => {
    if (esEdicion) return; // en edición la materia es fija
    const reg = buscarExistente(materia);
    setExistente(reg);
    setTri1(reg?.tri1 ?? "");
    setTri2(reg?.tri2 ?? "");
    setTri3(reg?.tri3 ?? "");
  }, [materia]);

  const calcProm = () => {
    if (trimestre==="t1"&&tri1!=="") return Number(tri1).toFixed(1);
    if (trimestre==="t2"&&tri1!==""&&tri2!=="") return ((Number(tri1)+Number(tri2))/2).toFixed(1);
    if (trimestre==="t3"&&tri1!==""&&tri2!==""&&tri3!=="") return ((Number(tri1)+Number(tri2)+Number(tri3))/3).toFixed(1);
    return "—";
  };
  const prom = calcProm();
  const colorProm = prom!=="—" ? clrNum(Number(prom)) : "inherit";

  const handleSubmit = () => {
    if (!materia) { toast.error("Selecciona una materia"); return; }
    if (trimestre==="t1") {
      if (tri1==="") { toast.error("Ingresa la calificación del 1er trimestre"); return; }
      if (isNaN(Number(tri1))||Number(tri1)<0||Number(tri1)>10) { toast.error("Calificación entre 0 y 10"); return; }
      onSave({ alumnoId:alumno.id, materia, tri1:Number(tri1), tri2:existente?.tri2??0, tri3:existente?.tri3??0, ciclo:CICLO });
    } else if (trimestre==="t2") {
      if (tri2==="") { toast.error("Ingresa la calificación del 2do trimestre"); return; }
      if (isNaN(Number(tri2))||Number(tri2)<0||Number(tri2)>10) { toast.error("Calificación entre 0 y 10"); return; }
      onSave({ alumnoId:alumno.id, materia, tri1:existente?.tri1??0, tri2:Number(tri2), tri3:existente?.tri3??0, ciclo:CICLO });
    } else {
      if (tri3==="") { toast.error("Ingresa la calificación del 3er trimestre"); return; }
      if (isNaN(Number(tri3))||Number(tri3)<0||Number(tri3)>10) { toast.error("Calificación entre 0 y 10"); return; }
      onSave({ alumnoId:alumno.id, materia, tri1:existente?.tri1??0, tri2:existente?.tri2??0, tri3:Number(tri3), ciclo:CICLO });
    }
  };

  const TL = { t1:"1er Trimestre", t2:"2do Trimestre", t3:"3er Trimestre" };

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{esEdicion?"✏️ Editar":"📝 Nueva"} calificación — {TL[trimestre]}</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div style={{padding:"10px 14px",background:"var(--bg-base)",borderRadius:10,marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:20}}>👨‍🎓</span>
          <div>
            <div style={{fontWeight:700}}>{alumno.nombre}</div>
            <div className="small muted">Grupo {alumno.grupo} · Ciclo {CICLO}</div>
          </div>
        </div>
        <div className="form-group" style={{marginBottom:14}}>
          <label className="form-label">Materia</label>
          {esEdicion||materiasDisponibles.length<=1
            ? <div style={{padding:"9px 12px",background:"var(--bg-base)",border:"1px solid var(--border)",borderRadius:8,fontWeight:700,fontSize:14}}>{materia}</div>
            : <select className="form-control" value={materia} onChange={e=>setMateria(e.target.value)}>
                {materiasDisponibles.length===0
                  ? <option>Todas registradas</option>
                  : materiasDisponibles.map(m=><option key={m} value={m}>{m}</option>)
                }
              </select>
          }
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">1er Trimestre</label>
            {trimestre==="t1"
              ? <input type="number" className="form-control" min="0" max="10" step="0.1" placeholder="0–10" value={tri1} onChange={e=>setTri1(e.target.value)}/>
              : <input className="form-control" readOnly value={tri1!==""?Number(tri1).toFixed(1):"—"} style={{background:"var(--bg-base)",color:tri1!==""?clrNum(Number(tri1)):"var(--text-muted)",fontWeight:700,textAlign:"center"}}/>
            }
          </div>
          {(trimestre==="t2"||trimestre==="t3") && (
            <div className="form-group">
              <label className="form-label">2do Trimestre</label>
              {trimestre==="t2"
                ? <input type="number" className="form-control" min="0" max="10" step="0.1" placeholder="0–10" value={tri2} onChange={e=>setTri2(e.target.value)}/>
                : <input className="form-control" readOnly value={tri2!==""?Number(tri2).toFixed(1):"—"} style={{background:"var(--bg-base)",color:tri2!==""?clrNum(Number(tri2)):"var(--text-muted)",fontWeight:700,textAlign:"center"}}/>
              }
            </div>
          )}
          {trimestre==="t3" && (
            <div className="form-group">
              <label className="form-label">3er Trimestre</label>
              <input type="number" className="form-control" min="0" max="10" step="0.1" placeholder="0–10" value={tri3} onChange={e=>setTri3(e.target.value)}/>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Promedio parcial</label>
            <input className="form-control" readOnly value={prom} style={{background:"var(--bg-base)",fontWeight:800,fontSize:18,color:colorProm,textAlign:"center"}}/>
          </div>
        </div>
        <div className="form-actions">
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSubmit}>{esEdicion?"💾 Guardar":"➕ Registrar"}</button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════
   MODAL DETALLE — boleta individual con selector de trimestre
════════════════════════════════════ */
function ModalDetalle({ alumno, califs, trimestre, onClose, onNueva, onEditar }) {
  const db = useAppDB();
  const [triDesc, setTriDesc] = useState(trimestre);

  const TL = { t1:"1er Trimestre", t2:"2do Trimestre", t3:"3er Trimestre", todos:"Completa" };

  const faltantesEnTri = MATERIAS.filter(m => {
    const c = califs.find(cx=>cx.materia===m);
    if (!c) return true;
    if (trimestre==="t1") return !valTri(c.tri1);
    if (trimestre==="t2") return !valTri(c.tri2);
    if (trimestre==="t3") return !valTri(c.tri3);
    return false;
  });

  const pct = Math.round((califs.length/MATERIAS.length)*100);

  const materiasOrdenadas = [
    ...MATERIAS.filter(m=>!califs.find(c=>c.materia===m)).map(m=>({m,c:null})),
    ...MATERIAS.filter(m=>califs.find(c=>c.materia===m)).map(m=>({m,c:califs.find(c=>c.materia===m)})),
  ];

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <div className="modal-title">📋 Calificaciones — {alumno.nombre}</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:14,padding:"12px 16px",background:"var(--bg-base)",borderRadius:12,marginBottom:16}}>
          <div className="av av-lg">{alumno.nombre.split(" ").map(w=>w[0]).slice(0,2).join("")}</div>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:16}}>{alumno.nombre}</div>
            <div className="small muted">Grupo {alumno.grupo} · Ciclo {CICLO}</div>
          </div>
        </div>

        <div style={{marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:13}}>
            <span style={{fontWeight:600}}>Materias registradas</span>
            <span style={{color:"var(--text-muted)"}}>{califs.length}/{MATERIAS.length}</span>
          </div>
          <div style={{background:"var(--border)",borderRadius:999,height:8,overflow:"hidden"}}>
            <div style={{width:`${pct}%`,background:pct===100?"#3a7a5a":"var(--accent)",height:"100%",borderRadius:999,transition:"width .4s"}}/>
          </div>
          {faltantesEnTri.length>0
            ? <div style={{marginTop:6,fontSize:12,color:"#92400e",fontWeight:600}}>⚠️ Pendientes en {TL[trimestre]}: {faltantesEnTri.join(", ")}</div>
            : <div style={{marginTop:6,fontSize:12,color:"#15803d",fontWeight:600}}>✅ Todas calificadas en {TL[trimestre]}</div>
          }
        </div>

        <div className="table-wrap" style={{marginBottom:14}}>
          <table>
            <thead>
              <tr>
                <th>Materia</th>
                <th style={{textAlign:"center"}}>1er Trim.</th>
                {(trimestre==="t2"||trimestre==="t3"||trimestre==="todos") && <th style={{textAlign:"center"}}>2do Trim.</th>}
                {(trimestre==="t3"||trimestre==="todos") && <th style={{textAlign:"center"}}>3er Trim.</th>}
                <th style={{textAlign:"center"}}>Promedio</th>
                <th style={{textAlign:"center"}}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {materiasOrdenadas.map(({m,c})=>{
                if (!c) return (
                  <tr key={m} style={{background:"#fffbeb"}}>
                    <td><span style={{color:"#d97706"}}>⚠️</span> <span style={{fontWeight:600,color:"#92400e"}}>{m}</span> <span className="badge badge-warning" style={{fontSize:10}}>Pendiente</span></td>
                    <td style={{textAlign:"center",color:"var(--text-muted)"}}>—</td>
                    {(trimestre==="t2"||trimestre==="t3"||trimestre==="todos") && <td style={{textAlign:"center",color:"var(--text-muted)"}}>—</td>}
                    {(trimestre==="t3"||trimestre==="todos") && <td style={{textAlign:"center",color:"var(--text-muted)"}}>—</td>}
                    <td style={{textAlign:"center",color:"var(--text-muted)"}}>—</td>
                    <td style={{textAlign:"center"}}><button className="btn btn-sm btn-primary" onClick={()=>{onClose();onNueva(alumno,[m]);}}>➕ Registrar</button></td>
                  </tr>
                );
                const p = promTri(c,"todos");
                return (
                  <tr key={m}>
                    <td><span style={{color:"#15803d"}}>✅</span> <span style={{fontWeight:600}}>{m}</span></td>
                    <td style={{textAlign:"center"}}>{valTri(c.tri1)?Number(c.tri1).toFixed(1):"—"}</td>
                    {(trimestre==="t2"||trimestre==="t3"||trimestre==="todos") && <td style={{textAlign:"center"}}>{valTri(c.tri2)?Number(c.tri2).toFixed(1):"—"}</td>}
                    {(trimestre==="t3"||trimestre==="todos") && <td style={{textAlign:"center"}}>{valTri(c.tri3)?Number(c.tri3).toFixed(1):"—"}</td>}
                    <td style={{textAlign:"center"}}><strong style={{color:clrNum(p??0),fontSize:15}}>{p??'—'}</strong></td>
                    <td style={{textAlign:"center"}}><button className="btn btn-sm btn-primary" onClick={()=>{onClose();onEditar(c);}}>✏️ Editar</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Descarga boleta */}
        <div style={{background:"var(--bg-base)",border:"1px solid var(--border)",borderRadius:10,padding:"12px 14px"}}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:10}}>📄 Descargar Boleta PDF</div>
          <div style={{fontSize:12,color:"var(--text-muted)",marginBottom:8}}>
            Selecciona el trimestre. Solo se imprimirán las materias que tengan calificación en ese periodo.
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
            <span className="small" style={{color:"var(--text-muted)"}}>Periodo:</span>
            {[
              {v:"t1",lbl:"1er Trimestre"},
              {v:"t2",lbl:"2do Trimestre"},
              {v:"t3",lbl:"3er Trimestre"},
              {v:"todos",lbl:"Completa (T1+T2+T3)"},
            ].map(({v,lbl})=>(
              <button key={v} className={`btn btn-sm ${triDesc===v?"btn-primary":""}`} onClick={()=>setTriDesc(v)}>{lbl}</button>
            ))}
            <button className="btn btn-primary" style={{marginLeft:"auto"}}
              onClick={()=>{generarBoletaPDF(alumno,db,triDesc);toast.success("Abriendo boleta…");}}>
              📄 Descargar PDF
            </button>
          </div>
        </div>

        <div className="form-actions">
          <button className="btn" onClick={onClose}>Cerrar</button>
          {faltantesEnTri.length>0 && (
            <button className="btn btn-primary" onClick={()=>{onClose();onNueva(alumno,faltantesEnTri);}}>
              ➕ Agregar pendiente de {TL[trimestre]}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════
   VISTA PRINCIPAL
════════════════════════════════════ */
function Calificaciones() {
  const db = useAppDB();
  const [grupoId,   setGrupoId]   = useState(db.grupos?.[0]?.id ?? "");
  const [busqueda,  setBusqueda]  = useState("");
  const [trimestre, setTrimestre] = useState("t1");
  const [modal,     setModal]     = useState(null);

  const alumnos = db.alumnos.filter(
    a=>a.grupo===grupoId && a.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleSave = (data) => {
    db.guardarCalificacion(data);
    toast.success("✅ Calificación guardada");
    /* No cerramos todo: regresamos a la ficha de calificaciones del
       alumno para que se pueda seguir registrando sin reabrir nada */
    const alumno = modal?.alumno;
    setModal(alumno ? { tipo:"detalle", alumno } : null);
  };

  const califsDeAlumno = (id) => db.calificaciones.filter(c=>c.alumnoId===id && c.ciclo===CICLO);

  const pendientesEnTri = (id) => {
    const califs = califsDeAlumno(id);
    return MATERIAS.filter(m => {
      const c = califs.find(cx=>cx.materia===m);
      if (!c) return true;
      if (trimestre==="t1") return !valTri(c.tri1);
      if (trimestre==="t2") return !valTri(c.tri2);
      if (trimestre==="t3") return !valTri(c.tri3);
      return false;
    });
  };

  const abrirDetalle = (a)  => setModal({tipo:"detalle",alumno:a});
  const abrirNueva   = (a,d)=> setModal({tipo:"nueva",alumno:a,materiasDisponibles:d});
  const abrirEditar  = (c)  => setModal({tipo:"editar",alumno:db.alumnos.find(a=>a.id===c.alumnoId),califExistente:c,materiasDisponibles:[]});

  const todosProms  = db.alumnos.map(a=>db.promedioAlumno(a.id)).filter(Boolean);
  const promGeneral = todosProms.length ? (todosProms.reduce((a,b)=>a+b,0)/todosProms.length).toFixed(1) : "—";
  const aprobados   = db.alumnos.filter(a=>{const p=db.promedioAlumno(a.id);return p!==null&&p>=6;}).length;
  const reprobados  = db.alumnos.filter(a=>{const p=db.promedioAlumno(a.id);return p!==null&&p<6;}).length;

  const TL = { t1:"1er Trimestre", t2:"2do Trimestre", t3:"3er Trimestre" };

  return (
    <Layout title="Calificaciones">
      <div className="stat-grid mb-24">
        <div className="stat-card"><div className="stat-icon" style={{background:"#e8e0f5"}}>📊</div><div className="stat-label">Promedio General</div><div className="stat-value">{promGeneral}</div><div className="stat-sub">Ciclo {CICLO}</div></div>
        <div className="stat-card"><div className="stat-icon" style={{background:"#d6eed9"}}>✅</div><div className="stat-label">Aprobados</div><div className="stat-value" style={{color:"#3a7a5a"}}>{aprobados}</div><div className="stat-sub">Promedio ≥ 6.0</div></div>
        <div className="stat-card"><div className="stat-icon" style={{background:"#f5dede"}}>❌</div><div className="stat-label">Reprobados</div><div className="stat-value" style={{color:"#8a3a3a"}}>{reprobados}</div><div className="stat-sub">Promedio {"<"} 6.0</div></div>
        <div className="stat-card"><div className="stat-icon" style={{background:"#dde6f5"}}>🏫</div><div className="stat-label">Grupos</div><div className="stat-value">{db.grupos.length}</div><div className="stat-sub">1° a 6° grado</div></div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">📋 Calificaciones · Ciclo {CICLO}</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
            <div style={{display:"flex",gap:4,background:"var(--bg-base)",borderRadius:8,padding:4}}>
              {["t1","t2","t3"].map(t=>(
                <button key={t} className={`btn btn-sm ${trimestre===t?"btn-primary":""}`}
                  onClick={()=>setTrimestre(t)} style={{fontSize:12}}>{TL[t]}</button>
              ))}
            </div>
            <select className="form-control" style={{width:140}} value={grupoId} onChange={e=>setGrupoId(e.target.value)}>
              {db.grupos.map(g=><option key={g.id} value={g.id}>{g.nombre}</option>)}
            </select>
            <input className="form-control" style={{width:200}} placeholder="🔍 Buscar alumno..." value={busqueda} onChange={e=>setBusqueda(e.target.value)}/>
            <button className="btn btn-sm btn-primary"
              onClick={()=>{
                const g=db.grupos.find(x=>x.id===grupoId);
                const m=db.maestros.find(x=>x.id===g?.maestroId);
                generarBoletaGrupoPDF(g,m,alumnos,db.calificaciones,trimestre);
                toast.success("Generando boleta del grupo…");
              }}>
              📄 Boleta del grupo ({TL[trimestre]})
            </button>
            <button className="btn btn-sm"
              onClick={()=>{
                const g=db.grupos.find(x=>x.id===grupoId);
                const m=db.maestros.find(x=>x.id===g?.maestroId);
                generarBoletaGrupoPDF(g,m,alumnos,db.calificaciones,"todos");
                toast.success("Generando boleta completa del grupo…");
              }}>
              📄 Boleta completa (3 trimestres)
            </button>
          </div>
        </div>

        <div style={{padding:"8px 16px",marginBottom:8,background:"#eff6ff",borderRadius:8,border:"1px solid #93c5fd",fontSize:13,display:"flex",alignItems:"center",gap:8}}>
          <span>📌</span>
          <span>Trimestre activo: <strong>{TL[trimestre]}</strong>. La columna "Pendientes" muestra cuántas materias faltan en este trimestre.</span>
        </div>

        {alumnos.length===0
          ? <div className="empty-state"><div className="empty-icon">📚</div><div className="empty-title">No hay alumnos en este grupo</div></div>
          : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Alumno</th>
                    <th style={{textAlign:"center"}}>Materias</th>
                    <th style={{textAlign:"center"}}>Pendientes en {TL[trimestre]}</th>
                    <th style={{minWidth:140}}>Progreso</th>
                    <th style={{textAlign:"center"}}>Promedio</th>
                    <th style={{textAlign:"center"}}>Estado</th>
                    <th style={{textAlign:"center"}}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {alumnos.map(a=>{
                    const califs   = califsDeAlumno(a.id);
                    const pendTri  = pendientesEnTri(a.id);
                    const prom     = db.promedioAlumno(a.id);
                    const pct      = Math.round((califs.length/MATERIAS.length)*100);
                    const aprobado = prom!==null&&prom>=6;
                    const triListo = pendTri.length===0;
                    return (
                      <tr key={a.id}>
                        <td><div style={{fontWeight:600}}>{a.nombre}</div><div className="small muted">Grupo {a.grupo}</div></td>
                        <td style={{textAlign:"center"}}><div style={{fontWeight:700}}>{califs.length}<span className="muted">/{MATERIAS.length}</span></div></td>
                        <td style={{textAlign:"center"}}>
                          {triListo
                            ? <span className="badge badge-success" style={{fontSize:11}}>✅ Listo</span>
                            : <span style={{fontWeight:700,color:"#d97706"}}>{pendTri.length}</span>
                          }
                        </td>
                        <td>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <div style={{flex:1,background:"var(--border)",borderRadius:999,height:7,overflow:"hidden"}}>
                              <div style={{width:`${pct}%`,background:pct===100?"#3a7a5a":"var(--accent)",height:"100%",borderRadius:999}}/>
                            </div>
                            <span className="small" style={{minWidth:32,color:pct===100?"#3a7a5a":"var(--text-muted)"}}>{pct}%</span>
                          </div>
                        </td>
                        <td style={{textAlign:"center"}}><strong style={{color:prom?clrNum(prom):"var(--text-muted)",fontSize:15}}>{prom?prom.toFixed(1):"—"}</strong></td>
                        <td style={{textAlign:"center"}}><span className={`badge badge-${aprobado?"success":prom===null?"gray":"danger"}`}>{prom===null?"Sin datos":aprobado?"Aprobado":"Reprobado"}</span></td>
                        <td style={{textAlign:"center"}}>
                          <div style={{display:"flex",gap:5,justifyContent:"center",flexWrap:"wrap"}}>
                            <button className="btn btn-sm" onClick={()=>abrirDetalle(a)}>📋 Ver</button>
                            {triListo
                              ? <span className="badge badge-success" style={{padding:"5px 8px",fontSize:11}}>✅ {TL[trimestre].split(" ")[0]}</span>
                              : <button className="btn btn-sm btn-primary" onClick={()=>abrirNueva(a,pendTri)}>➕ {pendTri.length}</button>
                            }
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        }
      </div>

      {modal?.tipo==="detalle" && (
        <ModalDetalle alumno={modal.alumno} califs={califsDeAlumno(modal.alumno.id)} trimestre={trimestre}
          onClose={()=>setModal(null)} onNueva={abrirNueva} onEditar={abrirEditar}/>
      )}
      {(modal?.tipo==="nueva"||modal?.tipo==="editar") && (
        <ModalCalificacion alumno={modal.alumno} califExistente={modal.califExistente}
          materiasDisponibles={modal.materiasDisponibles} trimestre={trimestre}
          onClose={()=>setModal(null)} onSave={handleSave}/>
      )}
    </Layout>
  );
}

export default Calificaciones;
