import { Router } from "express";
import { body, param, validationResult } from "express-validator";
import db from "./db.js";

const router = Router();

function validarErrores(req, res, next) {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
        return res.status(400).json({
            errores: errores.array()
        });
    }

    next();
}


// Crear rectángulo
router.post(
    "/",
    [
        body("base")
            .custom(valor => typeof valor === "number" && valor > 0)
            .withMessage("La base debe ser un número mayor que cero"),

        body("altura")
            .custom(valor => typeof valor === "number" && valor > 0)
            .withMessage("La altura debe ser un número mayor que cero")
    ],
    validarErrores,
    async (req, res) => {
        try {
            const { base, altura, perimetro, superficie } = req.body;

            if (perimetro !== undefined || superficie !== undefined) {
                return res.status(400).json({
                    error: "El perímetro y la superficie no deben enviarse"
                });
            }

            const perimetroCalculado = 2 * (base + altura);
            const superficieCalculada = base * altura;

            const [resultado] = await db.execute(
                `INSERT INTO rectangulos
                (base, altura, perimetro, superficie)
                VALUES (?, ?, ?, ?)`,
                [
                    base,
                    altura,
                    perimetroCalculado,
                    superficieCalculada
                ]
            );

            return res.status(201).json({
                id: resultado.insertId,
                base,
                altura,
                perimetro: perimetroCalculado,
                superficie: superficieCalculada
            });

        } catch (error) {
            return res.status(500).json({
                error: "Error al crear el rectángulo"
            });
        }
    }
);


// Listar todos los rectángulos
router.get("/", async (req, res) => {
    try {
        const [rectangulos] = await db.execute(
            "SELECT * FROM rectangulos"
        );

        return res.status(200).json(rectangulos);

    } catch (error) {
        return res.status(500).json({
            error: "Error al consultar los rectángulos"
        });
    }
});


// Consultar rectángulo por ID
router.get(
    "/:id",
    [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El id debe ser un número entero mayor que cero")
    ],
    validarErrores,
    async (req, res) => {
        try {
            const id = Number(req.params.id);

            const [rectangulos] = await db.execute(
                "SELECT * FROM rectangulos WHERE id = ?",
                [id]
            );

            if (rectangulos.length === 0) {
                return res.status(404).json({
                    error: "Rectángulo no encontrado"
                });
            }

            return res.status(200).json(rectangulos[0]);

        } catch (error) {
            return res.status(500).json({
                error: "Error al consultar el rectángulo"
            });
        }
    }
);


// Modificar rectángulo
router.put(
    "/:id",
    [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El id debe ser un número entero mayor que cero"),

        body("base")
            .custom(valor => typeof valor === "number" && valor > 0)
            .withMessage("La base debe ser un número mayor que cero"),

        body("altura")
            .custom(valor => typeof valor === "number" && valor > 0)
            .withMessage("La altura debe ser un número mayor que cero")
    ],
    validarErrores,
    async (req, res) => {
        try {
            const id = Number(req.params.id);
            const { base, altura, perimetro, superficie } = req.body;

            if (perimetro !== undefined || superficie !== undefined) {
                return res.status(400).json({
                    error: "El perímetro y la superficie no deben enviarse"
                });
            }

            const perimetroCalculado = 2 * (base + altura);
            const superficieCalculada = base * altura;

            const [resultado] = await db.execute(
                `UPDATE rectangulos
                SET base = ?, altura = ?, perimetro = ?, superficie = ?
                WHERE id = ?`,
                [
                    base,
                    altura,
                    perimetroCalculado,
                    superficieCalculada,
                    id
                ]
            );

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    error: "Rectángulo no encontrado"
                });
            }

            return res.status(200).json({
                id,
                base,
                altura,
                perimetro: perimetroCalculado,
                superficie: superficieCalculada
            });

        } catch (error) {
            return res.status(500).json({
                error: "Error al modificar el rectángulo"
            });
        }
    }
);


// Eliminar rectángulo
router.delete(
    "/:id",
    [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El id debe ser un número entero mayor que cero")
    ],
    validarErrores,
    async (req, res) => {
        try {
            const id = Number(req.params.id);

            const [resultado] = await db.execute(
                "DELETE FROM rectangulos WHERE id = ?",
                [id]
            );

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    error: "Rectángulo no encontrado"
                });
            }

            return res.status(200).json({
                mensaje: "Rectángulo eliminado"
            });

        } catch (error) {
            return res.status(500).json({
                error: "Error al eliminar el rectángulo"
            });
        }
    }
);

export default router;