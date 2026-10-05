import express from "express";
import { db } from "./db.js";
import {
    validarFiltrosRectangulos,
    validarId,
    validarRectangulo,
    verificarValidaciones
} from "./validaciones.js";

const router = express.Router();

function calcularDatos(ladoA, ladoB) {
  const perimetro = 2 * (ladoA + ladoB);
  const superficie = ladoA * ladoB;

    return {
        perimetro,
        superficie
    };
}

router.get(
    "/",
    validarFiltrosRectangulos,
    verificarValidaciones,
    async (req, res) => {
        const filtros = [];
        const valores = [];

    const { ladoMin, ladoMax } = req.query;

    if (ladoMin !== undefined) {
        filtros.push("lado_a >= ? AND lado_b >= ?");
        valores.push(Number(ladoMin), Number(ladoMin));
    }

    if (ladoMax !== undefined) {
        filtros.push("lado_a <= ? AND lado_b <= ?");
        valores.push(Number(ladoMax), Number(ladoMax));
    }

    let sql =
        "SELECT id, lado_a AS ladoA, lado_b AS ladoB, perimetro, superficie FROM rectangulos";

    if (filtros.length > 0) {
        sql += " WHERE " + filtros.join(" AND ");
    }

    const [rectangulos] = await db.execute(sql, valores);

    res.status(200).json({
        cantidad: rectangulos.length,
        rectangulos
        });
    }
);

router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
    const id = Number(req.params.id);

    const [rectangulos] = await db.execute(
        "SELECT id, lado_a AS ladoA, lado_b AS ladoB, perimetro, superficie FROM rectangulos WHERE id = ?",
        [id]
    );

    if (rectangulos.length === 0) {
        return res.status(404).json({
            mensaje: "Rectangulo no encontrado"
        });
    }

    res.status(200).json(rectangulos[0]);
});

router.post(
    "/",
    validarRectangulo,
    verificarValidaciones,
    async (req, res) => {
        const ladoA = Number(req.body.ladoA);
        const ladoB = Number(req.body.ladoB);

        const { perimetro, superficie } = calcularDatos(ladoA, ladoB);

        const [resultado] = await db.execute(
        "INSERT INTO rectangulos (lado_a, lado_b, perimetro, superficie) VALUES (?, ?, ?, ?)",
        [ladoA, ladoB, perimetro, superficie]
    );

    res.status(201).json({
        mensaje: "Rectangulo creado correctamente",
        rectangulo: {
            id: resultado.insertId,
            ladoA,
            ladoB,
            perimetro,
            superficie
        }
        });
    }
);

router.put(
    "/:id",
    validarId,
    validarRectangulo,
    verificarValidaciones,
    async (req, res) => {
        const id = Number(req.params.id);
        const ladoA = Number(req.body.ladoA);
        const ladoB = Number(req.body.ladoB);

        const [rectangulos] = await db.execute(
        "SELECT id FROM rectangulos WHERE id = ?",
        [id]
    );

    if (rectangulos.length === 0) {
        return res.status(404).json({
            mensaje: "Rectangulo no encontrado"
        });
    }

    const { perimetro, superficie } = calcularDatos(ladoA, ladoB);

    await db.execute(
        "UPDATE rectangulos SET lado_a = ?, lado_b = ?, perimetro = ?, superficie = ? WHERE id = ?",
        [ladoA, ladoB, perimetro, superficie, id]
    );

    res.status(200).json({
        mensaje: "Rectangulo actualizado correctamente",
        rectangulo: {
            id,
            ladoA,
            ladoB,
            perimetro,
            superficie
        }
    });
    }
);

router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
    const id = Number(req.params.id);

    const [resultado] = await db.execute("DELETE FROM rectangulos WHERE id = ?", [
        id
    ]);

    if (resultado.affectedRows === 0) {
        return res.status(404).json({
            mensaje: "Rectangulo no encontrado"
        });
    }

    res.status(200).json({
        mensaje: "Rectangulo eliminado correctamente"
    });
});

export default router;