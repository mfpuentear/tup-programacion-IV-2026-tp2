import { Router } from "express";
import {
  crear,
  listar,
  obtener,
  modificar,
  eliminar,
} from "../controllers/rectangulos.controller.js";
import { validarCreacion, validarId } from "../validators/rectangulos.validators.js";
import { validar } from "../middlewares/validar.js";

const router = Router();

router.post("/", validarCreacion, validar, crear);
router.get("/", listar);
router.get("/:id", validarId, validar, obtener);
router.put("/:id", validarId, validarCreacion, validar, modificar);
router.delete("/:id", validarId, validar, eliminar);

export default router;