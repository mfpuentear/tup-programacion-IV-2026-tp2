import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'tp2_ejercicio1.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(' Error al conectar con SQLite (Ejercicio 1):', err.message);
  } else {
    console.log(' Conectado a la base de datos SQLite (Ejercicio 1)');
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS rectangulos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      base REAL NOT NULL,
      altura REAL NOT NULL,
      area REAL NOT NULL,
      perimetro REAL NOT NULL
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