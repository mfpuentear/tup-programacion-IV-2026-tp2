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

// Ruta raíz con información y documentación interactiva
app.get('/', (req, res) => {
  const esNavegador = req.headers.accept && req.headers.accept.includes('text/html') && !req.headers.accept.includes('application/json');

  if (esNavegador) {
    return res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Ejercicio 3 - API de Calificaciones</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 30px; background: #0f172a; color: #f8fafc; max-width: 900px; margin: 0 auto; line-height: 1.6; }
          h1 { color: #38bdf8; border-bottom: 2px solid #334155; padding-bottom: 12px; margin-bottom: 15px; }
          .card { background: #1e293b; padding: 22px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #334155; }
          .badge { background: #0284c7; color: white; padding: 4px 10px; border-radius: 6px; font-size: 13px; font-weight: bold; }
          .btn { display: inline-block; background: #2563eb; color: white; padding: 10px 16px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 6px 6px 6px 0; transition: background 0.2s; }
          .btn:hover { background: #1d4ed8; }
          .btn-secondary { background: #475569; }
          .btn-secondary:hover { background: #334155; }
        </style>
      </head>
      <body>
        <h1>🎓 Ejercicio 3: API de Gestión de Calificaciones</h1>
        <div class="card">
          <p><strong>Autor:</strong> Federico Merlo Brac | <span class="badge">MySQL Relacional (Clave Foránea y 3 Notas)</span></p>
          <p>Para ver los datos persistidos en la base de datos MySQL, haz clic en los siguientes enlaces directos:</p>
          <div style="margin: 15px 0;">
            <a class="btn" href="/api/calificaciones" target="_blank">📋 Ver Calificaciones (JSON con JOIN)</a>
            <a class="btn" href="/api/materias" target="_blank">📚 Ver Materias Registradas</a>
            <a class="btn btn-secondary" href="/api/calificaciones?materia_id=1" target="_blank">🔍 Filtrar por Materia ID 1</a>
            <a class="btn btn-secondary" href="/api/calificaciones?alumno=Federico" target="_blank">👤 Filtrar por Alumno</a>
          </div>
        </div>
        <div class="card">
          <h3>📌 Métodos y Endpoints Disponibles</h3>
          <ul>
            <li><code>GET /api/calificaciones</code> - Listar actas de notas (promedio y condición académica calculados)</li>
            <li><code>GET /api/materias</code> - Listar materias de la carrera</li>
            <li><code>POST /api/calificaciones</code> - Registrar notas (valida existencia de materia, 3 notas válidas y unicidad)</li>
            <li><code>PUT /api/calificaciones/:id</code> - Modificar calificaciones</li>
            <li><code>DELETE /api/calificaciones/:id</code> - Eliminar registro</li>
          </ul>
        </div>
      </body>
      </html>
    `);
  }

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
