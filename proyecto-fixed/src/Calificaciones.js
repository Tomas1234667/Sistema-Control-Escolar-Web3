import React, { useState } from "react";
import toast from "react-hot-toast";
import { useAppDB, Layout } from "./App";

const CICLO = "2026-2027";

// Quitamos "Inglés" y "Conocimiento del Medio"
const MATERIAS = [
  "Matemáticas","Español","Ciencias Naturales",
  "Historia","Geografía","Formación Cívica y Ética","Educación Artística",
  "Educación Física",
];

/* ════════════════════════════════════════════════
   UTILIDADES
════════════════════════════════════════════════ */
const color = (n) =>
  n >= 9 ? "#2d6a3a" : n >= 8 ? "#3a7a5a" : n >= 7 ? "#8a6a20" : n >= 6 ? "#b05a10" : "#8a3a3a";

const promCalif = (c) =>
  +((Number(c.tri1) + Number(c.tri2) + Number(c.tri3)) / 3).toFixed(1);

// Retorna qué trimestres tiene calificados una calificación
const tieneTri = (c, t) => {
  if (t === "t1") return c.tri1 !== "" && c.tri1 !== null && c.tri1 !== undefined;
  if (t === "t2") return c.tri2 !== "" && c.tri2 !== null && c.tri2 !== undefined;
  if (t === "t3") return c.tri3 !== "" && c.tri3 !== null && c.tri3 !== undefined;
  return false;
};

/* ════════════════════════════════════════════════
   DESCARGA DE BOLETA PDF (ventana emergente)
════════════════════════════════════════════════ */
function generarBoletaPDF(alumno, db, trimestreFiltro) {
  const grupo   = db.grupos.find(g => g.id === alumno.grupo);
  const maestro = db.maestros.find(m => m.id === grupo?.maestroId);
  const todas   = db.calificaciones.filter(c => c.alumnoId === alumno.id && c.ciclo === CICLO);

  // Para "faltantes" en boleta usamos MATERIAS (sin Inglés ni Conocimiento del Medio)
  const materiasFaltantes = MATERIAS.filter(m => !todas.find(c => c.materia === m));
  const promGeneral = todas.length
    ? (todas.map(promCalif).reduce((a,b)=>a+b,0)/todas.length).toFixed(2)
    : "—";

  const fechaHoy = new Date().toLocaleDateString("es-MX", {
    year:"numeric", month:"long", day:"numeric"
  });

  const triLabel = { t1:"1er Trimestre", t2:"2do Trimestre", t3:"3er Trimestre", todos:"Todos los trimestres" };

  const filaMateria = (c) => {
    const p = promCalif(c);
    const col = color(p);
    const tri1 = trimestreFiltro === "t2" || trimestreFiltro === "t3" || trimestreFiltro === "todos"
      ? `<td style="text-align:center">${Number(c.tri1).toFixed(1)}</td>` : "";
    const tri2 = trimestreFiltro === "t2" || trimestreFiltro === "t3" || trimestreFiltro === "todos"
      ? `<td style="text-align:center">${Number(c.tri2).toFixed(1)}</td>` : "";
    const tri3 = trimestreFiltro === "t3" || trimestreFiltro === "todos"
      ? `<td style="text-align:center">${Number(c.tri3).toFixed(1)}</td>` : "";

    const cols = trimestreFiltro === "t1" ? `<td style="text-align:center;font-weight:700;color:${color(Number(c.tri1))}">${Number(c.tri1).toFixed(1)}</td>` :
                 trimestreFiltro === "t2" ? `${tri1}<td style="text-align:center;font-weight:700;color:${color(Number(c.tri2))}">${Number(c.tri2).toFixed(1)}</td>` :
                 trimestreFiltro === "t3" ? `${tri1}${tri2}<td style="text-align:center;font-weight:700;color:${color(Number(c.tri3))}">${Number(c.tri3).toFixed(1)}</td>` :
                 `${tri1}${tri2}${tri3}<td style="text-align:center;font-weight:800;color:${col}">${p}</td>`;

    return `<tr><td style="font-weight:600">${c.materia}</td>${cols}</tr>`;
  };

  const thCols = trimestreFiltro === "t1" ? "<th>1er Trimestre</th>" :
                 trimestreFiltro === "t2" ? "<th>1er Trimestre</th><th>2do Trimestre</th>" :
                 trimestreFiltro === "t3" ? "<th>1er Trimestre</th><th>2do Trimestre</th><th>3er Trimestre</th>" :
                 "<th>1er Trim.</th><th>2do Trim.</th><th>3er Trim.</th><th>Promedio</th>";

  const faltantesHTML = materiasFaltantes.length > 0
    ? `<div class="alert">
        <div class="alert-title">⚠️ Materias pendientes de calificar (${materiasFaltantes.length})</div>
        <div style="margin-top:6px">${materiasFaltantes.map(m=>`<span class="chip">${m}</span>`).join("")}</div>
       </div>`
    : `<div class="alert ok"><div class="alert-title">✅ Todas las materias están calificadas</div></div>`;

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<title>Boleta ${triLabel[trimestreFiltro]} — ${alumno.nombre}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Plus Jakarta Sans',Arial,sans-serif;color:#2d2d2d;background:#fff;padding:28px;font-size:13px}
  .header{display:flex;align-items:center;gap:18px;border-bottom:3px solid #4a6fa5;padding-bottom:14px;margin-bottom:18px}
  .escudo{width:58px;height:58px;background:#4a6fa5;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;color:#fff;flex-shrink:0}
  .escuela-info h1{font-size:17px;font-weight:800;color:#4a6fa5}
  .escuela-info p{font-size:11px;color:#5a5a5a;margin-top:2px}
  .periodo-badge{margin-left:auto;background:#4a6fa5;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;white-space:nowrap}
  h2{font-size:13px;font-weight:700;color:#4a6fa5;margin:14px 0 6px;border-left:4px solid #4a6fa5;padding-left:8px;text-transform:uppercase;letter-spacing:.5px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:14px}
  .field{padding:6px 10px;background:#f5f0e8;border-radius:6px}
  .field label{font-size:10px;font-weight:700;color:#5a5a5a;text-transform:uppercase;letter-spacing:.5px}
  .field span{display:block;font-weight:600;font-size:13px;margin-top:2px}
  table{width:100%;border-collapse:collapse;margin-bottom:14px;font-size:12px}
  th{background:#2c3a4a;color:#e8edf2;padding:8px 10px;text-align:left;font-size:11px;font-weight:700;letter-spacing:.3px}
  th:not(:first-child){text-align:center}
  td{padding:7px 10px;border-bottom:1px solid #e0dbd0}
  tr:nth-child(even) td{background:#faf8f4}
  .resumen{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px}
  .res-card{padding:10px;border-radius:8px;text-align:center;background:#f5f0e8;border:1px solid #d8d2c6}
  .res-card .val{font-size:22px;font-weight:800}
  .res-card .lbl{font-size:10px;color:#5a5a5a;margin-top:2px}
  .alert{padding:10px 14px;border-radius:8px;background:#fef3c7;border:1px solid #d8c080;margin-bottom:12px}
  .alert.ok{background:#dcfce7;border-color:#86efac}
  .alert-title{font-weight:700;font-size:13px}
  .chip{display:inline-block;padding:2px 8px;border-radius:5px;font-size:11px;font-weight:600;background:#ffe4b5;color:#8a5a10;margin:2px}
  .firma{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:24px}
  .firma-box{text-align:center;border-top:1px solid #2d2d2d;padding-top:6px;font-size:11px;color:#5a5a5a}
  .footer{margin-top:18px;text-align:center;font-size:11px;color:#8a8a8a;border-top:1px solid #d8d2c6;padding-top:8px}
  @media print{body{padding:14px}button{display:none!important}}
</style>
</head>
<body>
<div class="header">
  <div class="escudo">🏫</div>
  <div class="escuela-info">
    <h1>Escuela Primaria EduGestión</h1>
    <p>Ciudad Juárez, Chihuahua · Turno Vespertino · Ciclo ${CICLO}</p>
    <p>Boleta emitida el ${fechaHoy}</p>
  </div>
  <div class="periodo-badge">📄 ${triLabel[trimestreFiltro]}</div>
</div>

<h2>Datos del Alumno</h2>
<div class="grid">
  <div class="field"><label>Nombre completo</label><span>${alumno.nombre}</span></div>
  <div class="field"><label>CURP</label><span style="font-size:11px">${alumno.curp || "—"}</span></div>
  <div class="field"><label>Grupo</label><span>${alumno.grupo} — ${grupo?.nombre || ""}</span></div>
  <div class="field"><label>Maestro titular</label><span>${maestro?.nombre || "—"}</span></div>
  <div class="field"><label>Fecha de nacimiento</label><span>${alumno.fechaNac}</span></div>
  <div class="field"><label>Tutor</label><span>${alumno.tutor}</span></div>
</div>

<h2>Calificaciones — ${triLabel[trimestreFiltro]}</h2>
${faltantesHTML}
${todas.length === 0
  ? `<p style="color:#8a8a8a;padding:10px 0">Sin calificaciones registradas en este ciclo.</p>`
  : `<table>
      <thead><tr><th>Materia</th>${thCols}</tr></thead>
      <tbody>${todas.map(filaMateria).join("")}</tbody>
     </table>`
}

<h2>Resumen</h2>
<div class="resumen">
  <div class="res-card">
    <div class="val" style="color:${Number(promGeneral)>=8?"#2d6a3a":Number(promGeneral)>=6?"#8a6a20":"#8a3a3a"}">${promGeneral}</div>
    <div class="lbl">Promedio general</div>
  </div>
  <div class="res-card">
    <div class="val" style="color:${todas.length===MATERIAS.length?"#2d6a3a":"#8a6a20"}">${todas.length}/${MATERIAS.length}</div>
    <div class="lbl">Materias registradas</div>
  </div>
  <div class="res-card">
    <div class="val" style="color:${materiasFaltantes.length===0?"#2d6a3a":"#8a3a3a"}">${materiasFaltantes.length}</div>
    <div class="lbl">Materias pendientes</div>
  </div>
</div>

<div class="firma">
  <div class="firma-box">
    <p>Firma del Maestro Titular</p>
    <p style="margin-top:4px;font-weight:600">${maestro?.nombre || "___________________"}</p>
  </div>
  <div class="firma-box">
    <p>Firma del Director(a)</p>
    <p style="margin-top:4px;font-weight:600">Ma. Norma Alvarez</p>
  </div>
</div>

<div class="footer">EduGestión · Sistema de Control Escolar · Ciudad Juárez, Chihuahua · ${fechaHoy}</div>
<script>window.onload = () => window.print();</script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=960,height=720");
  win.document.write(html);
  win.document.close();
}

/* ════════════════════════════════════════════════
   MODAL REGISTRAR / EDITAR UNA MATERIA
   Ahora por trimestre: solo pide los campos del trimestre activo.
   T1 → solo tri1
   T2 → tri1 (solo lectura si ya existe) + tri2
   T3 → tri1+tri2 (solo lectura) + tri3
════════════════════════════════════════════════ */
function ModalCalificacion({ alumno, califExistente, materiasDisponibles, trimestre, onClose, onSave }) {
  const esEdicion = !!califExistente;

  const [materia, setMateria] = useState(califExistente?.materia || materiasDisponibles[0] || "");
  // Valores existentes (para mostrar en solo lectura si ya hay datos)
  const [tri1, setTri1] = useState(califExistente?.tri1 ?? "");
  const [tri2, setTri2] = useState(califExistente?.tri2 ?? "");
  const [tri3, setTri3] = useState(califExistente?.tri3 ?? "");

  // Promedio parcial según trimestre activo
  const calcProm = () => {
    if (trimestre === "t1" && tri1 !== "") return Number(tri1).toFixed(1);
    if (trimestre === "t2" && tri1 !== "" && tri2 !== "")
      return ((Number(tri1)+Number(tri2))/2).toFixed(1);
    if (trimestre === "t3" && tri1 !== "" && tri2 !== "" && tri3 !== "")
      return ((Number(tri1)+Number(tri2)+Number(tri3))/3).toFixed(1);
    return "—";
  };
  const prom = calcProm();
  const colorProm = prom !== "—" ? color(Number(prom)) : "inherit";

  const handleSubmit = () => {
    if (!materia) { toast.error("Selecciona una materia"); return; }

    // Validar solo el campo del trimestre activo (los anteriores ya están guardados)
    if (trimestre === "t1") {
      if (tri1 === "") { toast.error("Ingresa la calificación del 1er trimestre"); return; }
      if (isNaN(Number(tri1)) || Number(tri1)<0 || Number(tri1)>10) { toast.error("Calificación entre 0 y 10"); return; }
      // Para t1, tri2 y tri3 los guardamos como 0 temporalmente (se llenarán después)
      onSave({ alumnoId:alumno.id, materia, tri1:Number(tri1), tri2: califExistente?.tri2 ?? 0, tri3: califExistente?.tri3 ?? 0, ciclo:CICLO, _trimestreRegistrado:"t1" });
    } else if (trimestre === "t2") {
      if (tri2 === "") { toast.error("Ingresa la calificación del 2do trimestre"); return; }
      if (isNaN(Number(tri2)) || Number(tri2)<0 || Number(tri2)>10) { toast.error("Calificación entre 0 y 10"); return; }
      onSave({ alumnoId:alumno.id, materia, tri1: Number(tri1), tri2:Number(tri2), tri3: califExistente?.tri3 ?? 0, ciclo:CICLO, _trimestreRegistrado:"t2" });
    } else if (trimestre === "t3") {
      if (tri3 === "") { toast.error("Ingresa la calificación del 3er trimestre"); return; }
      if (isNaN(Number(tri3)) || Number(tri3)<0 || Number(tri3)>10) { toast.error("Calificación entre 0 y 10"); return; }
      onSave({ alumnoId:alumno.id, materia, tri1: Number(tri1), tri2:Number(tri2), tri3:Number(tri3), ciclo:CICLO, _trimestreRegistrado:"t3" });
    }
  };

  const triLabel = { t1:"1er Trimestre", t2:"2do Trimestre", t3:"3er Trimestre" };

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{esEdicion ? "✏️ Editar calificación" : "📝 Nueva calificación"} — {triLabel[trimestre]}</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        <div style={{padding:"10px 14px",background:"var(--bg-base)",borderRadius:10,
          marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:20}}>👨‍🎓</span>
          <div>
            <div style={{fontWeight:700}}>{alumno.nombre}</div>
            <div className="small muted">Grupo {alumno.grupo} · Ciclo {CICLO}</div>
          </div>
        </div>

        <div className="form-group" style={{marginBottom:14}}>
          <label className="form-label">Materia</label>
          {esEdicion || materiasDisponibles.length <= 1
            ? <div style={{padding:"9px 12px",background:"var(--bg-base)",border:"1px solid var(--border)",
                borderRadius:8,fontWeight:700,fontSize:14}}>{materia}</div>
            : <select className="form-control" value={materia} onChange={e=>setMateria(e.target.value)}>
                {materiasDisponibles.length === 0
                  ? <option>Todas registradas</option>
                  : materiasDisponibles.map(m=><option key={m} value={m}>{m}</option>)
                }
              </select>
          }
        </div>

        <div className="form-grid">
          {/* 1er trimestre */}
          <div className="form-group">
            <label className="form-label">1er Trimestre</label>
            {trimestre === "t1"
              ? <input type="number" className="form-control" min="0" max="10" step="0.1"
                  placeholder="0 – 10" value={tri1} onChange={e=>setTri1(e.target.value)}/>
              : <input className="form-control" readOnly value={tri1 !== "" ? Number(tri1).toFixed(1) : "—"}
                  style={{background:"var(--bg-base)",color:tri1!==""?color(Number(tri1)):"var(--text-muted)",fontWeight:700,textAlign:"center"}}/>
            }
          </div>

          {/* 2do trimestre — visible solo desde T2 */}
          {(trimestre === "t2" || trimestre === "t3") && (
            <div className="form-group">
              <label className="form-label">2do Trimestre</label>
              {trimestre === "t2"
                ? <input type="number" className="form-control" min="0" max="10" step="0.1"
                    placeholder="0 – 10" value={tri2} onChange={e=>setTri2(e.target.value)}/>
                : <input className="form-control" readOnly value={tri2 !== "" ? Number(tri2).toFixed(1) : "—"}
                    style={{background:"var(--bg-base)",color:tri2!==""?color(Number(tri2)):"var(--text-muted)",fontWeight:700,textAlign:"center"}}/>
              }
            </div>
          )}

          {/* 3er trimestre — visible solo en T3 */}
          {trimestre === "t3" && (
            <div className="form-group">
              <label className="form-label">3er Trimestre</label>
              <input type="number" className="form-control" min="0" max="10" step="0.1"
                placeholder="0 – 10" value={tri3} onChange={e=>setTri3(e.target.value)}/>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Promedio parcial</label>
            <input className="form-control" readOnly value={prom}
              style={{background:"var(--bg-base)",fontWeight:800,fontSize:18,
                color:colorProm,textAlign:"center"}}/>
          </div>
        </div>

        <div className="form-actions">
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            {esEdicion ? "💾 Guardar cambios" : "➕ Registrar"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   MODAL DETALLE ALUMNO — tabla por materia + descarga
════════════════════════════════════════════════ */
function ModalDetalle({ alumno, califs, trimestre, onClose, onNueva, onEditar }) {
  const db = useAppDB();
  const [trimDescarga, setTrimDescarga] = useState("todos");

  const registradas  = new Set(califs.map(c=>c.materia));
  const pendientes   = MATERIAS.filter(m=>!registradas.has(m));

  // Materias que faltan en el trimestre actual (pueden estar registradas pero sin ese tri)
  const faltantesEnTrimestre = MATERIAS.filter(m => {
    const c = califs.find(cx => cx.materia === m);
    if (!c) return true; // no registrada en absoluto
    // Verificar si tiene el trimestre actual
    if (trimestre === "t1" && (c.tri1 === "" || c.tri1 === null || c.tri1 === undefined)) return true;
    if (trimestre === "t2" && (c.tri2 === "" || c.tri2 === null || c.tri2 === undefined || c.tri2 === 0)) return true;
    if (trimestre === "t3" && (c.tri3 === "" || c.tri3 === null || c.tri3 === undefined || c.tri3 === 0)) return true;
    return false;
  });

  const pct = Math.round((califs.length/MATERIAS.length)*100);
  const promGeneral = califs.length
    ? (califs.map(promCalif).reduce((a,b)=>a+b,0)/califs.length).toFixed(1)
    : null;

  const materiasOrdenadas = [
    ...pendientes.map(m=>({ materia:m, calif:null })),
    ...MATERIAS.filter(m=>registradas.has(m)).map(m=>({ materia:m, calif:califs.find(c=>c.materia===m) })),
  ];

  const triLabel = { t1:"1er Trimestre", t2:"2do Trimestre", t3:"3er Trimestre", todos:"Todos" };

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <div className="modal-title">📋 Calificaciones — {alumno.nombre}</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:14,padding:"12px 16px",
          background:"var(--bg-base)",borderRadius:12,marginBottom:16}}>
          <div className="av av-lg">
            {alumno.nombre.split(" ").map(w=>w[0]).slice(0,2).join("")}
          </div>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:16}}>{alumno.nombre}</div>
            <div className="small muted">Grupo {alumno.grupo} · Ciclo {CICLO}</div>
          </div>
          {promGeneral && (
            <div style={{textAlign:"center",padding:"8px 16px",background:"#fff",
              borderRadius:12,border:"1px solid var(--border)"}}>
              <div style={{fontSize:28,fontWeight:800,color:color(Number(promGeneral))}}>{promGeneral}</div>
              <div className="small muted">Promedio</div>
            </div>
          )}
        </div>

        {/* Progreso materias */}
        <div style={{marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:13}}>
            <span style={{fontWeight:600}}>Progreso de materias registradas</span>
            <span style={{color:"var(--text-muted)"}}>{califs.length}/{MATERIAS.length}</span>
          </div>
          <div style={{background:"var(--border)",borderRadius:999,height:8,overflow:"hidden"}}>
            <div style={{width:`${pct}%`,background:pct===100?"#3a7a5a":"var(--accent)",
              height:"100%",borderRadius:999,transition:"width .4s"}}/>
          </div>
          {faltantesEnTrimestre.length > 0
            ? <div style={{marginTop:6,fontSize:12,color:"#8a6a20",fontWeight:600}}>
                ⚠️ Pendientes en {triLabel[trimestre]}: {faltantesEnTrimestre.join(", ")}
              </div>
            : <div style={{marginTop:6,fontSize:12,color:"#2d6a3a",fontWeight:600}}>
                ✅ Todas las materias están calificadas en {triLabel[trimestre]}
              </div>
          }
        </div>

        {/* Tabla */}
        <div className="table-wrap" style={{marginBottom:14}}>
          <table>
            <thead>
              <tr>
                <th>Materia</th>
                <th style={{textAlign:"center"}}>1er Trim.</th>
                {(trimestre === "t2" || trimestre === "t3" || trimestre === "todos") &&
                  <th style={{textAlign:"center"}}>2do Trim.</th>}
                {(trimestre === "t3" || trimestre === "todos") &&
                  <th style={{textAlign:"center"}}>3er Trim.</th>}
                <th style={{textAlign:"center"}}>Promedio</th>
                <th style={{textAlign:"center"}}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {materiasOrdenadas.map(({materia:m, calif:c})=>{
                if (!c) {
                  return (
                    <tr key={m} style={{background:"#fffbeb"}}>
                      <td>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <span style={{color:"#d97706",fontSize:14}}>⚠️</span>
                          <span style={{fontWeight:600,color:"#8a6a20"}}>{m}</span>
                          <span className="badge badge-warning" style={{fontSize:10}}>Pendiente</span>
                        </div>
                      </td>
                      <td style={{textAlign:"center",color:"var(--text-muted)"}}>—</td>
                      {(trimestre === "t2" || trimestre === "t3" || trimestre === "todos") &&
                        <td style={{textAlign:"center",color:"var(--text-muted)"}}>—</td>}
                      {(trimestre === "t3" || trimestre === "todos") &&
                        <td style={{textAlign:"center",color:"var(--text-muted)"}}>—</td>}
                      <td style={{textAlign:"center",color:"var(--text-muted)"}}>—</td>
                      <td style={{textAlign:"center"}}>
                        <button className="btn btn-sm btn-primary"
                          onClick={()=>{onClose();onNueva(alumno,[m]);}}>
                          ➕ Registrar
                        </button>
                      </td>
                    </tr>
                  );
                }
                const p = promCalif(c);
                return (
                  <tr key={m}>
                    <td>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <span style={{color:"#3a7a5a",fontSize:14}}>✅</span>
                        <span style={{fontWeight:600}}>{m}</span>
                      </div>
                    </td>
                    <td style={{textAlign:"center"}}>{Number(c.tri1).toFixed(1)}</td>
                    {(trimestre === "t2" || trimestre === "t3" || trimestre === "todos") &&
                      <td style={{textAlign:"center"}}>{Number(c.tri2).toFixed(1)}</td>}
                    {(trimestre === "t3" || trimestre === "todos") &&
                      <td style={{textAlign:"center"}}>{Number(c.tri3).toFixed(1)}</td>}
                    <td style={{textAlign:"center"}}>
                      <strong style={{color:color(p),fontSize:15}}>{p}</strong>
                    </td>
                    <td style={{textAlign:"center"}}>
                      <button className="btn btn-sm btn-primary"
                        onClick={()=>{onClose();onEditar(c);}}>✏️ Editar</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Descarga boleta */}
        <div style={{background:"var(--bg-base)",border:"1px solid var(--border)",
          borderRadius:10,padding:"12px 14px"}}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:10}}>📄 Descargar Boleta</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
            <span className="small" style={{color:"var(--text-muted)"}}>Periodo:</span>
            {[
              {v:"t1",lbl:"1er Trimestre"},
              {v:"t2",lbl:"Hasta 2do"},
              {v:"t3",lbl:"Hasta 3er"},
              {v:"todos",lbl:"Completa"},
            ].map(({v,lbl})=>(
              <button key={v}
                className={`btn btn-sm ${trimDescarga===v?"btn-primary":""}`}
                onClick={()=>setTrimDescarga(v)}>
                {lbl}
              </button>
            ))}
            <button className="btn btn-primary" style={{marginLeft:"auto"}}
              onClick={()=>{
                generarBoletaPDF(alumno, db, trimDescarga);
                toast.success("Abriendo boleta para imprimir / guardar como PDF…");
              }}>
              📄 Descargar PDF
            </button>
          </div>
        </div>

        <div className="form-actions">
          <button className="btn" onClick={onClose}>Cerrar</button>
          {faltantesEnTrimestre.length > 0 && (
            <button className="btn btn-primary"
              onClick={()=>{onClose();onNueva(alumno,faltantesEnTrimestre);}}>
              ➕ Agregar pendiente del {triLabel[trimestre]}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   VISTA PRINCIPAL
════════════════════════════════════════════════ */
function Calificaciones() {
  const db = useAppDB();
  const [grupoId,   setGrupoId]   = useState(db.grupos?.[0]?.id ?? "");
  const [busqueda,  setBusqueda]  = useState("");
  const [trimestre, setTrimestre] = useState("t1"); // <-- selector de trimestre activo
  const [modal,     setModal]     = useState(null);

  const alumnos = db.alumnos.filter(
    a => a.grupo===grupoId && a.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleSave = (data) => {
    db.guardarCalificacion(data);
    toast.success("✅ Calificación guardada correctamente");
    setModal(null);
  };

  const califsDeAlumno = (alumnoId) =>
    db.calificaciones.filter(c=>c.alumnoId===alumnoId && c.ciclo===CICLO);

  // Materias que faltan registrar en el trimestre activo
  const pendientesEnTrimestre = (alumnoId) => {
    const califs = califsDeAlumno(alumnoId);
    return MATERIAS.filter(m => {
      const c = califs.find(cx => cx.materia === m);
      if (!c) return true; // nunca registrada
      if (trimestre === "t1" && (c.tri1 === "" || c.tri1 === null || c.tri1 === undefined)) return true;
      if (trimestre === "t2" && (c.tri2 === "" || c.tri2 === null || c.tri2 === undefined || c.tri2 === 0)) return true;
      if (trimestre === "t3" && (c.tri3 === "" || c.tri3 === null || c.tri3 === undefined || c.tri3 === 0)) return true;
      return false;
    });
  };

  const abrirDetalle = (alumno) => setModal({ tipo:"detalle", alumno });
  const abrirNueva   = (alumno, disponibles) => setModal({ tipo:"nueva", alumno, materiasDisponibles:disponibles });
  const abrirEditar  = (calif) => {
    const alumno = db.alumnos.find(a=>a.id===calif.alumnoId);
    setModal({ tipo:"editar", alumno, califExistente:calif, materiasDisponibles:[] });
  };

  // Stats
  const todosProms  = db.alumnos.map(a=>db.promedioAlumno(a.id)).filter(Boolean);
  const promGeneral = todosProms.length
    ? (todosProms.reduce((a,b)=>a+b,0)/todosProms.length).toFixed(1) : "—";
  const aprobados   = db.alumnos.filter(a=>{const p=db.promedioAlumno(a.id);return p!==null&&p>=6;}).length;
  const reprobados  = db.alumnos.filter(a=>{const p=db.promedioAlumno(a.id);return p!==null&&p<6;}).length;

  const triLabel = { t1:"1er Trimestre", t2:"2do Trimestre", t3:"3er Trimestre" };

  return (
    <Layout title="Calificaciones">
      {/* STATS */}
      <div className="stat-grid mb-24">
        <div className="stat-card">
          <div className="stat-icon" style={{background:"#e8e0f5"}}>📊</div>
          <div className="stat-label">Promedio General</div>
          <div className="stat-value">{promGeneral}</div>
          <div className="stat-sub">Ciclo {CICLO}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background:"#d6eed9"}}>✅</div>
          <div className="stat-label">Aprobados</div>
          <div className="stat-value" style={{color:"#3a7a5a"}}>{aprobados}</div>
          <div className="stat-sub">Promedio ≥ 6.0</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background:"#f5dede"}}>❌</div>
          <div className="stat-label">Reprobados</div>
          <div className="stat-value" style={{color:"#8a3a3a"}}>{reprobados}</div>
          <div className="stat-sub">Promedio {"<"} 6.0</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background:"#dde6f5"}}>🏫</div>
          <div className="stat-label">Grupos</div>
          <div className="stat-value">{db.grupos.length}</div>
          <div className="stat-sub">1° a 6° grado</div>
        </div>
      </div>

      {/* TABLA PRINCIPAL */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">📋 Calificaciones · Ciclo {CICLO}</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
            {/* Selector de trimestre activo */}
            <div style={{display:"flex",gap:4,background:"var(--bg-base)",borderRadius:8,padding:4}}>
              {["t1","t2","t3"].map(t=>(
                <button key={t}
                  className={`btn btn-sm ${trimestre===t?"btn-primary":""}`}
                  onClick={()=>setTrimestre(t)}
                  style={{fontSize:12}}>
                  {triLabel[t]}
                </button>
              ))}
            </div>
            <select className="form-control" style={{width:140}} value={grupoId}
              onChange={e=>setGrupoId(e.target.value)}>
              {db.grupos.map(g=><option key={g.id} value={g.id}>{g.nombre}</option>)}
            </select>
            <input className="form-control" style={{width:200}} placeholder="🔍 Buscar alumno..."
              value={busqueda} onChange={e=>setBusqueda(e.target.value)}/>
          </div>
        </div>

        {/* Indicador del trimestre activo */}
        <div style={{padding:"8px 16px",marginBottom:8,background:"#eff6ff",borderRadius:8,
          border:"1px solid #93c5fd",fontSize:13,display:"flex",alignItems:"center",gap:8}}>
          <span>📌</span>
          <span>Mostrando materias pendientes del <strong>{triLabel[trimestre]}</strong>.
            La columna "Pendientes" indica cuántas materias faltan en este trimestre.</span>
        </div>

        {alumnos.length===0
          ? <div className="empty-state">
              <div className="empty-icon">📚</div>
              <div className="empty-title">No hay alumnos en este grupo</div>
            </div>
          : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Alumno</th>
                    <th style={{textAlign:"center"}}>Materias totales</th>
                    <th style={{textAlign:"center"}}>Pendientes en {triLabel[trimestre]}</th>
                    <th style={{minWidth:140}}>Progreso</th>
                    <th style={{textAlign:"center"}}>Promedio</th>
                    <th style={{textAlign:"center"}}>Estado</th>
                    <th style={{textAlign:"center"}}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {alumnos.map(a=>{
                    const califs    = califsDeAlumno(a.id);
                    const pendTri   = pendientesEnTrimestre(a.id);
                    const prom      = db.promedioAlumno(a.id);
                    const pct       = Math.round((califs.length/MATERIAS.length)*100);
                    const aprobado  = prom!==null && prom>=6;
                    const triListo  = pendTri.length === 0;

                    return (
                      <tr key={a.id}>
                        <td>
                          <div style={{fontWeight:600}}>{a.nombre}</div>
                          <div className="small muted">Grupo {a.grupo}</div>
                        </td>

                        <td style={{textAlign:"center"}}>
                          <div style={{fontWeight:700}}>{califs.length}<span className="muted">/{MATERIAS.length}</span></div>
                        </td>

                        {/* Pendientes en trimestre activo */}
                        <td style={{textAlign:"center"}}>
                          {triListo
                            ? <span className="badge badge-success" style={{fontSize:11}}>✅ Listo</span>
                            : <span style={{fontWeight:700,color:"#d97706"}}>{pendTri.length}</span>
                          }
                        </td>

                        <td>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <div style={{flex:1,background:"var(--border)",borderRadius:999,height:7,overflow:"hidden"}}>
                              <div style={{width:`${pct}%`,
                                background:pct===100?"#3a7a5a":"var(--accent)",
                                height:"100%",borderRadius:999}}/>
                            </div>
                            <span className="small" style={{minWidth:32,color:pct===100?"#3a7a5a":"var(--text-muted)"}}>
                              {pct}%
                            </span>
                          </div>
                        </td>

                        <td style={{textAlign:"center"}}>
                          <strong style={{color:prom?color(prom):"var(--text-muted)",fontSize:15}}>
                            {prom ? prom.toFixed(1) : "—"}
                          </strong>
                        </td>

                        <td style={{textAlign:"center"}}>
                          <span className={`badge badge-${aprobado?"success":prom===null?"gray":"danger"}`}>
                            {prom===null ? "Sin datos" : aprobado ? "Aprobado" : "Reprobado"}
                          </span>
                        </td>

                        <td style={{textAlign:"center"}}>
                          <div style={{display:"flex",gap:5,justifyContent:"center",flexWrap:"wrap"}}>
                            <button className="btn btn-sm" onClick={()=>abrirDetalle(a)}
                              title="Ver todas las materias y descargar boleta">
                              📋 Ver
                            </button>
                            {triListo
                              ? <span className="badge badge-success" style={{padding:"5px 8px",fontSize:11}}>
                                  ✅ {triLabel[trimestre].split(" ")[0]}
                                </span>
                              : <button className="btn btn-sm btn-primary"
                                  onClick={()=>abrirNueva(a, pendTri)}
                                  title={`${pendTri.length} materia(s) sin registrar en ${triLabel[trimestre]}`}>
                                  ➕ {pendTri.length}
                                </button>
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

      {/* MODALES */}
      {modal?.tipo === "detalle" && (
        <ModalDetalle
          alumno={modal.alumno}
          califs={califsDeAlumno(modal.alumno.id)}
          trimestre={trimestre}
          onClose={()=>setModal(null)}
          onNueva={abrirNueva}
          onEditar={abrirEditar}
        />
      )}

      {(modal?.tipo === "nueva" || modal?.tipo === "editar") && (
        <ModalCalificacion
          alumno={modal.alumno}
          califExistente={modal.califExistente}
          materiasDisponibles={modal.materiasDisponibles}
          trimestre={trimestre}
          onClose={()=>setModal(null)}
          onSave={handleSave}
        />
      )}
    </Layout>
  );
}

export default Calificaciones;
