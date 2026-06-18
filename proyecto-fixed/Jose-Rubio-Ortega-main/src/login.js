import "./login.css";
import React, { useState, useEffect } from "react";

function Login({ onLogin }) {
    const [usuario, setUsuario] = useState("");
    const [password, setPassword] = useState("");
    const [mostrar, setMostrar] = useState(false);
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);
    const [hora, setHora] = useState("");
    const [tipoUsuario, setTipoUsuario] = useState("Administrador");

    useEffect(() => {
        const iv = setInterval(() => {
            setHora(new Date().toLocaleTimeString("es-MX"));
        }, 1000);
        return () => clearInterval(iv);
    }, []);

    const iniciarSesion = (e) => {
        e.preventDefault();
        setError("");
        setCargando(true);
        setTimeout(() => {
            if (usuario === "admin" && password === "norma123@1") {
                localStorage.setItem("auth", "true");
                if (onLogin) onLogin();
            } else {
                setError("Usuario o contraseña incorrectos");
            }
            setCargando(false);
        }, 1500);
    };

    return ( <
        div className = "login-page" > { /* Burbujas decorativas */ } <
        div className = "login-bubble login-bubble--1" / >
        <
        div className = "login-bubble login-bubble--2" / >
        <
        div className = "login-bubble login-bubble--3" / >

        <
        div className = "login-card" > { /* LOGO */ } <
        div className = "login-logo-wrap" >
        <
        div className = "login-logo-icon" > 🎓 < /div> <
        h1 className = "login-title" > EduGestión < /h1> <
        p className = "login-subtitle" > Plataforma Inteligente Escolar < /p> <
        div className = "login-clock" > 🕒{ hora } < /div> <
        /div>

        { /* FORMULARIO */ } <
        form onSubmit = { iniciarSesion }
        className = "login-form" >

        { /* TIPO DE USUARIO */ } <
        div className = "login-field" >
        <
        label className = "login-label" > 🎓Tipo de usuario < /label> <
        select className = "login-input"
        value = { tipoUsuario }
        onChange = {
            (e) => setTipoUsuario(e.target.value) } >
        <
        option > Administrador < /option> <
        option > Maestro < /option> <
        option > Alumno < /option> <
        /select> <
        /div>

        { /* USUARIO */ } <
        div className = "login-field" >
        <
        label className = "login-label" > 👤Usuario < /label> <
        input type = "text"
        className = "login-input"
        placeholder = "Ingresa tu usuario"
        value = { usuario }
        onChange = {
            (e) => setUsuario(e.target.value) }
        autoComplete = "username" /
        >
        <
        /div>

        { /* CONTRASEÑA */ } <
        div className = "login-field" >
        <
        label className = "login-label" > 🔒Contraseña < /label> <
        div className = "login-input-wrap" >
        <
        input type = { mostrar ? "text" : "password" }
        className = "login-input login-input--pass"
        placeholder = "Ingresa tu contraseña"
        value = { password }
        onChange = {
            (e) => setPassword(e.target.value) }
        autoComplete = "current-password" /
        >
        <
        button type = "button"
        className = "login-eye"
        onClick = {
            () => setMostrar((v) => !v) }
        aria - label = { mostrar ? "Ocultar contraseña" : "Mostrar contraseña" } >
        { mostrar ? "🙈" : "👁️" } <
        /button> <
        /div> <
        /div>

        { /* OPCIONES */ } <
        div className = "login-options" >
        <
        label className = "login-remember" >
        <
        input type = "checkbox" / > Recordarme <
        /label> <
        span className = "login-forgot" > ¿Olvidaste tu contraseña ? < /span> <
        /div>

        { /* ERROR */ } {
            error && ( <
                div className = "login-error" > ❌{ error } <
                /div>
            )
        }

        { /* BOTÓN */ } <
        button type = "submit"
        className = "login-btn"
        disabled = { cargando } > {
            cargando ? ( <
                span className = "login-spinner" > ⏳Verificando... < /span>
            ) : (
                "🚀 Iniciar Sesión"
            )
        } <
        /button> <
        /form>

        { /* FOOTER */ } <
        p className = "login-footer" > ©2026 EduGestión· Sistema Escolar Inteligente <
        /p> <
        /div> <
        /div>
    );
}

export default Login;