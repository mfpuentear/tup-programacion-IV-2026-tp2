import express from "express";
import { db } from "./db.js";
import {
  validarFiltrosRectangulos,
  validarId,
  validarRectangulo,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

const SELECT =
  "SELECT id, lado_a AS ladoA, lado_b AS ladoB, perimetro, superficie " +
  "FROM rectangulos";

// Calcula perimetro y superficie en el servidor
function calcular(ladoA, ladoB) {
  return {
    perimetro: Number((2 * (ladoA + ladoB)).toFixed(2)),
    superficie: Number((ladoA * ladoB).toFixed(4)),
  };
}

// GET para entregar listado de rectangulos
router.get(
  "/",
  validarFiltrosRectangulos,
  verificarValidaciones,
  async (req, res) => {
    const filtros = [];
    const parametros = [];

    const { superficieMin, superficieMax } = req.query;

    if (superficieMin !== undefined) {
      filtros.push("superficie >= ?");
      parametros.push(Number(superficieMin));
    }

    if (superficieMax !== undefined) {
      filtros.push("superficie <= ?");
      parametros.push(Number(superficieMax));
    }

    let sql = SELECT;
    if (filtros.length > 0) {
      sql += " WHERE " + filtros.join(" AND ");
    }

    const [rectangulos] = await db.execute(sql, parametros);
    res.send(rectangulos);
  },
);

//Get para entregar detalle de rectangulo
router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
    const id = Number(req.params.id);

    const [rectangulos] = await db.execute(SELECT + " WHERE id = ?", [id]);

    if (rectangulos.length === 0) {
        return res.status(404).send("Rectangulo no encontrado");
    }

    res.send(rectangulos[0]);
});

//POST para crear rectangulo
router.post("/", validarRectangulo, verificarValidaciones, async (req, res) => {
    const ladoA= Number(req.body.ladoA);
    const ladoB= Number(req.body.ladoB);
    const { perimetro, superficie } = calcular(ladoA, ladoB);

    const [result] = await db.execute(
        "INSERT INTO rectangulos (lado_a, lado_b, perimetro, superficie) VALUES (?,?,?,?)",
       [ladoA, ladoB, perimetro, superficie],
    );

    res
    .status(201)
    .send({ id: result.insertId, ladoA, ladoB, perimetro, superficie });
});

//PUT para modificar rectangulo
router.put(
    "/:id",
    validarId,
    validarRectangulo,
    verificarValidaciones,
    async (req, res) => {
        const id = Number(req.params.id);
        const ladoA = Number(req.body.ladoA);
        const ladoB = Number(req.body.ladoB);
        const { perimetro, superficie } = calcular(ladoA, ladoB);

        const [result]= await db.execute(
            "UPDATE rectangulos SET lado_a = ?, lado_b = ?, perimetro = ?, superficie = ? WHERE id = ?",
            [ladoA, ladoB, perimetro, superficie, id],

        );

        if (result.affectedRows === 0) {
            return res.status(404).send ("Rectangulo no encontrado");
        }

        res.send({id, ladoA, ladoB, perimetro, superficie });
    },

);

//DELETE para eliminar rectangulo
router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
    const id = Number(req.params.id);

    const [result] = await db.execute("DELETE FROM rectangulos WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
        return res.status(404).send("Rectangulo no encontrado");
    }

    res.sendStatus(204);
});

export default router;