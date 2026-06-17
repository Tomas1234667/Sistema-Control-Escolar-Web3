<<<<<<< HEAD
// RIESGO.jsx 
import React from "react";
import { useAppDB } from "./App";

function Riesgo() {

    const db = useAppDB();

    return ( <
        div style = {
            { padding: 20 } } >

        <
        h1 style = {
            { color: "black", marginBottom: 20 } } >
        Riesgo Escolar <
        /h1>

        {
            db.alumnos.length === 0 ? (

                <
                p > No hay alumnos cargados < /p>

            ) : (

                <
                div style = {
                    {
                        display: "grid",
                        gap: 12
                    }
                } >

                {
                    db.alumnos.map((alumno) => {

                        const promedio = db.promedioAlumno(alumno.id);
                        const faltas = db.faltasAlumno(alumno.id);
                        const asistencia = db.asistenciaPctAlumno(alumno.id);
                        const riesgo = db.nivelRiesgo(alumno.id);

                        return (

                            <
                            div key = { alumno.id }
                            style = {
                                {
                                    background: "white",
                                    padding: 16,
                                    borderRadius: 12,
                                    boxShadow: "0 2px 8px rgba(0,0,0,.1)"
                                }
                            } >

                            <
                            h3 > { alumno.nombre } <
                            /h3>

                            <
                            p >
                            Grupo: { alumno.grupo } <
                            /p>

                            <
                            p >
                            Promedio: { promedio ? ? "Sin datos" } <
                            /p>

                            <
                            p >
                            Faltas: { faltas } <
                            /p>

                            <
                            p >
                            Asistencia: { asistencia } %
                            <
                            /p>

                            <
                            p style = {
                                {
                                    fontWeight: "bold",
                                    color: riesgo === "alto" ?
                                        "red" :
                                        riesgo === "medio" ?
                                        "orange" :
                                        "green"
                                }
                            } >
                            Riesgo: { riesgo.toUpperCase() } <
                            /p>

                            <
                            /div>

                        );

                    })
                }

                <
                /div>

            )
        }

        <
        /div>
    );
=======
function Riesgo() {
  return <h1>Riesgo</h1>;
>>>>>>> ad6f0b5055634c92c96965f4874369017b4c5cb8
}

export default Riesgo;