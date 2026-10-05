import express from "express"
import {body, param, validationResult} from "express-validator"
import { db } from "./db.js"

const router = express.Router()

// Capturar y responder si hay errores de validación
const validarSolicitud = (req, res, next) => {
    const errores = validationResult(req)
    if (!errores.isEmpty()) {
        return res.status(400).json({errores: errores.array()})
    }
    next()
}

// Validaciones de lados
const validacionesLados = [
    body("lado1")
        .exists().withMessage("Lado1 es obligatorio")
        .isFloat({ gt: 0}).withMessage("lado1 tiene que ser positivo")
        .toFloat(),
    body("lado2")
        .exists().withMessage("Lado2 es obligatorio")
        .isFloat({ gt:0 }).withMessage("Lado2 debe ser mayor a 0")
        .toFloat()
]

// Validar id para los parametros de la URL
const validacionId = [
    param("id")
    .isInt({ gt:0 }).withMessage("El id debe ser un numero entero mayor a 0")
    .toInt()
]

// Obtener todos los retangulos
router.get("/", async (req, res) => {
    try {
        const[rectangulos] = await db.execute("SELECT * FROM rectangulos")
        res.send(rectangulos)       
    } catch (error) {
        return res.send(error)
    }
})

// Obtener rectangulo por id
router.get("/:id", validacionId, validarSolicitud, async(req, res) => {
    try {
        const {id} = req.params
        const [rectangulos] = await db.execute("SELECT * FROM rectangulos where idrectangulos=?", [id])
        if (rectangulos.length === 0) {
            return res.status(404).send ("Rectangulo no encontado")
        }
        res.send(rectangulos[0])
    }
    catch(error){
        return res.send(error)
    }
})

// Crear nuevo rectangulo
router.post("/", validacionesLados, validarSolicitud, async(req, res) => {
    try {
        const {lado1, lado2} = req.body
        const perimetro = 2 * (lado1 + lado2)
        const superficie = lado1 * lado2
        
        const [resultado] = await db.execute ("INSERT INTO rectangulos (lado1, lado2, perimetro, superficie) VALUES (?, ?, ?, ?)",
            [lado1, lado2, perimetro, superficie]
        )
        return res.status(201).json({
            id: resultado.insertId,
            lado1,
            lado2,
            perimetro,
            superficie
        })
    } catch (error) {
        return res.status(500).json({mensaje: "Error al crear el rectangulo", detalle: error.mensaje})
    }
})

// Modificar rectangulo que ya existe
router.put("/:id", [validacionId, validacionesLados], validarSolicitud, async (req, res) => {
    try {
        const { id } = req.params
        const { lado1, lado2 } = req.body

        const [rectangulos] = await db.execute("SELECT * FROM rectangulos WHERE idrectangulos=?", [id])
        if (rectangulos.length === 0) {
            return res.status(404).send("Rectangulo no encontado")
        }

        const perimetro = 2 * (lado1 + lado2)
        const superficie = lado1 * lado2

        await db.execute(
            "UPDATE rectangulos SET lado1=?, lado2=?, perimetro=?, superficie=? WHERE idrectangulos=?",
            [lado1, lado2, perimetro, superficie, id]
        )

        return res.json({
            id,
            lado1,
            lado2,
            perimetro,
            superficie
        })
    } catch (error) {
        return res.status(500).json({ mensaje: "Error al actualizar el rectangulo", detalle: error.message })
    }
})

// Eliminar rectangulo
router.delete("/:id", validacionId, validarSolicitud, async (req, res) => {
    try {
        const { id } = req.params

        const [resultado] = await db.execute("DELETE FROM rectangulos WHERE idrectangulos=?", [id])

        if (resultado.affectedRows === 0) {
            return res.status(404).send("Rectangulo no encontado")
        }

        return res.json({ mensaje: "Rectangulo eliminado correctamente" })
    } catch (error) {
        return res.status(500).json({ mensaje: "Error al eliminar el rectangulo", detalle: error.message })
    }
})

export default router