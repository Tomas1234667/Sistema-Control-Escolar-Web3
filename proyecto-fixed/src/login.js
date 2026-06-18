import "./login.css";
import React, { useState, useEffect } from "react";

function Login({ onLogin }) {

    const [usuario, setUsuario] = useState("");
    const [password, setPassword] = useState("");
    const [mostrar, setMostrar] = useState(false);
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);
    const [hora, setHora] = useState("");

    useEffect(() => {

        const intervalo = setInterval(() => {

            const fecha = new Date();
            setHora(fecha.toLocaleTimeString());

        }, 1000);

        return () => clearInterval(intervalo);

    }, []);

    const iniciarSesion = (e) => {

        e.preventDefault();
        setError("");
        setCargando(true);

        setTimeout(() => {

            if (usuario === "admin" && password === "1234") {

                localStorage.setItem("auth", "true");

                if (onLogin) {
                    onLogin();
                }

            } else {

                setError("Usuario o contraseña incorrectos");

            }

            setCargando(false);

        }, 2000);

    };

    /* ── Paleta accesible (miopía / astigmatismo) ────────────────────
       - Fondo: azul-pizarra oscuro suave (no negro puro)
       - Card:  marfil/crema (no blanco puro → evita halos)
       - Acento: azul-pizarra medio #4a6fa5
       - Sin rosas brillantes ni morados saturados
    ──────────────────────────────────────────────────────────────── */

    const ACCENT      = "#4a6fa5";
    const ACCENT_DARK = "#3b5d8a";
    const TEXT        = "#2d2d2d";
    const TEXT_MED    = "#5a5a5a";
    const TEXT_SOFT   = "#7a7a7a";
    const CARD_BG     = "rgba(250, 248, 244, 0.97)";  /* marfil */
    const INPUT_BG    = "#ffffff";
    const BORDER      = "#c8c2b6";

    return (
        <>
            {/* BURBUJAS DECORATIVAS — colores suaves, sin saturación */}
            <div style={{
                position: "absolute",
                width: "300px",
                height: "300px",
                background: "#5a8ab8",   /* azul apagado */
                borderRadius: "50%",
                filter: "blur(110px)",
                top: "-100px",
                left: "-100px",
                opacity: "0.28",
                zIndex: "0",
            }} />

            <div style={{
                position: "absolute",
                width: "250px",
                height: "250px",
                background: "#5a8a70",   /* verde apagado */
                borderRadius: "50%",
                filter: "blur(120px)",
                bottom: "-100px",
                right: "-100px",
                opacity: "0.28",
                zIndex: "0",
            }} />

            <div style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "linear-gradient(135deg, #1e2a36, #2c3a4a, #3d4f62)",
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                padding: "20px",
                position: "relative",
                overflow: "hidden",
            }}>

                {/* CONTENEDOR LOGIN */}
                <div style={{
                    width: "480px",
                    maxWidth: "100%",
                    background: CARD_BG,
                    backdropFilter: "blur(12px)",
                    borderRadius: "24px",
                    padding: "40px",
                    color: TEXT,
                    boxShadow: "0 10px 40px rgba(0,0,0,0.28)",
                    border: "1px solid rgba(200,194,182,0.5)",
                    animation: "fadeIn 0.6s ease",
                    position: "relative",
                    zIndex: "1",
                }}>

                    {/* LOGO */}
                    <div style={{ textAlign: "center", marginBottom: "24px" }}>

                        <div style={{
                            fontSize: "60px",
                            lineHeight: 1,
                        }}>
                            🎓
                        </div>

                        <h1 style={{
                            margin: "12px 0 4px",
                            fontSize: "32px",
                            color: ACCENT,
                            fontWeight: 800,
                        }}>
                            EduGestión
                        </h1>

                        <p style={{ color: TEXT_SOFT, fontSize: "14px" }}>
                            Plataforma Inteligente Escolar
                        </p>

                        <div style={{
                            marginTop: "8px",
                            fontSize: "13px",
                            color: TEXT_SOFT,
                        }}>
                            🕒 {hora}
                        </div>

                    </div>

                    <form onSubmit={iniciarSesion}>

                        {/* USUARIO */}
                        <div style={{ marginBottom: "18px" }}>

                            <label style={{
                                display: "block",
                                fontWeight: "600",
                                color: TEXT_MED,
                                fontSize: "13px",
                                marginBottom: "6px",
                            }}>
                                👤 Usuario
                            </label>

                            <input
                                type="text"
                                placeholder="Ingresa tu usuario"
                                value={usuario}
                                onChange={(e) => setUsuario(e.target.value)}
                                onFocus={(e) => {
                                    e.target.style.borderColor = ACCENT;
                                    e.target.style.boxShadow = `0 0 0 3px rgba(74,111,165,0.14)`;
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = BORDER;
                                    e.target.style.boxShadow = "none";
                                }}
                                style={{
                                    width: "100%",
                                    padding: "12px 14px",
                                    borderRadius: "10px",
                                    border: `1px solid ${BORDER}`,
                                    outline: "none",
                                    background: INPUT_BG,
                                    transition: "0.2s",
                                    color: TEXT,
                                    fontSize: "14px",
                                    fontFamily: "inherit",
                                    boxSizing: "border-box",
                                }}
                            />

                        </div>

                        {/* PASSWORD */}
                        <div style={{ marginBottom: "18px" }}>

                            <label style={{
                                display: "block",
                                fontWeight: "600",
                                color: TEXT_MED,
                                fontSize: "13px",
                                marginBottom: "6px",
                            }}>
                                🔒 Contraseña
                            </label>

                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

                                <input
                                    type={mostrar ? "text" : "password"}
                                    placeholder="Ingresa tu contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = ACCENT;
                                        e.target.style.boxShadow = `0 0 0 3px rgba(74,111,165,0.14)`;
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = BORDER;
                                        e.target.style.boxShadow = "none";
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: "12px 14px",
                                        borderRadius: "10px",
                                        border: `1px solid ${BORDER}`,
                                        outline: "none",
                                        background: INPUT_BG,
                                        transition: "0.2s",
                                        color: TEXT,
                                        fontSize: "14px",
                                        fontFamily: "inherit",
                                        boxSizing: "border-box",
                                    }}
                                />

                                <button
                                    type="button"
                                    onClick={() => setMostrar(!mostrar)}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        color: TEXT_SOFT,
                                        fontSize: "20px",
                                        cursor: "pointer",
                                        padding: "4px",
                                        flexShrink: 0,
                                    }}
                                >
                                    {mostrar ? "🙈" : "👁️"}
                                </button>

                            </div>

                        </div>

                        {/* OPCIONES */}
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "18px",
                            fontSize: "13px",
                            color: TEXT_MED,
                        }}>
                            <label style={{ cursor: "pointer" }}>
                                <input type="checkbox" style={{ marginRight: "6px" }} />
                                Recordarme
                            </label>
                            <span style={{ cursor: "pointer", color: ACCENT }}>
                                ¿Olvidaste tu contraseña?
                            </span>
                        </div>

                        {/* TIPO DE USUARIO */}
                        <div style={{ marginBottom: "20px" }}>

                            <label style={{
                                display: "block",
                                fontWeight: "600",
                                color: TEXT_MED,
                                fontSize: "13px",
                                marginBottom: "6px",
                            }}>
                                🎓 Tipo de usuario
                            </label>

                            <select style={{
                                width: "100%",
                                padding: "12px 14px",
                                borderRadius: "10px",
                                border: `1px solid ${BORDER}`,
                                background: INPUT_BG,
                                color: TEXT,
                                fontSize: "14px",
                                outline: "none",
                                fontFamily: "inherit",
                                cursor: "pointer",
                            }}>
                                <option>Administrador</option>
                                <option>Maestro</option>
                                <option>Alumno</option>
                            </select>

                        </div>

                        {/* ERROR */}
                        {error && (
                            <div style={{
                                background: "#f5dede",
                                padding: "12px 14px",
                                borderRadius: "10px",
                                marginBottom: "18px",
                                color: "#7a2a2a",
                                textAlign: "center",
                                border: "1px solid #e0b0b0",
                                fontSize: "13px",
                            }}>
                                ❌ {error}
                            </div>
                        )}

                        {/* BOTÓN */}
                        <button
                            type="submit"
                            disabled={cargando}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = ACCENT_DARK;
                                e.currentTarget.style.transform = "translateY(-1px)";
                                e.currentTarget.style.boxShadow = `0 8px 20px rgba(74,111,165,0.32)`;
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = ACCENT;
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = `0 4px 12px rgba(74,111,165,0.2)`;
                            }}
                            style={{
                                width: "100%",
                                height: "48px",
                                padding: "0 16px",
                                border: "none",
                                borderRadius: "10px",
                                background: ACCENT,
                                color: "white",
                                fontSize: "15px",
                                fontWeight: "700",
                                cursor: cargando ? "not-allowed" : "pointer",
                                transition: "0.2s",
                                boxShadow: `0 4px 12px rgba(74,111,165,0.2)`,
                                letterSpacing: "0.5px",
                                fontFamily: "inherit",
                                opacity: cargando ? 0.7 : 1,
                            }}
                        >
                            {cargando ? "Cargando..." : "🚀 Iniciar Sesión"}
                        </button>

                    </form>

                    {/* FOOTER */}
                    <div style={{
                        marginTop: "28px",
                        textAlign: "center",
                        color: TEXT_SOFT,
                        fontSize: "12px",
                    }}>
                        © 2026 EduGestión | Sistema Escolar Inteligente
                    </div>

                </div>

            </div>
        </>
    );
}

export default Login;
