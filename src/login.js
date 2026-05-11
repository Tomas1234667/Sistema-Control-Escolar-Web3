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
 
setHora(
fecha.toLocaleTimeString()
);
 
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
 
return (
<>
{/* BURBUJAS PREMIUM */}
<div
style={{
position: "absolute",
width: "300px",
height: "300px",
background: "#ff8de1",
borderRadius: "50%",
filter: "blur(100px)",
top: "-100px",
left: "-100px",
opacity: "0.4",
zIndex: "0",
}}
></div>
 
<div
style={{
position: "absolute",
width: "250px",
height: "250px",
background: "#c77dff",
borderRadius: "50%",
filter: "blur(100px)",
bottom: "-100px",
right: "-100px",
opacity: "0.4",
zIndex: "0",
}}
></div>
 
<div
style={{
minHeight: "100vh",
display: "flex",
justifyContent: "center",
alignItems: "center",
background:
"radial-gradient(circle at top left,#ff8de1 0%,#2b123c 40%,#0f0f0f 100%)",
fontFamily: "Arial",
padding: "20px",
position: "relative",
overflow: "hidden",
}}
>
 
{/* CONTENEDOR LOGIN */}
<div
style={{
width: "520px",
maxWidth: "500px",
background: "rgba(255,255,255,0.08)",
backdropFilter: "blur(15px)",
borderRadius: "30px",
padding: "40px",
color: "white",
boxShadow: "0 8px 40px rgba(255,105,180,0.35)",
border: "1px solid rgba(255,255,255,0.15)",
animation: "fadeIn 1s ease",
position: "relative",
zIndex: "1",
}}
>
 
{/* LOGO */}
<div
style={{
textAlign: "center",
marginBottom: "20px",
}}
>
 
<div
style={{
fontSize: "70px",
filter: "drop-shadow(0 0 15px #ff8de1)",
}}
>
🎓
</div>
 
<h1
style={{
margin: "10px 0",
fontSize: "38px",
color: "#ff9de2",
textShadow: "0 0 15px rgba(255,105,180,0.7)",
}}
>
EduGestión
</h1>
 
<p
style={{
color: "#f0c6ff",
}}
>
Plataforma Inteligente Escolar
</p>
 
<div
style={{
marginTop: "10px",
fontSize: "14px",
color: "#d8b4f8",
}}
>
🕒 {hora}
</div>
 
</div>
 
<form onSubmit={iniciarSesion}>
 
{/* USUARIO */}
<div style={{ marginBottom: "20px" }}>
 
<label
style={{
fontWeight: "bold",
color: "#ffb7eb",
}}
>
👤 Usuario
</label>
 
<input
type="text"
placeholder="Ingresa tu usuario"
value={usuario}
onChange={(e) =>
setUsuario(e.target.value)
}
 
onFocus={(e)=>{
e.target.style.boxShadow="0 0 15px #ff8de1";
}}
 
onBlur={(e)=>{
e.target.style.boxShadow="inset 0 0 10px rgba(255,255,255,0.1)";
}}
 
style={{
width: "100%",
padding: "15px",
marginTop: "8px",
borderRadius: "15px",
border: "1px solid #ff9de2",
outline: "none",
background: "rgba(255,255,255,0.12)",
boxShadow:
"inset 0 0 10px rgba(255,255,255,0.1)",
transition: "0.3s",
color: "white",
fontSize: "15px",
}}
/>
 
</div>
 
{/* PASSWORD */}
<div style={{ marginBottom: "20px" }}>
 
<label
style={{
fontWeight: "bold",
color: "#ffb7eb",
}}
>
🔒 Contraseña
</label>
 
<div
style={{
display: "flex",
alignItems: "center",
}}
>
 
<input
type={mostrar ? "text" : "password"}
placeholder="Ingresa tu contraseña"
value={password}
onChange={(e) =>
setPassword(e.target.value)
}
 
onFocus={(e)=>{
e.target.style.boxShadow="0 0 15px #c77dff";
}}
 
onBlur={(e)=>{
e.target.style.boxShadow="inset 0 0 10px rgba(255,255,255,0.1)";
}}
 
style={{
width: "100%",
padding: "15px",
marginTop: "8px",
borderRadius: "15px",
border: "1px solid #d8b4f8",
outline: "none",
background: "rgba(255,255,255,0.12)",
boxShadow:
"inset 0 0 10px rgba(255,255,255,0.1)",
transition: "0.3s",
color: "white",
fontSize: "15px",
}}
/>
 
<button
type="button"
onClick={() =>
setMostrar(!mostrar)
}
style={{
marginLeft: "10px",
background: "none",
border: "none",
color: "#ffb7eb",
fontSize: "20px",
cursor: "pointer",
transition: "0.3s",
}}
>
{mostrar ? "🙈" : "👁️"}
</button>
 
</div>
</div>
 
{/* OPCIONES */}
<div
style={{
display: "flex",
justifyContent: "space-between",
marginBottom: "20px",
fontSize: "14px",
color: "#f3d1ff",
}}
>
 
<label>
<input type="checkbox" />
{" "}Recordarme
</label>
 
<span
style={{
cursor: "pointer",
color: "#ff9de2",
}}
>
¿Olvidaste tu contraseña?
</span>
 
</div>
 
{/* SELECT */}
<div
style={{
marginBottom: "20px",
}}
>
 
<label
style={{
fontWeight: "bold",
color: "#ffb7eb",
}}
>
🎓 Tipo de usuario
</label>
 
<select
style={{
width: "100%",
padding: "15px",
marginTop: "8px",
borderRadius: "15px",
border: "1px solid #c77dff",
background: "rgba(255,255,255,0.12)",
color: "white",
fontSize: "15px",
outline: "none",
}}
>
<option>Administrador</option>
<option>Maestro</option>
<option>Alumno</option>
 
</select>
 
</div>
 
{/* ERROR */}
{error && (
 
<div
style={{
background: "rgba(255,0,80,0.2)",
padding: "12px",
borderRadius: "12px",
marginBottom: "20px",
color: "#ffb3c6",
textAlign: "center",
border: "1px solid rgba(255,255,255,0.1)",
}}
>
❌ {error}
</div>
 
)}
 
{/* BOTÓN PREMIUM */}
<button
type="submit"
disabled={cargando}
style={{
width: "100%",
height: "55px",
padding: "15px",
border: "none",
borderRadius: "15px",
background:
"linear-gradient(90deg,#c77dff,#ff8de1)",
color: "white",
fontSize: "18px",
fontWeight: "bold",
cursor: "pointer",
transition: "0.3s",
boxShadow:
"0 0 20px rgba(199,125,255,0.8)",
letterSpacing: "1px",
}}
onMouseOver={(e) => {
e.target.style.transform = "scale(1.03)";
e.target.style.boxShadow =
"0 0 30px rgba(255,105,180,1)";
}}
onMouseOut={(e) => {
e.target.style.transform = "scale(1)";
e.target.style.boxShadow =
"0 0 20px rgba(199,125,255,0.8)";
}}
>
{cargando
? "Cargando..."
: "🚀 Iniciar Sesión"}
</button>
 
</form>
 
{/* FOOTER */}
<div
style={{
marginTop: "30px",
textAlign: "center",
color: "#d8b4f8",
fontSize: "13px",
}}
>
© 2026 EduGestión | Sistema Escolar Inteligente
</div>
 
</div>
</div>
</>
);
}
 
export default Login;