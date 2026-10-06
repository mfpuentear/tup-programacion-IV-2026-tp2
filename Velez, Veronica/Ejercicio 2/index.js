const express = require('express');
const sequelize = require('./database');
const tareasRoutes = require('./routes/tareas');

const app = express();
app.use(express.json());

app.use('/api/tareas', tareasRoutes);

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
