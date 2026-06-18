//  AVISOS.jsx 
import React from "react";
import { useAppDB } from "./App";

function Avisos() {

  const db = useAppDB();

  return (
    <div style={{ padding: 20 }}>

      <h1 style={{ color: "black", marginBottom: 20 }}>
        Avisos
      </h1>

      {db.avisos.length === 0 ? (

        <p>No hay avisos registrados</p>

      ) : (

        <div
          style={{
            display: "grid",
            gap: 12
          }}
        >

          {db.avisos.map((a) => (

            <div
              key={a.id}
              style={{
                background: "white",
                padding: 16,
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,.1)"
              }}
            >

              <h3>
                {a.titulo}
              </h3>

              <p>
                Tipo: {a.tipo}
              </p>

              <p>
                Descripción: {a.descripcion}
              </p>

              <p>
                Fecha: {a.fecha}
              </p>

              <p>
                Grupo: {a.grupo}
              </p>

              <p>
                Autor: {a.autor}
              </p>

              <p
                style={{
                  color: a.activo ? "green" : "red",
                  fontWeight: "bold"
                }}
              >
                {a.activo ? "Activo" : "Inactivo"}
              </p>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default Avisos;