// CALIFICACIONES.jsx 
import React from "react";
import { useAppDB } from "./App";

function Calificaciones() {

  const db = useAppDB();

  return (
    <div style={{ padding: 20 }}>

      <h1 style={{ color: "black", marginBottom: 20 }}>
        Calificaciones
      </h1>

      {db.calificaciones.length === 0 ? (

        <p>No hay calificaciones registradas</p>

      ) : (

        <div
          style={{
            display: "grid",
            gap: 12
          }}
        >

          {db.calificaciones.map((c) => {

            const alumno = db.alumnos.find(
              (a) => a.id === c.alumnoId
            );

            const promedio =
              (
                Number(c.bim1) +
                Number(c.bim2) +
                Number(c.bim3)
              ) / 3;

            return (

              <div
                key={c.id}
                style={{
                  background: "white",
                  padding: 16,
                  borderRadius: 12,
                  boxShadow: "0 2px 8px rgba(0,0,0,.1)"
                }}
              >

                <h3>
                  {alumno ? alumno.nombre : "Alumno no encontrado"}
                </h3>

                <p>
                  Materia: {c.materia}
                </p>

                <p>
                  Bimestre 1: {c.bim1}
                </p>

                <p>
                  Bimestre 2: {c.bim2}
                </p>

                <p>
                  Bimestre 3: {c.bim3}
                </p>

                <p>
                  Ciclo: {c.ciclo}
                </p>

                <p
                  style={{
                    fontWeight: "bold",
                    color:
                      promedio >= 8
                        ? "green"
                        : promedio >= 7
                        ? "orange"
                        : "red"
                  }}
                >
                  Promedio: {promedio.toFixed(1)}
                </p>

              </div>

            );

          })}

        </div>

      )}

    </div>
  );
}

export default Calificaciones;