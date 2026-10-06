const express = require('express');
const sequelize = require('./database');
const calificacionesRoutes = require('./routes/calificaciones');
const materiasRoutes = require('./routes/materias');
// Importar para forzar asociaciones
require('./models/Calificacion');

const app = express();
app.use(express.json());

app.use('/api/calificaciones', calificacionesRoutes);
app.use('/api/materias', materiasRoutes);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.sync({ force: false });
    console.log('Base de datos conectada.');
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error al conectar la base de datos:', error);
  }
};

startServer();
