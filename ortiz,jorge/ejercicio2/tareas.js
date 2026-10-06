import express from "express";
import {db} from "./db.js";
import {param, validationResult, body,query} from "express-validator";

const router = express.Router();

const validacionTareas = [
    body("tarea").exists().isString().trim().isLength({min:1, max:50}).withMessage("nombre de tarea invalido"),
    body("completa").isBoolean().toBoolean(),
];

const validarId = [
    param("id")
    .isInt({min:1})
    .toInt(),
];

const validacionFiltros = [

    query("completa")
    .optional()
    .isBoolean()
    .toBoolean(),
];

const verificacionValidaciones = (req, res, next) => {
    const validacion = validationResult(req);
    if(!validacion.isEmpty()){
        return res.status(400).json({success: false, message:"validacion invalida ", errores: validacion.array(),});
    
    }

    next();
};

router.get("/", validacionFiltros, verificacionValidaciones, async (req, res) => {
 const filtros = [];
const parametros = [];
  const { completa } = req.query;

let sql = "SELECT * FROM tabla_tareas";

 if (completa !== undefined) {
    filtros.push("completa = ?");
    parametros.push(completa === "true" ? 1 : 0);
  }

  

  if (filtros.length > 0) {
    sql += " WHERE " + filtros.join(" AND ");
  }


  
  console.log(sql);

  const [rows] = await db.execute(sql, parametros);
  res.json({ success: true, data: rows });

});

router.get("/:id",validarId, verificacionValidaciones, async  (req, res) => {
    
    const id = Number(req.params.id);
    const [rows] = await db.execute("SELECT * FROM tabla_tareas WHERE id=?", [id]);

   if (rows.length === 0) {
      return res
      .status(404)
      .json({ success: false, message: "error en solicitud de tarea" });
  }

  res.json({ success: true, data: rows[0] });

});

router.post("/",validacionTareas, 
verificacionValidaciones , async (req, res) => {
const {tarea,completa } = req.body;

console.log("tarea:", tarea);
console.log("completa:", completa);


  //Verificar 
const [rows] = await db.execute(
"SELECT id FROM tabla_tareas WHERE tarea = ?",[tarea]
);

if (rows.length > 0) {
return res.status(400).json({ success: false, message: "La tarea ya existe" });
}


const [result] = await db.execute("INSERT INTO tabla_tareas (tarea,completa) VALUES (?,?)",
    [tarea, completa]
);

    res.status(201).json({success: true, data: { id:result.insertId, tarea, completa },
});


});


router.put("/:id", validarId, validacionTareas, verificacionValidaciones, async (req, res) => {
  const id = req.params.id;
  const { tarea, completa } = req.body;

  await db.execute("UPDATE tabla_tareas SET tarea=?, completa=? WHERE id=?", [tarea,completa,id]);
  res.json({success: true, data: { tarea, completa, id },});
});



// Borrar una tarea de la base de datos
router.delete("/:id", validarId, verificacionValidaciones, async (req, res) => {
  const id = req.params.id;

  await db.execute("DELETE FROM tabla_tareas WHERE id=?", [id]);
  res.json({ success: true, data: id });
});




export default router;


/*
La API utiliza el recurso "tareas" siguiendo el modelo REST, con los métodos GET, POST, PUT y DELETE para consultar, crear, modificar y eliminar tareas. Cada tarea posee un id, un nombre y un estado completada, almacenados en MySQL, utilizando el id como identificador único. Se impide la creación de tareas con nombres repetidos, considerando iguales aquellos nombres que coincidan luego de eliminar espacios al inicio y al final. Se utiliza express-validator para validar parámetros, consultas y cuerpos, verificando ids válidos, nombres correctos, estados booleanos y filtros permitidos. Finalmente, la API utiliza códigos HTTP adecuados y respuestas JSON para informar el resultado de cada operación.
*/