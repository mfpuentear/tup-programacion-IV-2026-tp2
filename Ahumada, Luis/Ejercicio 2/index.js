import express from "express";
import mysql from "mysql2/promise";
import {
  validarId,
  validarTarea,
  validarEstado,
  verificarValidaciones,
} from "./validaciones.js";

let db = null;

try {
  db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
  });

  console.log("Conectado a la base de datos");
} catch (e) {
  console.error(e.message);
  process.exit(1);
}

const app = express();
const port = 3000;

app.use(express.json());


// Obtener todas las tareas
// También permite filtrar por estado:
// /tareas?completada=true
// /tareas?completada=false
app.get(
  "/tareas",
  validarEstado,
  verificarValidaciones,
  async (req, res) => {
    const { completada } = req.query;

    let sql = "SELECT * FROM tareas";
    const parametros = [];

    if (completada !== undefined) {
      sql += " WHERE completada = ?";
      parametros.push(completada === "true");
    }

    const [tareas] = await db.execute(sql, parametros);

    res.send(tareas);
  },
);


//Obtener una tarea por ID
app.get(
  "/tareas/:id",
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const [tareas] = await db.execute(
      "SELECT * FROM tareas WHERE id=?",
      [id],
    );

    if (tareas.length === 0) {
      return res.status(404).send("Tarea no encontrada");
    }

    res.send(tareas[0]);
  },
);


//Crear una tarea
app.post(
  "/tareas",
  validarTarea,
  verificarValidaciones,
  async (req, res) => {
    const { nombre, completada } = req.body;

    //Normalizamos el nombre quitando espacios al principio y al final y pasando todas las letras a minúsculas para comparar los nombres.
    //Por ejemplo: "Estudiar" y " estudiar " se consideran la misma tarea.
    const nombreNormalizado = nombre.trim().toLowerCase();

    //Verificamos si ya existe una tarea con ese nombre
    const [tareasExistentes] = await db.execute(
      "SELECT * FROM tareas WHERE nombre = ?",
      [nombreNormalizado],
    );

    if (tareasExistentes.length > 0) {
      return res.status(409).send(
        "Ya existe una tarea con ese nombre"
      );
    }

    //Insertamos la tarea
    const [result] = await db.execute(
      `INSERT INTO tareas(nombre, completada)
       VALUES (?, ?)`,
      [nombreNormalizado, completada],
    );

    res.status(201).send({
      id: result.insertId,
      nombre: nombreNormalizado,
      completada,
    });
  },
);



//Modificar una tarea
app.put(
  "/tareas/:id",
  validarId,
  validarTarea,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    const { nombre, completada } = req.body;

    const nombreNormalizado = nombre.trim().toLowerCase();

    //Verificamos que la tarea exista
    const [tareas] = await db.execute(
      "SELECT * FROM tareas WHERE id=?",
      [id],
    );

    if (tareas.length === 0) {
      return res.status(404).send("Tarea no encontrada");
    }

    //Verificamos que no exista otra tarea con el mismo nombre
    const [tareasExistentes] = await db.execute(
      "SELECT * FROM tareas WHERE nombre=? AND id<>?",
      [nombreNormalizado, id],
    );

    if (tareasExistentes.length > 0) {
      return res.status(409).send(
        "Ya existe otra tarea con ese nombre"
      );
    }

    //Actualizamos la tarea
    await db.execute(
      `UPDATE tareas
       SET nombre=?, completada=?
       WHERE id=?`,
      [nombreNormalizado, completada, id],
    );

    res.send({
      id,
      nombre: nombreNormalizado,
      completada,
    });
  },
);


// Eliminar una tarea
app.delete(
  "/tareas/:id",
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const [result] = await db.execute(
      "DELETE FROM tareas WHERE id=?",
      [id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).send("Tarea no encontrada");
    }

    res.status(204).send();
  },
);



app.listen(port, () => {
  console.log(`La aplicación esta funcionando en ${port}`);
});