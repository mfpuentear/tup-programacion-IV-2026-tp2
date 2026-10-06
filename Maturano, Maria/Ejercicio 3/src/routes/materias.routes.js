import { Router } from "express";
import { validar } from "../middlewares/validar.js";
import { validarId, validarCuerpo } from "../validators/materias.validators.js";
import {
  listar,
  obtener,
  crear,
  modificar,
  eliminar,
} from "../controllers/materias.controller.js";

const router = Router();

router.post("/", validarCuerpo, validar, crear);
router.get("/", listar);
router.get("/:id", validarId, validar, obtener);
router.put("/:id", validarId, validarCuerpo, validar, modificar);
router.delete("/:id", validarId, validar, eliminar);

export default router;