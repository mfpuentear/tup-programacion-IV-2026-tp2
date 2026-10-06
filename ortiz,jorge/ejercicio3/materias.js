import express from "express";
import { db } from "./db.js";
import {body, param, validationResult} from "express-validator";

const router = express.Router();




const validarId = [
    param("id")
    .isInt({min:1})
    .toInt(),
];



const validarMaterias = [
    body("materia").isString().isLength({ max: 50 })
]

const verificacionValidaciones = (req, res, next) => {
    const validacion = validationResult(req);
    if(!validacion.isEmpty()){
        return res.status(400).json({success: false, message:"validacion invalida ", errores: validacion.array(),});
    
    }

    next();
};

router.get("/", async (req, res) => {
    const [rows] = await db.execute('SELECT * FROM materias');
    res.json({ success: true, data: rows});
});

router.get("/:id", validarId, verificacionValidaciones, async (req, res) => {
    const id = Number(req.params.id);
    const [rows] = await db.execute("SELECT * FROM materias WHERE id=?", [id]);


    if (rows.length === 0) {
        return res.status(404).json({ success: false, message: "Materia no encontrada." });
    }


    res.json({ success: true, data: rows[0] });
});

router.post("/", validarMaterias, verificacionValidaciones, async (req, res) => {
    const { materia } = req.body;
    const [result] = await db.execute(
        "INSERT INTO materias (materia) VALUES (?)", [materia]
    );


    res.status(201).json({success: true, data: { id: result.insertId, materia },
    });
});


router.put("/:id", validarId, validarMaterias, verificacionValidaciones, async (req, res) => {
    const id = Number(req.params.id);
    const { materia } = req.body;


    await db.execute(
        "UPDATE materias SET materia=? WHERE id=?", [materia, id]
    );

    res.json({success:true, data: { materia },});
});


router.delete("/:id", validarId, verificacionValidaciones, async (req, res) => {
    const id = Number(req.params.id);


    await db.execute('DELETE FROM materias WHERE id=?', [id]);

    res.json({ success: true, data: id});
});

export default router;

/*

El código implementa una API REST con ExpressJS para gestionar las materias almacenadas en una base de datos MySQL.
Nos permite consultar, crear, modificar y eliminar materias mediante los métodos HTTP GET, POST, PUT y DELETE.
Utilizando express-validator para validar los identificadores y comprobar que el nombre de las materias sean válidos.
Las consultas SQL se realizan mediante parámetros para poder mantener toda la comunicación segura con dicha base de datos.
Tambien, la API devuelve respuestas en JSON y códigos HTTP adecuados para informar el resultado de cada operación.

*/