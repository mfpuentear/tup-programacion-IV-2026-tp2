import express from "express";
import { body, param, validationResult } from "express-validator";
import conexion from "./db.js";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        mensaje: "API de rectángulos funcionando"
    });
});

app.get("/rectangulos", (req, res) => {
    const sql = "SELECT * FROM rectangulos";

    conexion.query(sql, (error, resultados) => {
        if (error) {
            return res.status(500).json({
                error: "Error al consultar los rectángulos"
            });
        }

        res.status(200).json(resultados);
    });
});

app.post(
    "/rectangulos",
    [
        body("lado1")
            .exists().withMessage("El lado1 es obligatorio")
            .isFloat({ gt: 0 }).withMessage("El lado1 debe ser un número mayor que cero"),

        body("lado2")
            .exists().withMessage("El lado2 es obligatorio")
            .isFloat({ gt: 0 }).withMessage("El lado2 debe ser un número mayor que cero"),
        
        body()
         .custom((value) => {
         const camposPermitidos = ["lado1", "lado2"];
         const camposRecibidos = Object.keys(value);

        return camposRecibidos.every((campo) =>
            camposPermitidos.includes(campo)
        );
    })
    .withMessage("Solo se permiten los campos lado1 y lado2")
    ],
    (req, res) => {
        const errores = validationResult(req);

        if (!errores.isEmpty()) {
            return res.status(400).json({
                errores: errores.array()
            });
        }

        const lado1 = Number(req.body.lado1);
        const lado2 = Number(req.body.lado2);

        const perimetro = 2 * (lado1 + lado2);
        const superficie = lado1 * lado2;

        const sql = `
            INSERT INTO rectangulos (lado1, lado2, perimetro, superficie)
            VALUES (?, ?, ?, ?)
        `;

        conexion.query(
            sql,
            [lado1, lado2, perimetro, superficie],
            (error, resultado) => {
                if (error) {
                    return res.status(500).json({
                        error: "Error al crear el rectángulo"
                    });
                }

                res.status(201).json({
                    id: resultado.insertId,
                    lado1,
                    lado2,
                    perimetro,
                    superficie
                });
            }
        );
    }
);

app.get(
    "/rectangulos/:id",
    [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El id debe ser un número entero mayor que cero")
    ],
    (req, res) => {
        const errores = validationResult(req);

        if (!errores.isEmpty()) {
            return res.status(400).json({
                errores: errores.array()
            });
        }

        const id = req.params.id;

        const sql = "SELECT * FROM rectangulos WHERE id = ?";

        conexion.query(sql, [id], (error, resultados) => {
            if (error) {
                return res.status(500).json({
                    error: "Error al consultar el rectángulo"
                });
            }

            if (resultados.length === 0) {
                return res.status(404).json({
                    error: "Rectángulo no encontrado"
                });
            }

            res.status(200).json(resultados[0]);
        });
    }
);

app.put(
    "/rectangulos/:id",
    [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El id debe ser un número entero mayor que cero"),

        body("lado1")
            .exists().withMessage("El lado1 es obligatorio")
            .isFloat({ gt: 0 }).withMessage("El lado1 debe ser un número mayor que cero"),

        body("lado2")
            .exists().withMessage("El lado2 es obligatorio")
            .isFloat({ gt: 0 }).withMessage("El lado2 debe ser un número mayor que cero")
    ],
    (req, res) => {
        const errores = validationResult(req);

        if (!errores.isEmpty()) {
            return res.status(400).json({
                errores: errores.array()
            });
        }

        const id = req.params.id;
        const lado1 = Number(req.body.lado1);
        const lado2 = Number(req.body.lado2);

        const perimetro = 2 * (lado1 + lado2);
        const superficie = lado1 * lado2;

        const sql = `
            UPDATE rectangulos
            SET lado1 = ?, lado2 = ?, perimetro = ?, superficie = ?
            WHERE id = ?
        `;

        conexion.query(
            sql,
            [lado1, lado2, perimetro, superficie, id],
            (error, resultado) => {
                if (error) {
                    return res.status(500).json({
                        error: "Error al modificar el rectángulo"
                    });
                }

                if (resultado.affectedRows === 0) {
                    return res.status(404).json({
                        error: "Rectángulo no encontrado"
                    });
                }

                res.status(200).json({
                    id: Number(id),
                    lado1,
                    lado2,
                    perimetro,
                    superficie
                });
            }
        );
    }
);

app.delete(
    "/rectangulos/:id",
    [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El id debe ser un número entero mayor que cero")
    ],
    (req, res) => {
        const errores = validationResult(req);

        if (!errores.isEmpty()) {
            return res.status(400).json({
                errores: errores.array()
            });
        }

        const id = req.params.id;

        const sql = "DELETE FROM rectangulos WHERE id = ?";

        conexion.query(sql, [id], (error, resultado) => {
            if (error) {
                return res.status(500).json({
                    error: "Error al eliminar el rectángulo"
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    error: "Rectángulo no encontrado"
                });
            }

            res.status(200).json({
                mensaje: "Rectángulo eliminado correctamente"
            });
        });
    }
);

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});