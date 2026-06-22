import "./login.css";
import React, { useState, useEffect } from "react";

function Login({ onLogin }) {
  const [usuario,  setUsuario]  = useState("");
  const [password, setPassword] = useState("");
  const [mostrar,  setMostrar]  = useState(false);
  const [error,    setError]    = useState("");
  const [cargando, setCargando] = useState(false);
  const [hora,     setHora]     = useState("");

  useEffect(() => {
    const iv = setInterval(() => setHora(new Date().toLocaleTimeString("es-MX")), 1000);
    return () => clearInterval(iv);
  }, []);

  const iniciarSesion = (e) => {
    e.preventDefault();
    setError(""); setCargando(true);
    setTimeout(() => {
      if (usuario === "admin" && password === "1234") {
        localStorage.setItem("auth", "true");
        if (onLogin) onLogin();
      } else {
        setError("Usuario o contraseña incorrectos");
      }
      setCargando(false);
    }, 1500);
  };

  return (
    <div className="lp-page">
      {/* burbujas decorativas */}
      <div className="lp-bubble lp-bubble--1" />
      <div className="lp-bubble lp-bubble--2" />

      <div className="lp-card">

        {/* LOGO */}
        <div className="lp-header">
          <div className="lp-icon">🎓</div>
          <h1 className="lp-title">EduGestión</h1>
          <p className="lp-sub">Plataforma Inteligente Escolar</p>
          <div className="lp-clock">🕒 {hora}</div>
        </div>

        {/* FORM */}
        <form onSubmit={iniciarSesion} className="lp-form">

          {/* Tipo usuario */}
          <div className="lp-field">
            <label className="lp-label">🎓 Tipo de usuario</label>
            <select className="lp-input">
              <option>Administrador</option>
              <option>Maestro</option>
              <option>Alumno</option>
            </select>
          </div>

          {/* Usuario */}
          <div className="lp-field">
            <label className="lp-label">👤 Usuario</label>
            <input
              type="text"
              className="lp-input"
              placeholder="Ingresa tu usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              autoComplete="username"
            />
          </div>

          {/* Contraseña */}
          <div className="lp-field">
            <label className="lp-label">🔒 Contraseña</label>
            <div className="lp-pass-wrap">
              <input
                type={mostrar ? "text" : "password"}
                className="lp-input lp-input--pass"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="lp-eye"
                onClick={() => setMostrar((v) => !v)}
                aria-label={mostrar ? "Ocultar" : "Mostrar"}
              >
                {mostrar ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Opciones */}
          <div className="lp-options">
            <label className="lp-remember">
              <input type="checkbox" /> Recordarme
            </label>
            <span className="lp-forgot">¿Olvidaste tu contraseña?</span>
          </div>

          {/* Error */}
          {error && <div className="lp-error">❌ {error}</div>}

          {/* Botón */}
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
