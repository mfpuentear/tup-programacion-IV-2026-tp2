import { Router } from "express";
import { validar } from "../middlewares/validar.js";
import {
  validarId,
  validarFiltro,
  validarCuerpo,
} from "../validators/calificaciones.validators.js";
import {
  listar,
  obtener,
  crear,
  modificar,
  eliminar,
} from "../controllers/calificaciones.controller.js";

const router = Router();

router.post("/", validarCuerpo, validar, crear);
router.get("/", validarFiltro, validar, listar);
router.get("/:id", validarId, validar, obtener);
router.put("/:id", validarId, validarCuerpo, validar, modificar);
router.delete("/:id", validarId, validar, eliminar);

export default router;