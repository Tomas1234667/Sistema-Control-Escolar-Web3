import { useState, useEffect, useCallback } from "react";
import { v4 as uuid } from "uuid";

const SCHEMA_VERSION = "v5"; // cambia esto cuando el seed cambia para forzar reset

const load = (key, fb) => {
  try { const r=localStorage.getItem(key); return r?JSON.parse(r):fb; }
  catch { return fb; }
};
const save = (key, v) => localStorage.setItem(key, JSON.stringify(v));

/* ── Forzar reset si la versión del schema cambió ── */
const checkReset = () => {
  const stored = localStorage.getItem("edu_schema");
  if (stored !== SCHEMA_VERSION) {
    // Limpiar SOLO los datos de maestros y grupos (para que el seed nuevo se aplique)
    // Los alumnos/asistencia/calificaciones del usuario se conservan si la versión es cercana
    localStorage.removeItem("edu_maestros");
    localStorage.removeItem("edu_grupos");
    localStorage.setItem("edu_schema", SCHEMA_VERSION);
  }
};
checkReset();

/* ════════════════════════════════════════
   12 GRUPOS
════════════════════════════════════════ */
const SEED_GRUPOS = [
  { id:"1A", nombre:"1° A", grado:1, salon:"Aula 1",  maestroId:"m1",  turno:"Matutino" },
  { id:"1B", nombre:"1° B", grado:1, salon:"Aula 2",  maestroId:"m2",  turno:"Matutino" },
  { id:"2A", nombre:"2° A", grado:2, salon:"Aula 3",  maestroId:"m3",  turno:"Matutino" },
  { id:"2B", nombre:"2° B", grado:2, salon:"Aula 4",  maestroId:"m4",  turno:"Matutino" },
  { id:"3A", nombre:"3° A", grado:3, salon:"Aula 5",  maestroId:"m5",  turno:"Matutino" },
  { id:"3B", nombre:"3° B", grado:3, salon:"Aula 6",  maestroId:"m6",  turno:"Matutino" },
  { id:"4A", nombre:"4° A", grado:4, salon:"Aula 7",  maestroId:"m7",  turno:"Matutino" },
  { id:"4B", nombre:"4° B", grado:4, salon:"Aula 8",  maestroId:"m8",  turno:"Matutino" },
  { id:"5A", nombre:"5° A", grado:5, salon:"Aula 9",  maestroId:"m9",  turno:"Matutino" },
  { id:"5B", nombre:"5° B", grado:5, salon:"Aula 10", maestroId:"m10", turno:"Matutino" },
  { id:"6A", nombre:"6° A", grado:6, salon:"Aula 11", maestroId:"m11", turno:"Matutino" },
  { id:"6B", nombre:"6° B", grado:6, salon:"Aula 12", maestroId:"m12", turno:"Matutino" },
];

/* ════════════════════════════════════════
   12 MAESTROS con usuario y contraseña
   usuario: m1…m12  |  contraseña: 1111
════════════════════════════════════════ */
const SEED_MAESTROS = [
  { id:"m1",  nombre:"Ana Lucía Ramírez Peña",    email:"aramirez@escuela.edu",   tel:"6561001001", grupo:"1A", usuario:"m1",  pass:"1111", activo:true },
  { id:"m2",  nombre:"Carlos Mendoza Herrera",     email:"cmendoza@escuela.edu",   tel:"6561001002", grupo:"1B", usuario:"m2",  pass:"1111", activo:true },
  { id:"m3",  nombre:"Patricia Soto Villanueva",   email:"psoto@escuela.edu",      tel:"6561001003", grupo:"2A", usuario:"m3",  pass:"1111", activo:true },
  { id:"m4",  nombre:"Javier Estrada Torres",      email:"jestrada@escuela.edu",   tel:"6561001004", grupo:"2B", usuario:"m4",  pass:"1111", activo:true },
  { id:"m5",  nombre:"María Fernanda Ríos Cano",   email:"mrios@escuela.edu",      tel:"6561001005", grupo:"3A", usuario:"m5",  pass:"1111", activo:true },
  { id:"m6",  nombre:"Roberto Leal Gutiérrez",     email:"rleal@escuela.edu",      tel:"6561001006", grupo:"3B", usuario:"m6",  pass:"1111", activo:true },
  { id:"m7",  nombre:"Verónica Castillo Morales",  email:"vcastillo@escuela.edu",  tel:"6561001007", grupo:"4A", usuario:"m7",  pass:"1111", activo:true },
  { id:"m8",  nombre:"Eduardo Salas Ortega",       email:"esalas@escuela.edu",     tel:"6561001008", grupo:"4B", usuario:"m8",  pass:"1111", activo:true },
  { id:"m9",  nombre:"Gabriela Núñez Espinoza",    email:"gnunez@escuela.edu",     tel:"6561001009", grupo:"5A", usuario:"m9",  pass:"1111", activo:true },
  { id:"m10", nombre:"Arturo Vega Domínguez",      email:"avega@escuela.edu",      tel:"6561001010", grupo:"5B", usuario:"m10", pass:"1111", activo:true },
  { id:"m11", nombre:"Silvia Guerrero Pacheco",    email:"sguerrero@escuela.edu",  tel:"6561001011", grupo:"6A", usuario:"m11", pass:"1111", activo:true },
  { id:"m12", nombre:"Hugo Flores Ibarra",         email:"hflores@escuela.edu",    tel:"6561001012", grupo:"6B", usuario:"m12", pass:"1111", activo:true },
];

/* ════════════════════════════════════════
   120 ALUMNOS — 10 exactos por grupo
════════════════════════════════════════ */
const NOMBRES_H  = ["Carlos","Diego","Mateo","Sebastián","Emiliano","Fernando","Alejandro","Ricardo","Ángel","Óscar"];
const NOMBRES_M  = ["Sofía","Valentina","Isabella","Camila","Mariana","Lucía","Ana Paula","Fernanda","Daniela","Valeria"];
const APELLIDOS1 = ["García","Martínez","López","Hernández","Ramírez","Torres","Flores","Soto","Ruiz","Vega"];
const APELLIDOS2 = ["Pérez","González","Cruz","Castillo","Morales","Ortega","Reyes","Castro","Salinas","Ibarra"];
const SANGRES    = ["O+","A+","B+","AB+","O-","A-","B-","AB+"];
const ALERGIAS   = ["Ninguna","Ninguna","Ninguna","Ninguna","Penicilina","Látex","Polen","Ninguna","Ninguna","Mariscos"];

const SEED_ALUMNOS = (() => {
  const list = [];
  let idx = 0;
  SEED_GRUPOS.forEach(g => {
    for (let i = 0; i < 10; i++) {
      const esNina  = idx % 2 === 0;
      const nombres = esNina ? NOMBRES_M : NOMBRES_H;
      const ap1 = APELLIDOS1[(idx + i) % 10];
      const ap2 = APELLIDOS2[(idx + i + 3) % 10];
      const nombre  = `${nombres[i]} ${ap1} ${ap2}`;
      const nacYear = 2024 - g.grado - 6;
      const mes  = String((i % 12) + 1).padStart(2, "0");
      const dia  = String((i % 28) + 1).padStart(2, "0");
      list.push({
        id:       `a${String(idx + 1).padStart(3, "0")}`,
        nombre,
        fechaNac: `${nacYear}-${mes}-${dia}`,
        curp:     `${(nombre.split(" ").map(w => w[0]).join("")).toUpperCase().slice(0,4)}${nacYear}${mes}${dia}H${String(idx).padStart(6,"0")}`,
        grupo:    g.id,
        tutor:    `${APELLIDOS1[(idx + 5) % 10]} ${APELLIDOS2[(idx + 7) % 10]}`,
        tel:      `656${String(2000000 + idx).slice(1)}`,
        email:    `tutor${idx + 1}@mail.com`,
        sangre:   SANGRES[idx % 8],
        alergias: ALERGIAS[idx % 10],
        activo:   true,
      });
      idx++;
    }
  });
  return list;
})();

/* ════════════════════════════════════════
   CALIFICACIONES MUESTRA — tri1 tri2 tri3
════════════════════════════════════════ */
const MATERIAS_PRIMARIA = [
  "Español","Matemáticas","Ciencias Naturales","Historia",
  "Geografía","Formación Cívica y Ética","Educación Artística","Educación Física",
];

const SEED_CALIFICACIONES = SEED_ALUMNOS.slice(0, 20).flatMap(a =>
  MATERIAS_PRIMARIA.map(materia => {
    const base = 6.5 + ((a.id.charCodeAt(1) + materia.length) % 35) / 10;
    return {
      id:       uuid(),
      alumnoId: a.id,
      materia,
      tri1:     +Math.min(10, base).toFixed(1),
      tri2:     +Math.min(10, base + 0.3).toFixed(1),
      tri3:     +Math.min(10, base + 0.5).toFixed(1),
      ciclo:    "2024-2025",
    };
  })
);

/* ════════════════════════════════════════
   ASISTENCIA
════════════════════════════════════════ */
const todayStr = () => new Date().toISOString().slice(0, 10);
const SEED_ASISTENCIA = SEED_ALUMNOS.map((a, i) => ({
  id:        uuid(),
  alumnoId:  a.id,
  fecha:     todayStr(),
  estado:    i % 10 < 8 ? "presente" : i % 10 === 8 ? "ausente" : "justificado",
  maestroId: SEED_GRUPOS.find(g => g.id === a.grupo)?.maestroId || "m1",
}));

/* ════════════════════════════════════════
   AVISOS
════════════════════════════════════════ */
const SEED_AVISOS = [
  { id:uuid(), tipo:"reunion",        titulo:"Reunión de padres de familia",       desc:"Junta general – Salón de actos. Asistencia obligatoria.",                    fecha:"2025-09-12", grupo:"Todos", autor:"Dirección", activo:true },
  { id:uuid(), tipo:"calificaciones", titulo:"Entrega de boletas — 2.° trimestre", desc:"Todos los grupos. Traer boleta del trimestre anterior firmada.",             fecha:"2025-11-14", grupo:"Todos", autor:"Dirección", activo:true },
  { id:uuid(), tipo:"evento",         titulo:"Día del Maestro — Suspensión",       desc:"No habrá clases el 15 de mayo en honor al Día del Maestro.",                fecha:"2025-05-15", grupo:"Todos", autor:"Dirección", activo:true },
  { id:uuid(), tipo:"urgente",        titulo:"Simulacro de evacuación",             desc:"Simulacro nacional el viernes. Todos los grupos participan a las 10:00 hrs.",fecha:"2025-09-19", grupo:"Todos", autor:"Dirección", activo:true },
];

/* ════════════════════════════════════════
   HOOK PRINCIPAL
════════════════════════════════════════ */
export function useDB() {
  const [alumnos,        setAlumnosState]    = useState(() => load("edu_alumnos",        SEED_ALUMNOS));
  const [maestros,       setMaestrosState]   = useState(() => load("edu_maestros",       SEED_MAESTROS));
  const [grupos,         setGruposState]     = useState(() => load("edu_grupos",         SEED_GRUPOS));
  const [calificaciones, setCalifState]      = useState(() => load("edu_calificaciones", SEED_CALIFICACIONES));
  const [asistencia,     setAsistenciaState] = useState(() => load("edu_asistencia",     SEED_ASISTENCIA));
  const [avisos,         setAvisosState]     = useState(() => load("edu_avisos",         SEED_AVISOS));

  useEffect(() => { save("edu_alumnos",        alumnos);        }, [alumnos]);
  useEffect(() => { save("edu_maestros",       maestros);       }, [maestros]);
  useEffect(() => { save("edu_grupos",         grupos);         }, [grupos]);
  useEffect(() => { save("edu_calificaciones", calificaciones); }, [calificaciones]);
  useEffect(() => { save("edu_asistencia",     asistencia);     }, [asistencia]);
  useEffect(() => { save("edu_avisos",         avisos);         }, [avisos]);

  /* ALUMNOS */
  const agregarAlumno  = useCallback((d) => { const n={...d,id:uuid(),activo:true}; setAlumnosState(p=>[...p,n]); return n; }, []);
  const editarAlumno   = useCallback((id,d) => setAlumnosState(p=>p.map(a=>a.id===id?{...a,...d}:a)), []);
  const eliminarAlumno = useCallback((id)   => setAlumnosState(p=>p.map(a=>a.id===id?{...a,activo:false}:a)), []);

  /* MAESTROS */
  const agregarMaestro  = useCallback((d) => { const n={...d,id:uuid(),usuario:d.usuario||uuid().slice(0,6),pass:d.pass||"1111",activo:true}; setMaestrosState(p=>[...p,n]); return n; }, []);
  const editarMaestro   = useCallback((id,d) => setMaestrosState(p=>p.map(m=>m.id===id?{...m,...d}:m)), []);
  const eliminarMaestro = useCallback((id)   => setMaestrosState(p=>p.map(m=>m.id===id?{...m,activo:false}:m)), []);

  /* GRUPOS */
  const agregarGrupo = useCallback((d) => { const n={...d,id:d.id||uuid()}; setGruposState(p=>[...p,n]); return n; }, []);
  const editarGrupo  = useCallback((id,d) => setGruposState(p=>p.map(g=>g.id===id?{...g,...d}:g)), []);

  /* CALIFICACIONES */
  const guardarCalificacion  = useCallback((d) => {
    setCalifState(p => {
      const ex = p.find(c=>c.alumnoId===d.alumnoId && c.materia===d.materia && c.ciclo===d.ciclo);
      if (ex) return p.map(c=>c.id===ex.id?{...c,...d}:c);
      return [...p,{...d,id:uuid()}];
    });
  }, []);
  const eliminarCalificacion = useCallback((id) => setCalifState(p=>p.filter(c=>c.id!==id)), []);

  /* ASISTENCIA */
  const guardarAsistencia   = useCallback((alumnoId,fecha,estado,maestroId) => {
    setAsistenciaState(p => {
      const ex = p.find(a=>a.alumnoId===alumnoId && a.fecha===fecha);
      if (ex) return p.map(a=>a.id===ex.id?{...a,estado,maestroId}:a);
      return [...p,{id:uuid(),alumnoId,fecha,estado,maestroId}];
    });
  }, []);
  const asistenciaPorFecha  = useCallback((f)  => asistencia.filter(a=>a.fecha===f),      [asistencia]);
  const asistenciaPorAlumno = useCallback((id) => asistencia.filter(a=>a.alumnoId===id),  [asistencia]);

  /* AVISOS */
  const agregarAviso  = useCallback((d) => { const n={...d,id:uuid(),activo:true}; setAvisosState(p=>[...p,n]); return n; }, []);
  const eliminarAviso = useCallback((id)   => setAvisosState(p=>p.map(a=>a.id===id?{...a,activo:false}:a)), []);

  /* CÁLCULOS */
  const promedioAlumno = useCallback((alumnoId) => {
    const cs = calificaciones.filter(c=>c.alumnoId===alumnoId);
    if (!cs.length) return null;
    const ps = cs.map(c=>((Number(c.tri1)||0)+(Number(c.tri2)||0)+(Number(c.tri3)||0))/3);
    return +(ps.reduce((a,b)=>a+b,0)/ps.length).toFixed(1);
  }, [calificaciones]);

  const faltasAlumno = useCallback((id) =>
    asistencia.filter(a=>a.alumnoId===id && a.estado==="ausente").length, [asistencia]);

  const asistenciaPctAlumno = useCallback((id) => {
    const total = asistencia.filter(a=>a.alumnoId===id).length;
    if (!total) return 100;
    return Math.round((asistencia.filter(a=>a.alumnoId===id && a.estado!=="ausente").length/total)*100);
  }, [asistencia]);

  const nivelRiesgo = useCallback((id) => {
    const f=faltasAlumno(id), p=promedioAlumno(id), pct=asistenciaPctAlumno(id);
    if (f>=10 || p<7  || pct<75) return "alto";
    if (f>=6  || (p!==null&&p<7.5) || pct<85) return "medio";
    return "bajo";
  }, [faltasAlumno,promedioAlumno,asistenciaPctAlumno]);

  /* LOGIN MAESTRO — busca en el estado actual (ya reseteado con seed correcto) */
  const loginMaestro = useCallback((usuarioInput, passInput) => {
    const u = (usuarioInput||"").trim();
    const p = (passInput||"").trim();
    return maestros.find(m => m.activo !== false && m.usuario === u && m.pass === p) || null;
  }, [maestros]);

  return {
    alumnos:     alumnos.filter(a=>a.activo),
    maestros:    maestros.filter(m=>m.activo!==false),
    grupos,
    calificaciones,
    asistencia,
    avisos:      avisos.filter(a=>a.activo),
    materiasDisponibles: MATERIAS_PRIMARIA,
    agregarAlumno, editarAlumno, eliminarAlumno,
    agregarMaestro, editarMaestro, eliminarMaestro,
    agregarGrupo, editarGrupo,
    guardarCalificacion, eliminarCalificacion,
    guardarAsistencia, asistenciaPorFecha, asistenciaPorAlumno,
    agregarAviso, eliminarAviso,
    promedioAlumno, faltasAlumno, asistenciaPctAlumno, nivelRiesgo,
    loginMaestro,
  };
}
