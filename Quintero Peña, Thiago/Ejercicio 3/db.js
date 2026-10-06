import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'tp2_ejercicio3.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(' Error al conectar con SQLite (Ejercicio 3):', err.message);
  } else {
    console.log(' Conectado exitosamente a la base de datos SQLite (Ejercicio 3)');
  }
});

// Habilitar claves foráneas y crear tablas
db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON;');

  db.run(`
    CREATE TABLE IF NOT EXISTS materias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS calificaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      alumno TEXT NOT NULL,
      materia_id INTEGER NOT NULL,
      nota1 REAL DEFAULT 0,
      nota2 REAL DEFAULT 0,
      nota3 REAL DEFAULT 0,
      FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE
    )
  `);
});

export const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

export default db;