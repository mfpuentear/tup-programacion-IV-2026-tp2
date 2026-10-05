import express from "express";
import mysql from "mysql2/promise";
import {
  validarId,
  validarMateria,
  validarCalificacion,
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

// ==============================
// MATERIAS
// ==============================

//Obtener todas las materias
app.get("/materias", async (req, res) => {
  const [materias] = await db.execute(
    "SELECT * FROM materias"
  );

  res.send(materias);
});

//Obtener una materia por ID
app.get(
  "/materias/:id",
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const [materias] = await db.execute(
      "SELECT * FROM materias WHERE id=?",
      [id],
    );

    if (materias.length === 0) {
      return res.status(404).send("Materia no encontrada");
    }

    res.send(materias[0]);
  },
);

//Crear una materia
app.post(
  "/materias",
  validarMateria,
  verificarValidaciones,
  async (req, res) => {
    const { Nombre } = req.body;

    const nombreNormalizado = Nombre.trim().toLowerCase();

    const [materiasExistentes] = await db.execute(
      "SELECT * FROM materias WHERE Nombre=?",
      [nombreNormalizado],
    );

    if (materiasExistentes.length > 0) {
      return res.status(409).send(
        "Ya existe una materia con ese nombre"
      );
    }

    const [result] = await db.execute(
      "INSERT INTO materias(Nombre) VALUES (?)",
      [nombreNormalizado],
    );

    res.status(201).send({
      id: result.insertId,
      Nombre: nombreNormalizado,
    });
  },
);

// ==============================
// CALIFICACIONES
// ==============================

//Obtener todas las calificaciones
app.get("/calificaciones", async (req, res) => {
  const [calificaciones] = await db.execute(
    `SELECT
      c.id,
      c.Nombre_Alumno,
      m.Nombre AS materia,
      c.Nota_1,
      c.Nota_2,
      c.Nota_3
    FROM calificaciones c
    INNER JOIN materias m ON c.Materia_Id = m.id`,
  );

  res.send(calificaciones);
});

//Obtener una calificación por ID
app.get(
  "/calificaciones/:id",
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const [calificaciones] = await db.execute(
      `SELECT
        c.id,
        c.Nombre_Alumno,
        m.Nombre AS materia,
        c.Nota_1,
        c.Nota_2,
        c.Nota_3
      FROM calificaciones c
      INNER JOIN materias m ON c.Materia_Id = m.id
      WHERE c.id=?`,
      [id],
    );

    if (calificaciones.length === 0) {
      return res.status(404).send(
        "Calificación no encontrada"
      );
    }

    res.send(calificaciones[0]);
  },
);

//Crear una calificación
app.post(
  "/calificaciones",
  validarCalificacion,
  verificarValidaciones,
  async (req, res) => {
    const {
      Nombre_Alumno,
      Materia_Id,
      Nota_1,
      Nota_2,
      Nota_3,
    } = req.body;

    const nombreNormalizado = Nombre_Alumno
      .trim()
      .toLowerCase();

    //Verificamos que la materia exista
    const [materias] = await db.execute(
      "SELECT * FROM materias WHERE id=?",
      [Materia_Id],
    );

    if (materias.length === 0) {
      return res.status(404).send(
        "La materia no existe"
      );
    }

    //Verificamos que no exista el mismo alumno
    //registrado en la misma materia
    const [calificacionesExistentes] = await db.execute(
      `SELECT * FROM calificaciones
       WHERE Nombre_Alumno=? AND Materia_Id=?`,
      [nombreNormalizado, Materia_Id],
    );

    if (calificacionesExistentes.length > 0) {
      return res.status(409).send(
        "El alumno ya tiene una calificación en esa materia"
      );
    }

    //Insertamos la calificación
    const [result] = await db.execute(
      `INSERT INTO calificaciones
      (Nombre_Alumno, Materia_Id, Nota_1, Nota_2, Nota_3)
      VALUES (?, ?, ?, ?, ?)`,
      [
        nombreNormalizado,
        Materia_Id,
        Nota_1,
        Nota_2,
        Nota_3,
      ],
    );

    res.status(201).send({
      id: result.insertId,
      Nombre_Alumno: nombreNormalizado,
      Materia_Id,
      Nota_1,
      Nota_2,
      Nota_3,
    });
  },
);

//Modificar una calificación
app.put(
  "/calificaciones/:id",
  validarId,
  validarCalificacion,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const {
      Nombre_Alumno,
      Materia_Id,
      Nota_1,
      Nota_2,
      Nota_3,
    } = req.body;

    const nombreNormalizado = Nombre_Alumno
      .trim()
      .toLowerCase();

    //Verificamos que la calificación exista
    const [calificaciones] = await db.execute(
      "SELECT * FROM calificaciones WHERE id=?",
      [id],
    );

    if (calificaciones.length === 0) {
      return res.status(404).send(
        "Calificación no encontrada"
      );
    }

    //Verificamos que la materia exista
    const [materias] = await db.execute(
      "SELECT * FROM materias WHERE id=?",
      [Materia_Id],
    );

    if (materias.length === 0) {
      return res.status(404).send(
        "La materia no existe"
      );
    }

    //Verificamos que no exista otro registro
    //con el mismo alumno y materia
    const [calificacionesExistentes] = await db.execute(
      `SELECT * FROM calificaciones
       WHERE Nombre_Alumno=?
       AND Materia_Id=?
       AND id<>?`,
      [
        nombreNormalizado,
        Materia_Id,
        id,
      ],
    );

    if (calificacionesExistentes.length > 0) {
      return res.status(409).send(
        "El alumno ya tiene una calificación en esa materia"
      );
    }

    //Actualizamos la calificación
    await db.execute(
      `UPDATE calificaciones
       SET Nombre_Alumno=?,
           Materia_Id=?,
           Nota_1=?,
           Nota_2=?,
           Nota_3=?
       WHERE id=?`,
      [
        nombreNormalizado,
        Materia_Id,
        Nota_1,
        Nota_2,
        Nota_3,
        id,
      ],
    );

    res.send({
      id,
      Nombre_Alumno: nombreNormalizado,
      Materia_Id,
      Nota_1,
      Nota_2,
      Nota_3,
    });
  },
);

//Eliminar una calificación
app.delete(
  "/calificaciones/:id",
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const [result] = await db.execute(
      "DELETE FROM calificaciones WHERE id=?",
      [id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).send(
        "Calificación no encontrada"
      );
    }

    res.status(204).send();
  },
);

app.listen(port, () => {
  console.log(
    `La aplicación esta funcionando en ${port}`
  );
});