import { useState, useEffect, useCallback } from "react";
import { v4 as uuid } from "uuid";

const load = (key, fallback) => {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; }
  catch { return fallback; }
};
const save = (key, val) => localStorage.setItem(key, JSON.stringify(val));

/* ── 12 GRUPOS: 1A 1B 2A 2B 3A 3B 4A 4B 5A 5B 6A 6B ── */
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

/* ── 12 MAESTROS — primaria, cada uno titular de un grupo ── */
const SEED_MAESTROS = [
  { id:"m1",  nombre:"Ana Lucía Ramírez Peña",      email:"aramírez@escuela.edu",  tel:"6561001001", grupo:"1A", activo:true },
  { id:"m2",  nombre:"Carlos Mendoza Herrera",       email:"cmendoza@escuela.edu",  tel:"6561001002", grupo:"1B", activo:true },
  { id:"m3",  nombre:"Patricia Soto Villanueva",     email:"psoto@escuela.edu",     tel:"6561001003", grupo:"2A", activo:true },
  { id:"m4",  nombre:"Javier Estrada Torres",        email:"jestrada@escuela.edu",  tel:"6561001004", grupo:"2B", activo:true },
  { id:"m5",  nombre:"María Fernanda Ríos Cano",     email:"mrios@escuela.edu",     tel:"6561001005", grupo:"3A", activo:true },
  { id:"m6",  nombre:"Roberto Leal Gutiérrez",       email:"rleal@escuela.edu",     tel:"6561001006", grupo:"3B", activo:true },
  { id:"m7",  nombre:"Verónica Castillo Morales",    email:"vcastillo@escuela.edu", tel:"6561001007", grupo:"4A", activo:true },
  { id:"m8",  nombre:"Eduardo Salas Ortega",         email:"esalas@escuela.edu",    tel:"6561001008", grupo:"4B", activo:true },
  { id:"m9",  nombre:"Gabriela Núñez Espinoza",      email:"gnuñez@escuela.edu",    tel:"6561001009", grupo:"5A", activo:true },
  { id:"m10", nombre:"Arturo Vega Domínguez",        email:"avega@escuela.edu",     tel:"6561001010", grupo:"5B", activo:true },
  { id:"m11", nombre:"Silvia Guerrero Pacheco",      email:"sguerrero@escuela.edu", tel:"6561001011", grupo:"6A", activo:true },
  { id:"m12", nombre:"Hugo Flores Ibarra",           email:"hflores@escuela.edu",   tel:"6561001012", grupo:"6B", activo:true },
];

/* ── ALUMNOS MUESTRA ── */
const SEED_ALUMNOS = [
  { id:"a1",  nombre:"Sofía Ramírez Torres",      fechaNac:"2018-03-12", curp:"RATS180312MDFMRS01", grupo:"1A", tutor:"Laura Torres",      tel:"6562001001", email:"ltorres@mail.com",     sangre:"O+",  alergias:"Ninguna",    activo:true },
  { id:"a2",  nombre:"Diego Hernández López",     fechaNac:"2017-07-20", curp:"HELD170720HDFRNL02", grupo:"1B", tutor:"Carlos Hernández",   tel:"6562001002", email:"chernandez@mail.com",  sangre:"A+",  alergias:"Penicilina", activo:true },
  { id:"a3",  nombre:"Valentina Cruz Morales",    fechaNac:"2016-11-05", curp:"CUMV161105MDFRLB03", grupo:"2A", tutor:"Patricia Morales",   tel:"6562001003", email:"pmorales@mail.com",    sangre:"B+",  alergias:"Ninguna",    activo:true },
  { id:"a4",  nombre:"Mateo García Pérez",        fechaNac:"2016-02-28", curp:"GAPM160228HDFRRB04", grupo:"2B", tutor:"Roberto García",     tel:"6562001004", email:"rgarcia@mail.com",     sangre:"AB+", alergias:"Látex",      activo:true },
  { id:"a5",  nombre:"Isabella Martínez Soto",    fechaNac:"2015-09-14", curp:"MASI150914MDFRTB05", grupo:"3A", tutor:"Ana Soto",           tel:"6562001005", email:"asoto@mail.com",       sangre:"O-",  alergias:"Ninguna",    activo:true },
  { id:"a6",  nombre:"Sebastián Flores Ruiz",     fechaNac:"2015-04-30", curp:"FORS150430HDFLLB06", grupo:"3B", tutor:"Jorge Flores",       tel:"6562001006", email:"jflores@mail.com",     sangre:"A-",  alergias:"Ninguna",    activo:true },
  { id:"a7",  nombre:"Camila Reyes González",     fechaNac:"2014-12-08", curp:"REGC141208MDFYNB07", grupo:"4A", tutor:"Mónica González",    tel:"6562001007", email:"mgonzalez@mail.com",   sangre:"B-",  alergias:"Ninguna",    activo:true },
  { id:"a8",  nombre:"Emiliano Vega Castro",      fechaNac:"2014-06-22", curp:"VECE140622HDFGBS08", grupo:"4B", tutor:"Eduardo Castro",     tel:"6562001008", email:"ecastro@mail.com",     sangre:"O+",  alergias:"Polen",      activo:true },
  { id:"a9",  nombre:"Mariana López Salinas",     fechaNac:"2013-01-15", curp:"LOSM130115MDFRRB09", grupo:"5A", tutor:"Sandra Salinas",     tel:"6562001009", email:"ssalinas@mail.com",    sangre:"A+",  alergias:"Ninguna",    activo:true },
  { id:"a10", nombre:"Fernando Ruiz Acosta",      fechaNac:"2013-08-03", curp:"RUAF130803HDFCSR10", grupo:"5B", tutor:"Fernando Ruiz Sr.",  tel:"6562001010", email:"fruizsr@mail.com",     sangre:"O+",  alergias:"Ninguna",    activo:true },
  { id:"a11", nombre:"Lucía Mendoza Vargas",      fechaNac:"2012-05-19", curp:"MEVL120519MDFRCR11", grupo:"6A", tutor:"Rosa Vargas",        tel:"6562001011", email:"rvargas@mail.com",     sangre:"AB-", alergias:"Ninguna",    activo:true },
  { id:"a12", nombre:"Alejandro Torres Fuentes",  fechaNac:"2012-11-27", curp:"TOFA121127HDFRRN12", grupo:"6B", tutor:"Alejandro Torres",   tel:"6562001012", email:"atorres@mail.com",     sangre:"B+",  alergias:"Mariscos",   activo:true },
];

/* ── CALIFICACIONES — TRIMESTRES (tri1, tri2, tri3) ── */
const SEED_CALIFICACIONES = [
  { id:uuid(), alumnoId:"a1",  materia:"Todas las materias", tri1:9.0, tri2:9.5, tri3:9.2, ciclo:"2024-2025" },
  { id:uuid(), alumnoId:"a2",  materia:"Todas las materias", tri1:7.0, tri2:7.5, tri3:7.8, ciclo:"2024-2025" },
  { id:uuid(), alumnoId:"a3",  materia:"Todas las materias", tri1:8.5, tri2:8.0, tri3:8.8, ciclo:"2024-2025" },
  { id:uuid(), alumnoId:"a4",  materia:"Todas las materias", tri1:6.0, tri2:6.5, tri3:7.0, ciclo:"2024-2025" },
  { id:uuid(), alumnoId:"a5",  materia:"Todas las materias", tri1:9.5, tri2:10,  tri3:9.8, ciclo:"2024-2025" },
  { id:uuid(), alumnoId:"a6",  materia:"Todas las materias", tri1:7.5, tri2:8.0, tri3:7.8, ciclo:"2024-2025" },
  { id:uuid(), alumnoId:"a7",  materia:"Todas las materias", tri1:9.0, tri2:9.5, tri3:10,  ciclo:"2024-2025" },
  { id:uuid(), alumnoId:"a8",  materia:"Todas las materias", tri1:6.5, tri2:6.0, tri3:7.0, ciclo:"2024-2025" },
  { id:uuid(), alumnoId:"a9",  materia:"Todas las materias", tri1:8.0, tri2:8.5, tri3:8.2, ciclo:"2024-2025" },
  { id:uuid(), alumnoId:"a10", materia:"Todas las materias", tri1:7.0, tri2:7.5, tri3:7.0, ciclo:"2024-2025" },
  { id:uuid(), alumnoId:"a11", materia:"Todas las materias", tri1:9.5, tri2:9.0, tri3:9.8, ciclo:"2024-2025" },
  { id:uuid(), alumnoId:"a12", materia:"Todas las materias", tri1:5.5, tri2:6.0, tri3:6.5, ciclo:"2024-2025" },
];

const todayStr = () => new Date().toISOString().slice(0,10);

const SEED_ASISTENCIA = [
  { id:uuid(), alumnoId:"a1",  fecha:todayStr(), estado:"presente",    maestroId:"m1"  },
  { id:uuid(), alumnoId:"a2",  fecha:todayStr(), estado:"ausente",     maestroId:"m2"  },
  { id:uuid(), alumnoId:"a3",  fecha:todayStr(), estado:"presente",    maestroId:"m3"  },
  { id:uuid(), alumnoId:"a4",  fecha:todayStr(), estado:"ausente",     maestroId:"m4"  },
  { id:uuid(), alumnoId:"a5",  fecha:todayStr(), estado:"presente",    maestroId:"m5"  },
  { id:uuid(), alumnoId:"a6",  fecha:todayStr(), estado:"justificado", maestroId:"m6"  },
  { id:uuid(), alumnoId:"a7",  fecha:todayStr(), estado:"presente",    maestroId:"m7"  },
  { id:uuid(), alumnoId:"a8",  fecha:todayStr(), estado:"ausente",     maestroId:"m8"  },
  { id:uuid(), alumnoId:"a9",  fecha:todayStr(), estado:"presente",    maestroId:"m9"  },
  { id:uuid(), alumnoId:"a10", fecha:todayStr(), estado:"presente",    maestroId:"m10" },
  { id:uuid(), alumnoId:"a11", fecha:todayStr(), estado:"presente",    maestroId:"m11" },
  { id:uuid(), alumnoId:"a12", fecha:todayStr(), estado:"ausente",     maestroId:"m12" },
];

const SEED_AVISOS = [
  { id:uuid(), tipo:"reunion",       titulo:"Reunión de padres de familia",        desc:"Junta general – Salón de actos. Asistencia obligatoria.",                                fecha:"2025-05-08", grupo:"Todos", autor:"Dirección", activo:true },
  { id:uuid(), tipo:"calificaciones",titulo:"Entrega de boletas del 2° trimestre", desc:"Segundo trimestre – Todos los grupos. Traer boleta del trimestre anterior.",            fecha:"2025-05-15", grupo:"Todos", autor:"Dirección", activo:true },
  { id:uuid(), tipo:"evento",        titulo:"Día del Maestro – Suspensión",        desc:"No habrá clases el 15 de mayo por celebración del Día del Maestro.",                   fecha:"2025-05-15", grupo:"Todos", autor:"Dirección", activo:true },
];

/* ═══════════════════════════════════════════
   HOOK PRINCIPAL
═══════════════════════════════════════════ */
export function useDB() {
  const [alumnos,       setAlumnosState]   = useState(() => load("edu_alumnos",       SEED_ALUMNOS));
  const [maestros,      setMaestrosState]  = useState(() => load("edu_maestros",      SEED_MAESTROS));
  const [grupos,        setGruposState]    = useState(() => load("edu_grupos",        SEED_GRUPOS));
  const [calificaciones,setCalifState]     = useState(() => load("edu_calificaciones",SEED_CALIFICACIONES));
  const [asistencia,    setAsistenciaState]= useState(() => load("edu_asistencia",    SEED_ASISTENCIA));
  const [avisos,        setAvisosState]    = useState(() => load("edu_avisos",        SEED_AVISOS));

  useEffect(() => { save("edu_alumnos",       alumnos);       }, [alumnos]);
  useEffect(() => { save("edu_maestros",      maestros);      }, [maestros]);
  useEffect(() => { save("edu_grupos",        grupos);        }, [grupos]);
  useEffect(() => { save("edu_calificaciones",calificaciones);}, [calificaciones]);
  useEffect(() => { save("edu_asistencia",    asistencia);    }, [asistencia]);
  useEffect(() => { save("edu_avisos",        avisos);        }, [avisos]);

  /* ALUMNOS */
  const agregarAlumno  = useCallback((d) => { const n={...d,id:uuid(),activo:true}; setAlumnosState(p=>[...p,n]); return n; }, []);
  const editarAlumno   = useCallback((id,d) => setAlumnosState(p=>p.map(a=>a.id===id?{...a,...d}:a)), []);
  const eliminarAlumno = useCallback((id)   => setAlumnosState(p=>p.map(a=>a.id===id?{...a,activo:false}:a)), []);

  /* MAESTROS */
  const agregarMaestro = useCallback((d) => { const n={...d,id:uuid(),activo:true}; setMaestrosState(p=>[...p,n]); return n; }, []);
  const editarMaestro  = useCallback((id,d) => setMaestrosState(p=>p.map(m=>m.id===id?{...m,...d}:m)), []);

  /* GRUPOS */
  const agregarGrupo = useCallback((d) => { const n={...d,id:d.id||uuid()}; setGruposState(p=>[...p,n]); return n; }, []);
  const editarGrupo  = useCallback((id,d) => setGruposState(p=>p.map(g=>g.id===id?{...g,...d}:g)), []);

  /* CALIFICACIONES — usa tri1 tri2 tri3 */
  const guardarCalificacion  = useCallback((d) => {
    setCalifState(p => {
      const ex = p.find(c=>c.alumnoId===d.alumnoId && c.materia===d.materia && c.ciclo===d.ciclo);
      if (ex) return p.map(c=>c.id===ex.id?{...c,...d}:c);
      return [...p,{...d,id:uuid()}];
    });
  }, []);
  const eliminarCalificacion = useCallback((id) => setCalifState(p=>p.filter(c=>c.id!==id)), []);

  /* ASISTENCIA */
  const guardarAsistencia = useCallback((alumnoId,fecha,estado,maestroId) => {
    setAsistenciaState(p=>{
      const ex=p.find(a=>a.alumnoId===alumnoId&&a.fecha===fecha);
      if(ex) return p.map(a=>a.id===ex.id?{...a,estado,maestroId}:a);
      return [...p,{id:uuid(),alumnoId,fecha,estado,maestroId}];
    });
  }, []);
  const asistenciaPorFecha  = useCallback((f) => asistencia.filter(a=>a.fecha===f), [asistencia]);
  const asistenciaPorAlumno = useCallback((id)=> asistencia.filter(a=>a.alumnoId===id), [asistencia]);

  /* AVISOS */
  const agregarAviso  = useCallback((d) => { const n={...d,id:uuid(),activo:true}; setAvisosState(p=>[...p,n]); return n; }, []);
  const eliminarAviso = useCallback((id) => setAvisosState(p=>p.map(a=>a.id===id?{...a,activo:false}:a)), []);

  /* CÁLCULOS — ahora usa tri1 tri2 tri3 */
  const promedioAlumno = useCallback((alumnoId) => {
    const califs = calificaciones.filter(c=>c.alumnoId===alumnoId);
    if(!califs.length) return null;
    const proms = califs.map(c=>((Number(c.tri1)||0)+(Number(c.tri2)||0)+(Number(c.tri3)||0))/3);
    return +(proms.reduce((a,b)=>a+b,0)/proms.length).toFixed(1);
  }, [calificaciones]);

  const faltasAlumno        = useCallback((id)=>asistencia.filter(a=>a.alumnoId===id&&a.estado==="ausente").length,[asistencia]);
  const asistenciaPctAlumno = useCallback((id)=>{
    const total=asistencia.filter(a=>a.alumnoId===id).length;
    if(!total) return 100;
    return Math.round((asistencia.filter(a=>a.alumnoId===id&&a.estado!=="ausente").length/total)*100);
  },[asistencia]);

  const nivelRiesgo = useCallback((id)=>{
    const f=faltasAlumno(id), p=promedioAlumno(id), pct=asistenciaPctAlumno(id);
    if(f>=10||p<7||pct<75) return "alto";
    if(f>=6||(p!==null&&p<7.5)||pct<85) return "medio";
    return "bajo";
  },[faltasAlumno,promedioAlumno,asistenciaPctAlumno]);

  return {
    alumnos:     alumnos.filter(a=>a.activo),
    maestros:    maestros.filter(m=>m.activo),
    grupos,
    calificaciones,
    asistencia,
    avisos:      avisos.filter(a=>a.activo),
    agregarAlumno, editarAlumno, eliminarAlumno,
    agregarMaestro, editarMaestro,
    agregarGrupo, editarGrupo,
    guardarCalificacion, eliminarCalificacion,
    guardarAsistencia, asistenciaPorFecha, asistenciaPorAlumno,
    agregarAviso, eliminarAviso,
    promedioAlumno, faltasAlumno, asistenciaPctAlumno, nivelRiesgo,
  };
}
