const express = require('express');
const cors = require('cors');
require('dotenv').config();

const alumnosRoutes = require('./routes/alumnos');
const maestrosRoutes = require('./routes/maestros');
const gruposRoutes = require('./routes/grupos');
const calificacionesRoutes = require('./routes/calificaciones');
const asistenciaRoutes = require('./routes/asistencia');
const avisosRoutes = require('./routes/avisos');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/alumnos', alumnosRoutes);
app.use('/api/maestros', maestrosRoutes);
app.use('/api/grupos', gruposRoutes);
app.use('/api/calificaciones', calificacionesRoutes);
app.use('/api/asistencia', asistenciaRoutes);
app.use('/api/avisos', avisosRoutes);

app.listen(process.env.PORT, () => {
    console.log('Servidor corriendo en puerto ' + process.env.PORT);
});