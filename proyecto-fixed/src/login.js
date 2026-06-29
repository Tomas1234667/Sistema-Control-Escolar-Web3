import "./login.css";
import React, { useState, useEffect } from "react";
import { useDB } from "./useDB";

/* 
  Perfiles:
  - admin  → usuario: "admin",  contraseña: "1234"   (Directora - ve TODO)
  - maestro → usuario: m1..m12, contraseña: "1111"   (Maestro - NO ve módulo Maestros)
*/

function Login({ onLogin }) {
  const db = useDB();
  const [tipoPerfil, setTipoPerfil] = useState("admin");
  const [usuario,    setUsuario]    = useState("");
  const [password,   setPassword]   = useState("");
  const [mostrar,    setMostrar]    = useState(false);
  const [error,      setError]      = useState("");
  const [cargando,   setCargando]   = useState(false);
  const [hora,       setHora]       = useState("");

  useEffect(()=>{
    const iv = setInterval(()=>setHora(new Date().toLocaleTimeString("es-MX")),1000);
    return ()=>clearInterval(iv);
  },[]);

  // Cuando cambia el tipo de perfil, limpia campos
  const handleTipoPerfil = (v) => {
    setTipoPerfil(v);
    setUsuario("");
    setPassword("");
    setError("");
  };

  const iniciarSesion = (e) => {
    e.preventDefault();
    setError(""); setCargando(true);
    setTimeout(()=>{
      if(tipoPerfil==="admin"){
        if(usuario==="admin" && password==="1234"){
          localStorage.setItem("auth","true");
          localStorage.setItem("rol","admin");
          localStorage.setItem("authNombre","Ma. Norma Alvarez");
          localStorage.setItem("authGrupo","");
          if(onLogin) onLogin({ rol:"admin", nombre:"Ma. Norma Alvarez", grupo:"" });
        } else {
          setError("Usuario o contraseña incorrectos");
        }
      } else {
        // Maestro
        const maestro = db.loginMaestro(usuario, password);
        if(maestro){
          localStorage.setItem("auth","true");
          localStorage.setItem("rol","maestro");
          localStorage.setItem("authNombre",maestro.nombre);
          localStorage.setItem("authGrupo",maestro.grupo);
          localStorage.setItem("authMaestroId",maestro.id);
          if(onLogin) onLogin({ rol:"maestro", nombre:maestro.nombre, grupo:maestro.grupo, maestroId:maestro.id });
        } else {
          setError("Usuario o contraseña incorrectos");
        }
      }
      setCargando(false);
    },1200);
  };

  return (
    <div className="lp-page">
      <div className="lp-bubble lp-bubble--1"/>
      <div className="lp-bubble lp-bubble--2"/>

      <div className="lp-card">
        <div className="lp-header">
          <div className="lp-icon">🎓</div>
          <h1 className="lp-title">EduGestión</h1>
          <p className="lp-sub">Plataforma Inteligente Escolar</p>
          <div className="lp-clock">🕒 {hora}</div>
        </div>

        <form onSubmit={iniciarSesion} className="lp-form">

          {/* TIPO DE PERFIL — solo admin o maestro */}
          <div className="lp-field">
            <label className="lp-label">🎓 Perfil de acceso</label>
            <div style={{display:"flex",gap:10,marginTop:4}}>
              <button
                type="button"
                onClick={()=>handleTipoPerfil("admin")}
                style={{
                  flex:1,padding:"10px 8px",borderRadius:10,border:"2px solid",
                  borderColor: tipoPerfil==="admin" ? "#2563eb" : "#e2e8f0",
                  background: tipoPerfil==="admin" ? "#eff6ff" : "#fff",
                  color: tipoPerfil==="admin" ? "#1d4ed8" : "#64748b",
                  fontWeight:700,fontSize:14,cursor:"pointer",transition:"all .2s"
                }}
              >
                👩‍💼 Administrador
                <div style={{fontSize:11,fontWeight:400,marginTop:2}}>Directora</div>
              </button>
              <button
                type="button"
                onClick={()=>handleTipoPerfil("maestro")}
                style={{
                  flex:1,padding:"10px 8px",borderRadius:10,border:"2px solid",
                  borderColor: tipoPerfil==="maestro" ? "#16a34a" : "#e2e8f0",
                  background: tipoPerfil==="maestro" ? "#f0fdf4" : "#fff",
                  color: tipoPerfil==="maestro" ? "#15803d" : "#64748b",
                  fontWeight:700,fontSize:14,cursor:"pointer",transition:"all .2s"
                }}
              >
                👩‍🏫 Maestro
                <div style={{fontSize:11,fontWeight:400,marginTop:2}}>Docente</div>
              </button>
            </div>
          </div>

          {/* USUARIO */}
          <div className="lp-field">
            <label className="lp-label">👤 {tipoPerfil==="admin" ? "Usuario" : "Usuario del maestro"}</label>
            <input
              type="text"
              className="lp-input"
              placeholder={tipoPerfil==="admin" ? "Ej: admin" : "Ej: m1, m2, m3..."}
              value={usuario}
              onChange={e=>setUsuario(e.target.value)}
              autoComplete="username"
            />
            {tipoPerfil==="maestro" && (
              <div style={{fontSize:12,color:"#64748b",marginTop:4}}>
                Tu usuario es m1–m12 según tu grupo asignado
              </div>
            )}
          </div>

          {/* CONTRASEÑA */}
          <div className="lp-field">
            <label className="lp-label">🔒 Contraseña</label>
            <div className="lp-pass-wrap">
              <input
                type={mostrar?"text":"password"}
                className="lp-input lp-input--pass"
                placeholder={tipoPerfil==="admin" ? "Contraseña admin" : "Contraseña del maestro"}
                value={password}
                onChange={e=>setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button type="button" className="lp-eye"
                onClick={()=>setMostrar(v=>!v)}
                aria-label={mostrar?"Ocultar":"Mostrar"}>
                {mostrar?"🙈":"👁️"}
              </button>
            </div>
          </div>



          {error && <div className="lp-error">❌ {error}</div>}

          <button type="submit" className="lp-btn" disabled={cargando}>
            {cargando ? "⏳ Verificando..." : "🚀 Iniciar Sesión"}
          </button>
        </form>

        <p className="lp-footer">© 2026 EduGestión · Sistema Escolar Inteligente</p>
      </div>
    </div>
  );
}

export default Login;
