import express from "express";
import mysql from "mysql2/promise";
import {
  validarId,
  validarRectangulo,
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


//GET para obtener todos los rectángulos
app.get(
  "/rectangulos",
  verificarValidaciones,
  async (req, res) => {

    const [rectangulos] = await db.execute(
      "SELECT * FROM rectangulos"
    );

    res.send(rectangulos);
  },
);


//GET para obtener un rectángulo por id
app.get(
  "/rectangulos/:id",
  validarId,
  verificarValidaciones,
  async (req, res) => {

    const id = Number(req.params.id);

    const [rectangulos] = await db.execute(
      "SELECT * FROM rectangulos WHERE id=?",
      [id],
    );

    if (rectangulos.length === 0) {
      return res.status(404).send("Rectángulo no encontrado");
    }

    res.send(rectangulos[0]);
  },
);


//POST para crear un rectángulo
app.post(
  "/rectangulos",
  validarRectangulo,
  verificarValidaciones,
  async (req, res) => {

    //Extraigo del body los lados del rectángulo
    const { base, altura } = req.body;

    //Calculo los valores en el servidor
    const perimetro = 2 * (base + altura);
    const superficie = base * altura;

    const [result] = await db.execute(
      `INSERT INTO rectangulos
      (base, altura, perimetro, superficie)
      VALUES (?, ?, ?, ?)`,
      [base, altura, perimetro, superficie],
    );

    res.status(201).send({
      id: result.insertId,
      base,
      altura,
      perimetro,
      superficie,
    });
  },
);


//PUT para modificar un rectángulo a partir de un id
app.put(
  "/rectangulos/:id",
  validarId,
  validarRectangulo,
  verificarValidaciones,
  async (req, res) => {

    const id=Number(req.params.id);

    const { base, altura } = req.body;

    //Calculo los valores en el servidor
    const perimetro = 2 * (base + altura);
    const superficie = base * altura;

    const [result] = await db.execute(
      `UPDATE rectangulos
      SET base=?, altura=?, perimetro=?, superficie=?
      WHERE id=?`,
      [base, altura, perimetro, superficie, id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).send("Rectángulo no encontrado");
    }

    res.send({
      id,
      base,
      altura,
      perimetro,
      superficie,
    });
  },
);


//DELETE para quitar un rectángulo a partir de un id
app.delete(
  "/rectangulos/:id",
  validarId,
  verificarValidaciones,
  async (req, res) => {

    const id = Number(req.params.id);

    const [result] = await db.execute(
      "DELETE FROM rectangulos WHERE id=?",
      [id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).send("Rectángulo no encontrado");
    }

    res.status(204).send();
  },
);


app.listen(port, () => {
  console.log(`La aplicación esta funcionando en ${port}`);
});