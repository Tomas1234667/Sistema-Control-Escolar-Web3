import React, { useState } from "react";
import toast from "react-hot-toast";
import { useAppDB } from "./App";

const INITIALS = (name = "") => {
    return name
        .split(" ")
        .map((n) => n[0] || "")
        .slice(0, 2)
        .join("")
        .toUpperCase();
};

const EMPTY_FORM = {
    nombre: "",
    fechaNac: "",
    curp: "",
    grupo: "",
    tutor: "",
    tel: "",
    email: "",
    sangre: "O+",
    alergias: "Ninguna",
};

function ModalExpediente({ alumno, onClose }) {
    if (!alumno) return null;
    const db = useAppDB();
    const prom = db.promedioAlumno(alumno.id);
    const faltas = db.faltasAlumno(alumno.id);
    const pct = db.asistenciaPctAlumno(alumno.id);
    const riesgo = db.nivelRiesgo(alumno.id);
    const califs = db.calificaciones.filter((c) => c.alumnoId === alumno.id);

    return ( <
        div className = "modal-overlay"
        onClick = {
            (e) => e.target === e.currentTarget && onClose() } >
        <
        div className = "modal modal-lg" > { /* HEADER */ } <
        div className = "modal-header" >
        <
        div className = "modal-title" > 📁Expediente Digital < /div> <
        button className = "btn btn-ghost btn-icon"
        onClick = { onClose } > ✕ < /button> <
        /div>

        { /* Header alumno */ } <
        div style = {
            { display: "flex", alignItems: "center", gap: 16, padding: 16, background: "#f8faff", borderRadius: 12, marginBottom: 20 } } >
        <
        div className = "av av-lg" > { INITIALS(alumno.nombre) } < /div> <
        div style = {
            { flex: 1 } } >
        <
        div style = {
            { fontWeight: 700, fontSize: 17 } } > { alumno.nombre } < /div> <
        div className = "small muted" >
        Grupo: { alumno.grupo }·
        ID: ALU - { alumno.id.slice(0, 4).toUpperCase() } <
        /div> <
        /div> <
        span className = { `badge badge-${riesgo === "alto" ? "danger" : riesgo === "medio" ? "warning" : "success"}` } > { riesgo === "alto" ? "Alto riesgo" : riesgo === "medio" ? "Seguimiento" : "Regular" } <
        /span> <
        /div>

        { /* CONTENIDO */ } <
        div className = "grid-2" > { /* IZQUIERDA */ } <
        div >
        <
        div className = "exp-section" >
        <
        div className = "exp-section-title" > Datos Personales < /div> <
        div className = "exp-row" > < span > Fecha de nacimiento < /span><span>{alumno.fechaNac}</span > < /div> <
        div className = "exp-row" > < span > CURP < /span><span style={{ fontSize: 11 }}>{alumno.curp || "—"}</span > < /div> <
        div className = "exp-row" > < span > Tutor < /span><span>{alumno.tutor}</span > < /div> <
        div className = "exp-row" > < span > Teléfono < /span><span>{alumno.tel}</span > < /div> <
        div className = "exp-row" > < span > Email tutor < /span><span>{alumno.email || "—"}</span > < /div> <
        div className = "exp-row" > < span > Tipo de sangre < /span><span>{alumno.sangre}</span > < /div> <
        div className = "exp-row" > < span > Alergias < /span><span>{alumno.alergias}</span > < /div> <
        /div>

        <
        div className = "qr-box" >
        <
        div className = "qr-code" / >
        <
        div style = {
            { fontWeight: 700, fontSize: 13 } } > ALU - { alumno.id.slice(0, 8).toUpperCase() } < /div> <
        div className = "small muted"
        style = {
            { marginTop: 4 } } > Código QR para pase de lista rápido < /div> <
        /div> <
        /div>

        { /* DERECHA */ } <
        div >
        <
        div className = "exp-section" >
        <
        div className = "exp-section-title" > Rendimiento Académico < /div> <
        div className = "exp-row" >
        <
        span > Promedio general < /span> <
        strong style = {
            { color: prom >= 8.5 ? "#16a34a" : prom >= 7 ? "#d97706" : "#dc2626" } } > { typeof prom === "number" ? prom.toFixed(2) : "—" } <
        /strong> <
        /div> <
        div className = "exp-row" >
        <
        span > Asistencia < /span> <
        strong style = {
            { color: pct >= 85 ? "#16a34a" : pct >= 75 ? "#d97706" : "#dc2626" } } > { pct } % < /strong> <
        /div> <
        div className = "exp-row" > < span > Faltas acumuladas < /span><span>{faltas} días</span > < /div> <
        /div>

        <
        div className = "exp-section" >
        <
        div className = "exp-section-title" > Calificaciones por Materia < /div> {
            califs.length === 0 ? ( <
                div className = "muted small" > Sin calificaciones registradas < /div>
            ) : (
                califs.map((c) => {
                    const avgNum = (Number(c.bim1) + Number(c.bim2) + Number(c.bim3)) / 3;
                    const avg = avgNum.toFixed(1);
                    const color = avgNum >= 8.5 ? "#16a34a" : avgNum >= 7 ? "#d97706" : "#dc2626";
                    return ( <
                        div className = "exp-row"
                        key = { c.id } >
                        <
                        span > { c.materia } < /span> <
                        strong style = {
                            { color } } > { avg } < /strong> <
                        /div>
                    );
                })
            )
        } <
        /div>

        <
        div className = "exp-section" >
        <
        div className = "exp-section-title" > Indicador de Riesgo Escolar < /div> <
        div className = "riesgo-meter" > {
            [...Array(10)].map((_, i) => ( <
                div key = { i }
                className = "riesgo-seg"
                style = {
                    {
                        background: i < 3 ? "#16a34a" : i < 6 ? "#d97706" : "#dc2626",
                        opacity: (riesgo === "bajo" && i < 3) || (riesgo === "medio" && i < 6) || riesgo === "alto" ? 1 : 0.15,
                    }
                }
                />
            ))
        } <
        /div> <
        div className = "small muted" > Calculado automáticamente: faltas + promedio + asistencia < /div> <
        /div> <
        /div> <
        /div>

        <
        div className = "form-actions" >
        <
        button className = "btn"
        onClick = { onClose } > Cerrar < /button> <
        button className = "btn btn-primary"
        onClick = {
            () => toast.success("Boleta PDF lista para imprimir") } > 📄Descargar Boleta <
        /button> <
        /div> <
        /div> <
        /div>
    );
}

function ModalFormAlumno({ alumno, grupos, onClose, onSave }) {
    const [form, setForm] = useState(alumno ? {...alumno } : {...EMPTY_FORM });
    const set = (k, v) => setForm((p) => ({...p, [k]: v }));

    const handleSubmit = () => {
        if (!form.nombre ? .trim() || !form.grupo || !form.tutor ? .trim()) {
            toast.error("Nombre, grupo y tutor son obligatorios");
            return;
        }
        onSave(form);
    };

    return ( <
            div className = "modal-overlay"
            onClick = {
                (e) => e.target === e.currentTarget && onClose() } >
            <
            div className = "modal modal-lg" >
            <
            div className = "modal-header" >
            <
            div className = "modal-title" > { alumno ? "✏️ Editar Alumno" : "👨‍🎓 Nuevo Alumno" } < /div> <
            button className = "btn btn-ghost btn-icon"
            onClick = { onClose } > ✕ < /button> <
            /div>

            <
            div className = "form-grid" >
            <
            div className = "form-group col-span-2" >
            <
            label className = "form-label" > Nombre completo * < /label> <
            input className = "form-control"
            value = { form.nombre }
            onChange = {
                (e) => set("nombre", e.target.value) }
            placeholder = "Nombre(s) Apellido1 Apellido2" / >
            <
            /div> <
            div className = "form-group" >
            <
            label className = "form-label" > Fecha de Nacimiento < /label> <
            input type = "date"
            className = "form-control"
            value = { form.fechaNac }
            onChange = {
                (e) => set("fechaNac", e.target.value) }
            /> <
            /div> <
            div className = "form-group" >
            <
            label className = "form-label" > CURP < /label> <
            input className = "form-control"
            value = { form.curp }
            onChange = {
                (e) => set("curp", e.target.value.toUpperCase()) }
            maxLength = { 18 }
            placeholder = "18 caracteres" / >
            <
            /div> <
            div className = "form-group" >
            <
            label className = "form-label" > Grupo * < /label> <
            select className = "form-control"
            value = { form.grupo }
            onChange = {
                (e) => set("grupo", e.target.value) } >
            <
            option value = "" > Seleccionar grupo < /option> {
                grupos.map((g) => < option key = { g.id }
                        value = { g.id } > { g.nombre } < /option>)} <
                        /select> <
                        /div> <
                        div className = "form-group" >
                        <
                        label className = "form-label" > Tipo de Sangre < /label> <
                        select className = "form-control"
                        value = { form.sangre }
                        onChange = {
                            (e) => set("sangre", e.target.value) } > {
                            ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((s) => < option key = { s }
                                value = { s } > { s } < /option>)} <
                                /select> <
                                /div> <
                                div className = "form-group" >
                                <
                                label className = "form-label" > Nombre del Tutor * < /label> <
                                input className = "form-control"
                                value = { form.tutor }
                                onChange = {
                                    (e) => set("tutor", e.target.value) }
                                placeholder = "Nombre completo" / >
                                <
                                /div> <
                                div className = "form-group" >
                                <
                                label className = "form-label" > Teléfono del Tutor < /label> <
                                input className = "form-control"
                                value = { form.tel }
                                onChange = {
                                    (e) => set("tel", e.target.value) }
                                placeholder = "10 dígitos"
                                maxLength = { 10 }
                                /> <
                                /div> <
                                div className = "form-group col-span-2" >
                                <
                                label className = "form-label" > Email del Tutor < /label> <
                                input type = "email"
                                className = "form-control"
                                value = { form.email }
                                onChange = {
                                    (e) => set("email", e.target.value) }
                                placeholder = "correo@ejemplo.com" / >
                                <
                                /div> <
                                div className = "form-group col-span-2" >
                                <
                                label className = "form-label" > Alergias / Condiciones médicas < /label> <
                                textarea className = "form-control"
                                value = { form.alergias }
                                onChange = {
                                    (e) => set("alergias", e.target.value) }
                                placeholder = "Ninguna / especificar..." / >
                                <
                                /div> <
                                /div>

                                <
                                div className = "form-actions" >
                                <
                                button className = "btn"
                                onClick = { onClose } > Cancelar < /button> <
                                button className = "btn btn-primary"
                                onClick = { handleSubmit } > { alumno ? "💾 Guardar Cambios" : "➕ Registrar Alumno" } < /button> <
                                /div> <
                                /div> <
                                /div>
                            );
                        }

                        function Alumnos() {
                            return ( <
                                div >
                                <
                                h1 style = {
                                    { color: "black" } } > Alumnos < /h1> <
                                /div>
                            );
                        }

                        export default Alumnos;