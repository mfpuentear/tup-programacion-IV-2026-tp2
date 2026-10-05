import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import tareasRoutes from './routes/tareas.routes.js';
import { initDatabase } from './config/db.js';

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 3002;

// Middlewares
app.use(express.json());

// Ruta raíz con información y documentación de la API
app.get('/', (req, res) => {
  res.json({
    nombre: 'API de Gestión de Tareas',
    version: '1.0.0',
    descripcion: 'API REST para administrar una lista de tareas con persistencia en MySQL, control de nombres únicos y filtrado por estado.',
    autor: 'Federico Merlo Brac',
    criterio_unicidad: 'Insensible a mayúsculas/minúsculas y normalización de espacios en blanco (trim y reducción de espacios múltiples a uno simple).',
    recursos: {
      tareas: '/api/tareas'
    },
    ejemplos: {
      listar_todas: 'GET /api/tareas',
      filtrar_completadas: 'GET /api/tareas?estado=completadas',
      filtrar_pendientes: 'GET /api/tareas?estado=pendientes',
      obtener_una: 'GET /api/tareas/1',
      crear: 'POST /api/tareas (body: { "nombre": "Estudiar para el examen", "estado": false })',
      modificar_completo: 'PUT /api/tareas/1 (body: { "nombre": "Estudiar Programación IV", "estado": true })',
      cambiar_estado: 'PATCH /api/tareas/1/estado (body: { "estado": true })',
      eliminar: 'DELETE /api/tareas/1'
    }
  });
});

// Rutas de la API
app.use('/api/tareas', tareasRoutes);

// Manejador de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    mensaje: `La ruta '${req.method} ${req.originalUrl}' no existe en esta API.`
  });
});

// Manejador centralizado de errores
app.use((err, req, res, next) => {
  console.error(`[Error no controlado]:`, err);

  if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
    return res.status(500).json({
      status: 'error',
      mensaje: 'Error de conexión con la base de datos MySQL. Verifique las credenciales en el archivo .env',
      detalle: err.message
    });
  }

  res.status(err.status || 500).json({
    status: 'error',
    mensaje: err.message || 'Error interno del servidor'
  });
});

// Iniciar el servidor si se ejecuta directamente este archivo
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  initDatabase().catch((err) => {
    console.error('Error al inicializar base de datos:', err.message);
  });

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` Servidor de Tareas corriendo en:`);
    console.log(` http://localhost:${PORT}`);
    console.log(` Documentación de endpoints en http://localhost:${PORT}/`);
    console.log(`====================================================`);
  });
}
