# EduGestión - Sistema Escolar

## Credenciales de acceso
- **Usuario:** `admin`
- **Contraseña:** `1234`

## Instalación y ejecución

```bash
npm install
npm start
```

Abre http://localhost:3000 en tu navegador.

## Módulos disponibles
- **Dashboard** – Resumen general, gráficas y alertas
- **Alumnos** – CRUD completo con expediente digital
- **Maestros** – Gestión del personal docente
- **Grupos** – Administración de grupos y salones
- **Asistencia** – Pase de lista digital por grupo
- **Calificaciones** – Registro por bimestres
- **Avisos** – Tablero de comunicados
- **Alertas** – Reporte de alumnos en riesgo escolar

## Correcciones realizadas
- Módulos Avisos, Calificaciones, Grupos y Riesgo completados (eran stubs vacíos)
- Componente `Alumnos` conectado a sus modales (expediente + formulario)
- `Maestros` reescrito con JSX correcto y conectado al contexto DB
- `Dashboard` corregido: etiquetas JSX sin cerrar, typo `dis8play`, alertas de riesgo arregladas, tabla de destacados dinámica
- Promedio por grupo calculado desde datos reales
