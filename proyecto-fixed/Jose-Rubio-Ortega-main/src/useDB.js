import { useState, useEffect, useCallback } from "react";
import { v4 as uuid } from "uuid";


const load = (key, fallback) => {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
};
const save = (key, val) => localStorage.setItem(key, JSON.stringify(val));


const SEED_ALUMNOS = [
    { id: "a1", nombre: "Sofía Ramírez Torres", fechaNac: "2018-03-12", curp: "RATS180312MDFMRS01", grupo: "1A", tutor: "Laura Torres", tel: "5512345678", email: "ltorres@mail.com", sangre: "O+", alergias: "Ninguna", activo: true },
    { id: "a2", nombre: "Diego Hernández López", fechaNac: "2017-07-20", curp: "HELD170720HDFRNL02", grupo: "2B", tutor: "Carlos Hernández", tel: "5523456789", email: "chernandez@mail.com", sangre: "A+", alergias: "Penicilina", activo: true },
    { id: "a3", nombre: "Valentina Cruz Morales", fechaNac: "2016-11-05", curp: "CUMV161105MDFRLB03", grupo: "3A", tutor: "Patricia Morales", tel: "5534567890", email: "pmorales@mail.com", sangre: "B+", alergias: "Ninguna", activo: true },
    { id: "a4", nombre: "Mateo García Pérez", fechaNac: "2018-02-28", curp: "GAPM180228HDFRRB04", grupo: "1B", tutor: "Roberto García", tel: "5545678901", email: "rgarcia@mail.com", sangre: "AB+", alergias: "Látex", activo: true },
    { id: "a5", nombre: "Isabella Martínez Soto", fechaNac: "2015-09-14", curp: "MASI150914MDFRTB05", grupo: "4A", tutor: "Ana Soto", tel: "5556789012", email: "asoto@mail.com", sangre: "O-", alergias: "Ninguna", activo: true },
    { id: "a6", nombre: "Sebastián Flores Ruiz", fechaNac: "2017-04-30", curp: "FORS170430HDFLLB06", grupo: "2A", tutor: "Jorge Flores", tel: "5567890123", email: "jflores@mail.com", sangre: "A-", alergias: "Ninguna", activo: true },
    { id: "a7", nombre: "Camila Reyes González", fechaNac: "2014-12-08", curp: "REGC141208MDFYNB07", grupo: "5B", tutor: "Mónica González", tel: "5578901234", email: "mgonzalez@mail.com", sangre: "B-", alergias: "Ninguna", activo: true },
    { id: "a8", nombre: "Emiliano Vega Castro", fechaNac: "2013-06-22", curp: "VECE130622HDFGBS08", grupo: "6A", tutor: "Eduardo Castro", tel: "5589012345", email: "ecastro@mail.com", sangre: "O+", alergias: "Polen", activo: true },
];

const SEED_MAESTROS = [
    { id: "m1", nombre: "Ricardo Guzmán Pérez", email: "rguzmán@escuela.edu", tel: "5591234567", materias: ["Matemáticas", "Ciencias"], grupos: ["3A", "4A", "5B"], activo: true },
    { id: "m2", nombre: "Alicia Moreno Vda", email: "amoreno@escuela.edu", tel: "5592345678", materias: ["Español", "Historia"], grupos: ["1A", "1B", "2A"], activo: true },
    { id: "m3", nombre: "Fernando Salinas Cruz", email: "fsalinas@escuela.edu", tel: "5593456789", materias: ["Ed. Física"], grupos: ["1A", "1B", "2A", "2B", "3A", "4A", "5B", "6A"], activo: true },
    { id: "m4", nombre: "Gabriela Ríos Leal", email: "grios@escuela.edu", tel: "5594567890", materias: ["Artes", "Música"], grupos: ["1A", "2B", "3A"], activo: true },
];

const SEED_GRUPOS = [
    { id: "1A", nombre: "1° A", grado: 1, salon: "Aula 1", maestroId: "m2", turno: "Matutino" },
    { id: "1B", nombre: "1° B", grado: 1, salon: "Aula 2", maestroId: "m2", turno: "Matutino" },
    { id: "2A", nombre: "2° A", grado: 2, salon: "Aula 3", maestroId: "m2", turno: "Matutino" },
    { id: "2B", nombre: "2° B", grado: 2, salon: "Aula 4", maestroId: "m1", turno: "Matutino" },
    { id: "3A", nombre: "3° A", grado: 3, salon: "Aula 5", maestroId: "m1", turno: "Matutino" },
    { id: "4A", nombre: "4° A", grado: 4, salon: "Aula 6", maestroId: "m1", turno: "Matutino" },
    { id: "5B", nombre: "5° B", grado: 5, salon: "Aula 7", maestroId: "m1", turno: "Matutino" },
    { id: "6A", nombre: "6° A", grado: 6, salon: "Aula 8", maestroId: "m4", turno: "Matutino" },
];

const SEED_CALIFICACIONES = [
    { id: uuid(), alumnoId: "a1", materia: "Matemáticas", bim1: 9, bim2: 9, bim3: 9.5, ciclo: "2024-2025" },
    { id: uuid(), alumnoId: "a1", materia: "Español", bim1: 8.5, bim2: 9, bim3: 9, ciclo: "2024-2025" },
    { id: uuid(), alumnoId: "a2", materia: "Matemáticas", bim1: 6, bim2: 7, bim3: 7.5, ciclo: "2024-2025" },
    { id: uuid(), alumnoId: "a3", materia: "Español", bim1: 8, bim2: 9, bim3: 8.5, ciclo: "2024-2025" },
    { id: uuid(), alumnoId: "a4", materia: "Español", bim1: 5, bim2: 6.5, bim3: 6.8, ciclo: "2024-2025" },
    { id: uuid(), alumnoId: "a5", materia: "Ciencias", bim1: 9.5, bim2: 10, bim3: 9.6, ciclo: "2024-2025" },
    { id: uuid(), alumnoId: "a6", materia: "Historia", bim1: 7, bim2: 7.5, bim3: 7.4, ciclo: "2024-2025" },
    { id: uuid(), alumnoId: "a7", materia: "Matemáticas", bim1: 10, bim2: 9.5, bim3: 10, ciclo: "2024-2025" },
    { id: uuid(), alumnoId: "a8", materia: "Ciencias", bim1: 6.5, bim2: 6, bim3: 7, ciclo: "2024-2025" },
];

const todayStr = () => new Date().toISOString().slice(0, 10);

const SEED_ASISTENCIA = [
    { id: uuid(), alumnoId: "a1", fecha: todayStr(), estado: "presente", maestroId: "m2" },
    { id: uuid(), alumnoId: "a2", fecha: todayStr(), estado: "ausente", maestroId: "m2" },
    { id: uuid(), alumnoId: "a3", fecha: todayStr(), estado: "presente", maestroId: "m1" },
    { id: uuid(), alumnoId: "a4", fecha: todayStr(), estado: "ausente", maestroId: "m2" },
    { id: uuid(), alumnoId: "a5", fecha: todayStr(), estado: "presente", maestroId: "m1" },
    { id: uuid(), alumnoId: "a6", fecha: todayStr(), estado: "justificado", maestroId: "m2" },
    { id: uuid(), alumnoId: "a7", fecha: todayStr(), estado: "presente", maestroId: "m1" },
    { id: uuid(), alumnoId: "a8", fecha: todayStr(), estado: "ausente", maestroId: "m4" },
];

const SEED_AVISOS = [
    { id: uuid(), tipo: "reunion", titulo: "Reunión de padres de familia", desc: "Junta general – Salón de actos. Asistencia obligatoria.", fecha: "2025-05-08", grupo: "Todos", autor: "Dirección", activo: true },
    { id: uuid(), tipo: "calificaciones", titulo: "Entrega de boletas bimestrales", desc: "Tercer bimestre – Todos los grupos. Traer boleta del bimestre anterior.", fecha: "2025-05-15", grupo: "Todos", autor: "Dirección", activo: true },
    { id: uuid(), tipo: "evento", titulo: "Día del Maestro – Suspensión de clases", desc: "No habrá clases el 15 de mayo por celebración del Día del Maestro.", fecha: "2025-05-15", grupo: "Todos", autor: "Dirección", activo: true },
];

// ── hook principal ─────────────────────────────────────────────────────────────
export function useDB() {
    const [alumnos, setAlumnosState] = useState(() => load("edu_alumnos", SEED_ALUMNOS));
    const [maestros, setMaestrosState] = useState(() => load("edu_maestros", SEED_MAESTROS));
    const [grupos, setGruposState] = useState(() => load("edu_grupos", SEED_GRUPOS));
    const [calificaciones, setCalifState] = useState(() => load("edu_calificaciones", SEED_CALIFICACIONES));
    const [asistencia, setAsistenciaState] = useState(() => load("edu_asistencia", SEED_ASISTENCIA));
    const [avisos, setAvisosState] = useState(() => load("edu_avisos", SEED_AVISOS));

    // persist on every change
    useEffect(() => { save("edu_alumnos", alumnos); }, [alumnos]);
    useEffect(() => { save("edu_maestros", maestros); }, [maestros]);
    useEffect(() => { save("edu_grupos", grupos); }, [grupos]);
    useEffect(() => { save("edu_calificaciones", calificaciones); }, [calificaciones]);
    useEffect(() => { save("edu_asistencia", asistencia); }, [asistencia]);
    useEffect(() => { save("edu_avisos", avisos); }, [avisos]);

    // ── ALUMNOS ────────────────────────────────────────────────────────────────
    const agregarAlumno = useCallback((data) => {
        const nuevo = {...data, id: uuid(), activo: true };
        setAlumnosState(p => [...p, nuevo]);
        return nuevo;
    }, []);

    const editarAlumno = useCallback((id, data) => {
        setAlumnosState(p => p.map(a => a.id === id ? {...a, ...data } : a));
    }, []);

    const eliminarAlumno = useCallback((id) => {
        setAlumnosState(p => p.map(a => a.id === id ? {...a, activo: false } : a));
    }, []);

    // ── MAESTROS ───────────────────────────────────────────────────────────────
    const agregarMaestro = useCallback((data) => {
        const nuevo = {...data, id: uuid(), activo: true };
        setMaestrosState(p => [...p, nuevo]);
        return nuevo;
    }, []);

    const editarMaestro = useCallback((id, data) => {
        setMaestrosState(p => p.map(m => m.id === id ? {...m, ...data } : m));
    }, []);

    // ── GRUPOS ─────────────────────────────────────────────────────────────────
    const agregarGrupo = useCallback((data) => {
        const nuevo = {...data, id: data.id || uuid() };
        setGruposState(p => [...p, nuevo]);
        return nuevo;
    }, []);

    const editarGrupo = useCallback((id, data) => {
        setGruposState(p => p.map(g => g.id === id ? {...g, ...data } : g));
    }, []);

    // ── CALIFICACIONES ─────────────────────────────────────────────────────────
    const guardarCalificacion = useCallback((data) => {
        setCalifState(p => {
            const existente = p.find(c => c.alumnoId === data.alumnoId && c.materia === data.materia && c.ciclo === data.ciclo);
            if (existente) return p.map(c => c.id === existente.id ? {...c, ...data } : c);
            return [...p, {...data, id: uuid() }];
        });
    }, []);

    const eliminarCalificacion = useCallback((id) => {
        setCalifState(p => p.filter(c => c.id !== id));
    }, []);

    // ── ASISTENCIA ─────────────────────────────────────────────────────────────
    const guardarAsistencia = useCallback((alumnoId, fecha, estado, maestroId) => {
        setAsistenciaState(p => {
            const existente = p.find(a => a.alumnoId === alumnoId && a.fecha === fecha);
            if (existente) return p.map(a => a.id === existente.id ? {...a, estado, maestroId } : a);
            return [...p, { id: uuid(), alumnoId, fecha, estado, maestroId }];
        });
    }, []);

    const asistenciaPorFecha = useCallback((fecha) => {
        return asistencia.filter(a => a.fecha === fecha);
    }, [asistencia]);

    const asistenciaPorAlumno = useCallback((alumnoId) => {
        return asistencia.filter(a => a.alumnoId === alumnoId);
    }, [asistencia]);

    // ── AVISOS ─────────────────────────────────────────────────────────────────
    const agregarAviso = useCallback((data) => {
        const nuevo = {...data, id: uuid(), activo: true };
        setAvisosState(p => [...p, nuevo]);
        return nuevo;
    }, []);

    const eliminarAviso = useCallback((id) => {
        setAvisosState(p => p.map(a => a.id === id ? {...a, activo: false } : a));
    }, []);

    // ── CÁLCULOS ───────────────────────────────────────────────────────────────
    const promedioAlumno = useCallback((alumnoId) => {
        const califs = calificaciones.filter(c => c.alumnoId === alumnoId);
        if (!califs.length) return null;
        const promedios = califs.map(c => ((Number(c.bim1) || 0) + (Number(c.bim2) || 0) + (Number(c.bim3) || 0)) / 3);
        return +(promedios.reduce((a, b) => a + b, 0) / promedios.length).toFixed(1);
    }, [calificaciones]);

    const faltasAlumno = useCallback((alumnoId) => {
        return asistencia.filter(a => a.alumnoId === alumnoId && a.estado === "ausente").length;
    }, [asistencia]);

    const asistenciaPctAlumno = useCallback((alumnoId) => {
        const total = asistencia.filter(a => a.alumnoId === alumnoId).length;
        if (!total) return 100;
        const presentes = asistencia.filter(a => a.alumnoId === alumnoId && a.estado !== "ausente").length;
        return Math.round((presentes / total) * 100);
    }, [asistencia]);

    const nivelRiesgo = useCallback((alumnoId) => {
        const faltas = faltasAlumno(alumnoId);
        const prom = promedioAlumno(alumnoId);
        const pct = asistenciaPctAlumno(alumnoId);
        if (faltas >= 10 || prom < 7 || pct < 75) return "alto";
        if (faltas >= 6 || (prom !== null && prom < 7.5) || pct < 85) return "medio";
        return "bajo";
    }, [faltasAlumno, promedioAlumno, asistenciaPctAlumno]);

    const alumnosActivos = alumnos.filter(a => a.activo);
    const maestrosActivos = maestros.filter(m => m.activo);
    const avisosActivos = avisos.filter(a => a.activo);

    return {
        // data
        alumnos: alumnosActivos,
        maestros: maestrosActivos,
        grupos,
        calificaciones,
        asistencia,
        avisos: avisosActivos,
        // alumnos
        agregarAlumno,
        editarAlumno,
        eliminarAlumno,
        // maestros
        agregarMaestro,
        editarMaestro,
        // grupos
        agregarGrupo,
        editarGrupo,
        // calificaciones
        guardarCalificacion,
        eliminarCalificacion,
        // asistencia
        guardarAsistencia,
        asistenciaPorFecha,
        asistenciaPorAlumno,
        // avisos
        agregarAviso,
        eliminarAviso,
        // cálculos
        promedioAlumno,
        faltasAlumno,
        asistenciaPctAlumno,
        nivelRiesgo,
    };
}