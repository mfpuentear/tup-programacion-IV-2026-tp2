import { initDatabase, pool } from './config/db.js';

console.log('Iniciando script de creación de base de datos y tablas materias/calificaciones...');
await initDatabase();
await pool.end();
console.log('Script finalizado con éxito.');
process.exit(0);
