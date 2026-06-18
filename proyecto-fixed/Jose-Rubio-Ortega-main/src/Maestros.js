import React from "react";
import { useAppDB } from "./App";

function Maestros() {

  const db = useAppDB();

  return (
    <div style={{ padding: 20 }}>

      <h1 style={{ color: "black", marginBottom: 20 }}>
        Maestros
      </h1>

      {db.maestros.length === 0 ? (

        <p>No hay maestros cargados</p>

      ) : (

        <div
          style={{
            display: "grid",
            gap: 12
          }}
        >

          {db.maestros.map((maestro) => (

            <div
              key={maestro.id}
              style={{
                background: "white",
                padding: 16,
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,.1)"
              }}
            >

              <h3>{maestro.nombre}</h3>

              <p>Email: {maestro.email}</p>

              <p>Teléfono: {maestro.tel}</p>

              <p>
                Estado: {Number(maestro.activo) === 1 ? "Activo" : "Inactivo"}
              </p>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default Maestros;