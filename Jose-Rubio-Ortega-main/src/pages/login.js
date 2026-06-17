import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
    const [correo, setCorreo] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();

        // Usuario de prueba para el inicio de sesion
        if (correo === "admin@gmail.com" && password === "123456") {

            localStorage.setItem("usuario", correo);

            navigate("/");
        } else {
            alert("Correo o contraseña incorrectos");
        }
    };

    return ( <
        div style = { styles.container } >
        <
        form style = { styles.form }
        onSubmit = { handleLogin } >
        <
        h2 > Iniciar Sesión < /h2>

        <
        input type = "email"
        placeholder = "Correo"
        value = { correo }
        onChange = {
            (e) => setCorreo(e.target.value) }
        style = { styles.input }
        />

        <
        input type = "password"
        placeholder = "Contraseña"
        value = { password }
        onChange = {
            (e) => setPassword(e.target.value) }
        style = { styles.input }
        />

        <
        button type = "submit"
        style = { styles.button } >
        Entrar <
        /button> <
        /form> <
        /div>
    );
}

const styles = {
    container: {
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f3f0ff",
    },

    form: {
        background: "white",
        padding: "40px",
        borderRadius: "15px",
        width: "320px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    },

    input: {
        width: "100%",
        padding: "12px",
        marginTop: "15px",
        borderRadius: "8px",
        border: "1px solid #ccc",
    },

    button: {
        width: "100%",
        padding: "12px",
        marginTop: "20px",
        border: "none",
        borderRadius: "8px",
        backgroundColor: "#b57edc",
        color: "white",
        fontSize: "16px",
        cursor: "pointer",
    },
};

export default Login;