import axios from 'axios';
import { useState, useEffect, useCallback } from "react";
import { v4 as uuid } from "uuid";

// ── seed data ─────────────────────────────────────────────────────────────────
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
];

const todayStr = () => new Date().toISOString().slice(0, 10);

const SEED_ASISTENCIA = [
    { id: uuid(), alumnoId: "a1", fecha: todayStr(), estado: "presente", maestroId: "m2" },
    { id: uuid(), alumnoId: "a2", fecha: todayStr(), estado: "ausente", maestroId: "m2" },
];

const SEED_AVISOS = [{
    id: uuid(),
    tipo: "reunion",
    titulo: "Reunión de padres de familia",
    desc: "Junta general – Salón de actos. Asistencia obligatoria.",
    fecha: "2025-05-08",
    grupo: "Todos",
    autor: "Dirección",
    activo: true
}, ];

// ── hook principal ─────────────────────────────────────────────────────────────
export function useDB() {

    // ── STATES ────────────────────────────────────────────────────────────────
    const [alumnos, setAlumnosState] = useState([]);
    const [maestros, setMaestrosState] = useState(SEED_MAESTROS);
    const [grupos, setGruposState] = useState(SEED_GRUPOS);
    const [calificaciones, setCalifState] = useState(SEED_CALIFICACIONES);
    const [asistencia, setAsistenciaState] = useState(SEED_ASISTENCIA);
    const [avisos, setAvisosState] = useState(SEED_AVISOS);

    // ── CARGAR DATOS DESDE MYSQL ─────────────────────────────────────────────
    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async() => {

        try {

            const [
                alumnosRes,
                maestrosRes,
                gruposRes,
                calificacionesRes,
                asistenciaRes,
                avisosRes
            ] = await Promise.all([
                axios.get('http://localhost:5000/api/alumnos'),
                axios.get('http://localhost:5000/api/maestros'),
                axios.get('http://localhost:5000/api/grupos'),
                axios.get('http://localhost:5000/api/calificaciones'),
                axios.get('http://localhost:5000/api/asistencia'),
                axios.get('http://localhost:5000/api/avisos')
            ]);

            setAlumnosState(alumnosRes.data);
            setMaestrosState(maestrosRes.data);
            setGruposState(gruposRes.data);
            setCalifState(calificacionesRes.data);
            setAsistenciaState(asistenciaRes.data);
            setAvisosState(avisosRes.data);

            console.log("Datos cargados desde MySQL");

        } catch (error) {

            console.log("Error cargando datos:", error);

        }

    };

    // ── ALUMNOS ───────────────────────────────────────────────────────────────
    const agregarAlumno = async(data) => {

        try {

            await axios.post(
                'http://localhost:5000/api/alumnos',
                data
            );

            cargarDatos();

        } catch (error) {

            console.log(error);

        }

    };

    const editarAlumno = async(id, data) => {

        try {

            await axios.put(
                `http://localhost:5000/api/alumnos/${id}`,
                data
            );

            cargarDatos();

        } catch (error) {

            console.log(error);

        }

    };

    const eliminarAlumno = async(id) => {

        try {

            await axios.delete(
                `http://localhost:5000/api/alumnos/${id}`
            );

            cargarDatos();

        } catch (error) {

            console.log(error);

        }

    };

    // ── MAESTROS ──────────────────────────────────────────────────────────────
    const agregarMaestro = useCallback((data) => {

        const nuevo = {
            ...data,
            id: uuid(),
            activo: true
        };

        setMaestrosState(p => [...p, nuevo]);

        return nuevo;

    }, []);

    const editarMaestro = useCallback((id, data) => {

        setMaestrosState(p =>
            p.map(m =>
                m.id === id ? {...m, ...data } :
                m
            )
        );

    }, []);

    // ── GRUPOS ────────────────────────────────────────────────────────────────
    const agregarGrupo = useCallback((data) => {

        const nuevo = {
            ...data,
            id: data.id || uuid()
        };

        setGruposState(p => [...p, nuevo]);

        return nuevo;

    }, []);

    const editarGrupo = useCallback((id, data) => {

        setGruposState(p =>
            p.map(g =>
                g.id === id ? {...g, ...data } :
                g
            )
        );

    }, []);

    // ── CALIFICACIONES ────────────────────────────────────────────────────────
    const guardarCalificacion = useCallback((data) => {

        setCalifState(p => {

            const existente = p.find(c =>
                c.alumnoId === data.alumnoId &&
                c.materia === data.materia &&
                c.ciclo === data.ciclo
            );

            if (existente) {

                return p.map(c =>
                    c.id === existente.id ? {...c, ...data } :
                    c
                );

            }

            return [
                ...p,
                {
                    ...data,
                    id: uuid()
                }
            ];

        });

    }, []);

    const eliminarCalificacion = useCallback((id) => {

        setCalifState(p =>
            p.filter(c => c.id !== id)
        );

    }, []);

    // ── ASISTENCIA ────────────────────────────────────────────────────────────
    const guardarAsistencia = useCallback((alumnoId, fecha, estado, maestroId) => {

        setAsistenciaState(p => {

            const existente = p.find(a =>
                a.alumnoId === alumnoId &&
                a.fecha === fecha
            );

            if (existente) {

                return p.map(a =>
                    a.id === existente.id ? {...a, estado, maestroId } :
                    a
                );

            }

            return [
                ...p,
                {
                    id: uuid(),
                    alumnoId,
                    fecha,
                    estado,
                    maestroId
                }
            ];

        });

    }, []);

    const asistenciaPorFecha = useCallback((fecha) => {

        return asistencia.filter(a =>
            a.fecha === fecha
        );

    }, [asistencia]);

    const asistenciaPorAlumno = useCallback((alumnoId) => {

        return asistencia.filter(a =>
            a.alumnoId === alumnoId
        );

    }, [asistencia]);

    // ── AVISOS ────────────────────────────────────────────────────────────────
    const agregarAviso = useCallback((data) => {

        const nuevo = {
            ...data,
            id: uuid(),
            activo: true
        };

        setAvisosState(p => [...p, nuevo]);

        return nuevo;

    }, []);

    const eliminarAviso = useCallback((id) => {

        setAvisosState(p =>
            p.map(a =>
                a.id === id ? {...a, activo: false } :
                a
            )
        );

    }, []);

    // ── CÁLCULOS ──────────────────────────────────────────────────────────────
    const promedioAlumno = useCallback((alumnoId) => {

        const califs = calificaciones.filter(c =>
            c.alumnoId === alumnoId
        );

        if (!califs.length) return null;

        const promedios = califs.map(c =>
            (
                (Number(c.bim1) || 0) +
                (Number(c.bim2) || 0) +
                (Number(c.bim3) || 0)
            ) / 3
        );

        return +(
            promedios.reduce((a, b) => a + b, 0) /
            promedios.length
        ).toFixed(1);

    }, [calificaciones]);

    const faltasAlumno = useCallback((alumnoId) => {

        return asistencia.filter(a =>
            a.alumnoId === alumnoId &&
            a.estado === "ausente"
        ).length;

    }, [asistencia]);

    const asistenciaPctAlumno = useCallback((alumnoId) => {

        const total = asistencia.filter(a =>
            a.alumnoId === alumnoId
        ).length;

        if (!total) return 100;

        const presentes = asistencia.filter(a =>
            a.alumnoId === alumnoId &&
            a.estado !== "ausente"
        ).length;

        return Math.round(
            (presentes / total) * 100
        );

    }, [asistencia]);

    const nivelRiesgo = useCallback((alumnoId) => {

        const faltas = faltasAlumno(alumnoId);
        const prom = promedioAlumno(alumnoId);
        const pct = asistenciaPctAlumno(alumnoId);

        if (faltas >= 10 || prom < 7 || pct < 75)
            return "alto";

        if (faltas >= 6 || (prom !== null && prom < 7.5) || pct < 85)
            return "medio";

        return "bajo";

    }, [faltasAlumno, promedioAlumno, asistenciaPctAlumno]);

    // ── FILTROS ───────────────────────────────────────────────────────────────
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