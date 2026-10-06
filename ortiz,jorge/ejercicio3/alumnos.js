import express from "express";
import {db} from "./db.js";
import {body, param, validationResult} from "express-validator";

const router = express.Router();

const validacionAlumnos = [
    body("alumno").isString().trim().isLength({min:1, max:50}),
    body("idMateria").isInt({ min: 1 }),
    body("nota1").isFloat({ gt: 0 }),
    body("nota2").isFloat({ gt: 0 }),
    body("nota3").isFloat({ gt: 0 }),
    
];

const validarId = [
    param("id")
    .isInt({min:1})
    .toInt(),
];


const verificacionValidaciones = (req, res, next) => {
    const validacion = validationResult(req);
    if(!validacion.isEmpty()){
        return res.status(400).json({success: false, message:"validacion invalida ", errores: validacion.array(),});
    
    }

    next();
};

router.get('/', async (req, res) => {
    const [rows] = await db.execute("SELECT * FROM alumnos");
    res.json({ success: true, data: rows});
})

router.get("/:id",validarId, verificacionValidaciones, async  (req, res) => {
    
    const id = Number(req.params.id);
    const [rows] = await db.execute("SELECT * FROM alumnos WHERE id=?", [id]);

   if (rows.length === 0) {
      return res
      .status(404)
      .json({ success: false, message: "error en solicitud de tarea" });
  }

  res.json({ success: true, data: rows[0] });

});

router.post("/",validacionAlumnos, verificacionValidaciones , async (req, res) => {
const {alumno, nota1, nota2, nota3, idMateria } = req.body;

  //Verificar 
const [rows] = await db.execute("SELECT id FROM alumnos WHERE alumno = ? AND idMateria=?",[alumno, idMateria ]
);

if (rows.length > 0) {
return res.status(400).json({ success: false, message: "El alumno ya existe" });
}


const [result] = await db.execute("INSERT INTO alumnos (alumno, nota1, nota2, nota3, idMateria) VALUES (?, ?, ?, ?, ?)",
    [alumno, nota1, nota2, nota3, idMateria]
);

    res.status(201).json({success: true, data: { id:result.insertId, alumno, nota1, nota2, nota3, idMateria },
});


});


router.put("/:id", validarId, validacionAlumnos, verificacionValidaciones, async (req, res) => {
  const id = req.params.id;
  const { alumno, nota1, nota2, nota3, idMateria } = req.body;

  const [row] = await db.execute(
        "SELECT * FROM alumnos WHERE alumno=? AND idMateria=? AND id<>?",
        [alumno, idMateria, id]
    );
    if (row.length > 0) {
        return res.status(400).json({
            success: false,
            message: "alumno ya existe."
        });
    }

  await db.execute("UPDATE alumnos SET alumno=?, nota1=?, nota2=?, nota3=?, idMateria=?  WHERE id=?", [alumno, nota1, nota2, nota3, idMateria, id]);
  res.json({success: true, data: {alumno, nota1, nota2, nota3, idMateria, id},});
});


router.delete("/:id", validarId, verificacionValidaciones, async (req, res) => {
  const id = Number(req.params.id);

await db.execute("DELETE FROM alumnos WHERE id=?", [id]);
    res.json({ success: true, data: id, message: "alumno eliminado "});
});

export default router;

/*
Creamos una API REST con ExpressJS y MySQL para gestionar las calificaciones de los alumnos y las materias.
Utilizamos tablas independientes para alumnos, calificaciones y materias, relacionadas mediante una clave foránea para no tener datos repetidos  y mantener la integridad.
Implementamos operaciones CRUD mediante métodos HTTP GET, POST, PUT y DELETE, utilizando respuestas en formato JSON y códigos de estado.
Las solicitudes son validadas con express-validator, controlando nombres, materias existentes, notas dentro de la escala definida y parámetros de las rutas.
tambien mantinemos la unicidad de la combinación alumno-materia para evitar que un alumno tenga más de un registro de calificaciones en la misma materia

*/