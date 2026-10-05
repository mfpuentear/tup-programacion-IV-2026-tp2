import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import materiasRoutes from './routes/materias.routes.js';
import calificacionesRoutes from './routes/calificaciones.routes.js';
import { initDatabase } from './config/db.js';

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 3003;

// Middlewares
app.use(express.json());

// Ruta raíz con información y documentación de la API
app.get('/', (req, res) => {
  res.json({
    nombre: 'API de Gestión de Calificaciones de Alumnos',
    version: '1.0.0',
    descripcion: 'API REST para administrar alumnos, materias y calificaciones con persistencia en MySQL, relaciones foráneas y control de unicidad.',
    autor: 'Federico Merlo Brac',
    escala_calificaciones: 'Escala numérica estándar de 1.00 a 10.00 con exactamente 3 notas obligatorias por registro.',
    recursos: {
      materias: '/api/materias',
      calificaciones: '/api/calificaciones'
    },
    ejemplos: {
      listar_materias: 'GET /api/materias',
      listar_calificaciones: 'GET /api/calificaciones',
      filtrar_por_materia: 'GET /api/calificaciones?materia_id=1',
      filtrar_por_alumno: 'GET /api/calificaciones?alumno=Federico',
      crear_materia: 'POST /api/materias (body: { "nombre": "Redes", "codigo": "RED-1" })',
      crear_calificacion: 'POST /api/calificaciones (body: { "alumno": "Juan Pérez", "materia_id": 1, "nota1": 8, "nota2": 7.5, "nota3": 9 })',
      modificar_calificacion: 'PUT /api/calificaciones/1 (body: { "alumno": "Juan Pérez", "materia_id": 1, "nota1": 9, "nota2": 8, "nota3": 9.5 })',
      eliminar_calificacion: 'DELETE /api/calificaciones/1'
    }
  });
});

// Rutas de la API
app.use('/api/materias', materiasRoutes);
app.use('/api/calificaciones', calificacionesRoutes);

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
    console.log(` Servidor de Calificaciones corriendo en:`);
    console.log(` http://localhost:${PORT}`);
    console.log(` Documentación de endpoints en http://localhost:${PORT}/`);
    console.log(`====================================================`);
  });
}
