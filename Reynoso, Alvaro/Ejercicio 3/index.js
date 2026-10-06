require('dotenv').config();

const express = require('express');

const alumnoRoutes = require('./routes/alumnoRoutes');
const materiaRoutes = require('./routes/materiaRoutes');
const calificacionRoutes = require('./routes/calificacionRoutes');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/', alumnoRoutes);
app.use('/', materiaRoutes);
app.use('/', calificacionRoutes);

app.listen(PORT, () => {
    console.log(`API corriendo en: http://localhost:${PORT}`);
});