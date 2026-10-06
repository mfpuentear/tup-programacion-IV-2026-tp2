// Actividad 1 - Gonzalez Facundo

const express = require('express');
const mysql = require('mysql2/promise');
const { body, param, query, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Conexion con MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tp2_rectangulos',
    waitForConnections: true,
    connectionLimit: 10
});

//errores de validacion
function validar(req, res, next) {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
        return res.status(400).json({
            errores: errores.array()
        });
    }

    next();
}

// Valida que contenga solamente lado1 y lado2
function validarCamposRectangulo(req, res, next) {
    const camposPermitidos = ['lado1', 'lado2'];
    const camposRecibidos = Object.keys(req.body || {});

    const camposInvalidos = camposRecibidos.filter(
        campo => !camposPermitidos.includes(campo)
    );

    if (camposInvalidos.length > 0) {
        return res.status(400).json({
            error: 'Solo se permiten los campos lado1 y lado2',
            camposInvalidos
        });
    }

    next();
}

// Valida los dos lados enviados
const validarLados = [
    body('lado1')
        .exists({ checkNull: true })
        .withMessage('El lado1 es obligatorio')
        .bail()
        .isFloat({ gt: 0 })
        .withMessage('El lado1 debe ser un numero mayor que cero')
        .toFloat(),

    body('lado2')
        .exists({ checkNull: true })
        .withMessage('El lado2 es obligatorio')
        .bail()
        .isFloat({ gt: 0 })
        .withMessage('El lado2 debe ser un numero mayor que cero')
        .toFloat()
];

// Valida el ID de la URL
const validarId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un entero positivo')
        .toInt()
];

// GET: listar rectangulos, con filtros opcionales
app.get(
    '/rectangulos',
    [
        query().custom((valor, { req }) => {
            const permitidos = ['lado1', 'lado2'];
            const recibidos = Object.keys(req.query);

            if (recibidos.some(campo => !permitidos.includes(campo))) {
                throw new Error('Los filtros permitidos son lado1 y lado2');
            }

            return true;
        }),
        query('lado1')
            .optional()
            .isFloat({ gt: 0 })
            .withMessage('El filtro lado1 debe ser mayor que cero')
            .toFloat(),
        query('lado2')
            .optional()
            .isFloat({ gt: 0 })
            .withMessage('El filtro lado2 debe ser mayor que cero')
            .toFloat()
    ],
    validar,
    async (req, res, next) => {
        try {
            let sql = 'SELECT * FROM rectangulos WHERE 1 = 1';
            const valores = [];

            if (req.query.lado1 !== undefined) {
                sql += ' AND lado1 = ?';
                valores.push(req.query.lado1);
            }

            if (req.query.lado2 !== undefined) {
                sql += ' AND lado2 = ?';
                valores.push(req.query.lado2);
            }

            const [rectangulos] = await pool.execute(sql, valores);

            res.json(rectangulos);
        } catch (error) {
            next(error);
        }
    }
);

// GET: consultar un rectangulo por ID
app.get(
    '/rectangulos/:id',
    validarId,
    validar,
    async (req, res, next) => {
        try {
            const [filas] = await pool.execute(
                'SELECT * FROM rectangulos WHERE id = ?',
                [req.params.id]
            );

            if (filas.length === 0) {
                return res.status(404).json({
                    error: 'Rectangulo no encontrado'
                });
            }

            res.json(filas[0]);
        } catch (error) {
            next(error);
        }
    }
);

// POST: crear un rectangulo
app.post(
    '/rectangulos',
    validarCamposRectangulo,
    validarLados,
    validar,
    async (req, res, next) => {
        try {
            const { lado1, lado2 } = req.body;

            // Los calculos se realizan en el servidor
            const perimetro = 2 * (lado1 + lado2);
            const superficie = lado1 * lado2;

            const [resultado] = await pool.execute(
                `INSERT INTO rectangulos
                 (lado1, lado2, perimetro, superficie)
                 VALUES (?, ?, ?, ?)`,
                [lado1, lado2, perimetro, superficie]
            );

            res.status(201).json({
                id: resultado.insertId,
                lado1,
                lado2,
                perimetro,
                superficie
            });
        } catch (error) {
            next(error);
        }
    }
);

// PUT: modificar los lados de un rectangulo
app.put(
    '/rectangulos/:id',
    validarId,
    validarCamposRectangulo,
    validarLados,
    validar,
    async (req, res, next) => {
        try {
            const { lado1, lado2 } = req.body;

            const perimetro = 2 * (lado1 + lado2);
            const superficie = lado1 * lado2;

            const [resultado] = await pool.execute(
                `UPDATE rectangulos
                 SET lado1 = ?, lado2 = ?,
                     perimetro = ?, superficie = ?
                 WHERE id = ?`,
                [
                    lado1,
                    lado2,
                    perimetro,
                    superficie,
                    req.params.id
                ]
            );

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    error: 'Rectangulo no encontrado'
                });
            }

            res.json({
                mensaje: 'Rectangulo modificado correctamente',
                id: Number(req.params.id),
                lado1,
                lado2,
                perimetro,
                superficie
            });
        } catch (error) {
            next(error);
        }
    }
);

// DELETE: eliminar un rectangulo
app.delete(
    '/rectangulos/:id',
    validarId,
    validar,
    async (req, res, next) => {
        try {
            const [resultado] = await pool.execute(
                'DELETE FROM rectangulos WHERE id = ?',
                [req.params.id]
            );

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    error: 'Rectangulo no encontrado'
                });
            }

            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
);

// Ruta inexistente
app.use((req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada'
    });
});

// Manejo de errores del servidor
app.use((error, req, res, next) => {
    console.error(error);

    res.status(500).json({
        error: 'Error interno del servidor'
    });
});

// Inicia la API
async function iniciarServidor() {
    try {
        await pool.query('SELECT 1');

        app.listen(PORT, () => {
            console.log(`Servidor iniciado en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('No se pudo conectar con MySQL:', error.message);
        process.exit(1);
    }
}

iniciarServidor();