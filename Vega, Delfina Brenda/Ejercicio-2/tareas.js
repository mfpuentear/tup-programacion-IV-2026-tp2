import express from "express";
import { db } from "./db.js";
import {
    MENSAJE_NOMBRE_DUPLICADO,
  validarEstado,
  validarFiltroTareas,
  validarId,
  validarTareaCrear,
  validarTareaModificar,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

const SELECT = "SELECT id, nombre, completada FROM tareas";

//La base devuelve 0/1, devuelve true/false
const aTarea = (fila) => ({
    id: fila.id,
    nombre: fila.nombre,
    completada: Boolean(fila.completada),
});

//GET para entregar listado de tareas
router.get(
    "/",
    validarFiltroTareas,
    verificarValidaciones,
    async (req, res) => {
        const parametros = [];
        let sql = SELECT;

        const { estado } = req.query;

        if(estado !== undefined) {
            sql += " WHERE completada = ?";
            parametros.push(estado === "completadas" ? 1 : 0);
        }

        sql += " ORDER BY id";

        const [tareas] = await db.execute(sql, parametros);
        res.send(tareas.map(aTarea));
    },
);

// GET para entregar detalle de tarea

router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);

  const [tareas] = await db.execute(SELECT + " WHERE id = ?", [id]);

  if (tareas.length === 0) {
    return res.status(404).send("Tarea no encontrada");
  }

  res.send(aTarea(tareas[0]));
});


//POST para crear una tarea

router.post("/", validarTareaCrear, verificarValidaciones, async (req, res) => {
    const { nombre } = req.body;
    const completada = req.body.completada ?? false;
    
    try{
        const[result] = await db.execute(
            "INSERT INTO tareas (nombre, completada) VALUES (?,?)",
            [nombre, completada ? 1 : 0],
        );

        res.status(201).send({ id: result.insertId, nombre, completada });
    } catch (e) {
        //Respaldo  de la regla de unicidad por ejemplo, dos pedidos simultaneos

        if (e.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ mensaje: MENSAJE_NOMBRE_DUPLICADO });
        }

        throw e;
    }
});

//PUT para modificar tarea completada (nombre y completada)
router.put(
  "/:id",
  validarId,
  validarTareaModificar,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    const { nombre, completada } = req.body;

    try {
      const [result] = await db.execute(
        "UPDATE tareas SET nombre = ?, completada = ? WHERE id = ?",
        [nombre, completada ? 1 : 0, id],
      );

      if (result.affectedRows === 0) {
        return res.status(404).send("Tarea no encontrada");
      }

      res.send({ id, nombre, completada });

    } catch (e) {
      if (e.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ mensaje: MENSAJE_NOMBRE_DUPLICADO });
      }

      throw e;
    }
  },
);

// PATCH para cambiar solo el estado de la tarea
router.patch(
  "/:id",
  validarId,
  validarEstado,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    const { completada } = req.body;

    const [result] = await db.execute(
      "UPDATE tareas SET completada = ? WHERE id = ?",
      [completada ? 1 : 0, id],
    );

    if(result.affectedRows === 0) {
      return res.status(404).send("Tarea no encontrada");
    }

    const [tareas] = await db.execute(SELECT + " WHERE id = ?", [id]);
    res.send(aTarea(tareas[0]));

  },
);

// DELETE para eliminar tarea
router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);

  const [result] = await db.execute("DELETE FROM tareas WHERE id = ?", [id]);

  if (result.affectedRows === 0) {
    return res.status(404).send("Tarea no encontrada");
  }

  res.sendStatus(204);
});

export default router;