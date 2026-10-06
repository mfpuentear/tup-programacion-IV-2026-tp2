import { Router } from "express";
import {
  crear,
  listar,
  obtener,
  modificar,
  eliminar,
} from "../controllers/tareas.controller.js";
import {
  validarCreacion,
  validarModificacion,
  validarId,
  validarFiltro,
} from "../validators/tareas.validators.js";
import { validar } from "../middlewares/validar.js";

const router = Router();

router.post("/", validarCreacion, validar, crear);
router.get("/", validarFiltro, validar, listar);
router.get("/:id", validarId, validar, obtener);
router.put("/:id", validarId, validarModificacion, validar, modificar);
router.delete("/:id", validarId, validar, eliminar);

export default router;