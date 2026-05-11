import React from "react";
import { useAppDB } from "./App";

function Alumnos() {

    const db = useAppDB();

    return ( <
        div style = {
            { padding: 20 } } >

        <
        h1 style = {
            { color: "black", marginBottom: 20 } } >
        Alumnos <
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
                    db.alumnos.map((alumno) => (

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
                        h3 > { alumno.nombre } < /h3>

                        <
                        p > Grupo: { alumno.grupo } < /p>

                        <
                        p > Tutor: { alumno.tutor } < /p>

                        <
                        p > Tel: { alumno.tel } < /p>

                        <
                        /div>

                    ))
                }

                <
                /div>

            )
        }

        <
        /div>
    );
}

export default Alumnos;