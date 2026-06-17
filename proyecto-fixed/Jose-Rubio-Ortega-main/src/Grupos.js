import React from "react";
import { useAppDB } from "./App";

function Grupos() {

  const db = useAppDB();

  return (
    <div style={{ padding: 20 }}>

      <h1 style={{ color: "black", marginBottom: 20 }}>
        Grupos
      </h1>

      {db.grupos.length === 0 ? (

        <p>No hay grupos cargados</p>

      ) : (

        <div
          style={{
            display: "grid",
            gap: 12
          }}
        >

          {db.grupos.map((grupo) => (

            <div
              key={grupo.id}
              style={{
                background: "white",
                padding: 16,
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,.1)"
              }}
            >

              <h3>{grupo.nombre}</h3>

              <p>Grado: {grupo.grado}</p>

              <p>Salón: {grupo.salon}</p>

              <p>Maestro ID: {grupo.maestroId}</p>

              <p>Turno: {grupo.turno}</p>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default Grupos;