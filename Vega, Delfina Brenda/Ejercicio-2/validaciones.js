import { body, param, query, validationResult } from "express-validator";
import { db } from "./db.js";

export const MENSAJE_NOMBRE_DUPLICADO = "Ya existe una tarea con ese nombre";

export const validarId = param("id")
  .isInt({ min: 1 })
  .withMessage("id debe ser un entero positivo");

// Validacion del filtro de estado del listado
export const validarFiltroTareas = query("estado")
  .optional()
  .isIn(["completadas", "pendientes"])
  .withMessage("estado debe ser 'completadas' o 'pendientes'");

// Para la comparacion de nombres se quitan los espacios al inicio, al final 
// y los repetidos la base compara sin distinguir mayusculas ni tildes
const normalizarNombre = (nombre) => nombre.trim().replace(/\s+/g, " ");

//Validacion para el nombre de la tarea con bail() detiene la cadena ante el primer fallo
const validarNombre = body("nombre")
  .exists({ values: "null" })
  .withMessage("nombre es obligatorio")
  .bail()
  .isString()
  .withMessage("nombre debe ser un texto")
  .bail()
  .customSanitizer(normalizarNombre)
  .notEmpty()
  .withMessage("nombre no puede estar vacio")
  .bail()
  .isLength({ max: 100 })
  .withMessage("nombre admite hasta 100 caracteres")
  .bail()
  .custom(async (nombre, { req }) => {

    // En PUT se ignora la propia tarea, en POST no hay id (se utiliza 0)
    const idActual = Number(req.params.id) || 0;
    const [filas] = await db.execute(
      "SELECT id FROM tareas WHERE nombre = ? AND id <> ?",
      [nombre, idActual],
    );
    if (filas.length > 0) {
      throw new Error(MENSAJE_NOMBRE_DUPLICADO);
    }
  });

const esBooleano = (valor) => typeof valor === "boolean";

// Al crear, completada es opcional, por defecto false
const completadaOpcional = body("completada")
  .optional()
  .custom(esBooleano)
  .withMessage("completada debe ser true o false");

  // Al modificar, completada es obligatoria
const completadaObligatoria = body("completada")
  .exists({ values: "null" })
  .withMessage("completada es obligatorio")
  .bail()
  .custom(esBooleano)
  .withMessage("completada debe ser true o false");


export const validarTareaCrear = [validarNombre, completadaOpcional];
export const validarTareaModificar = [validarNombre, completadaObligatoria];
export const validarEstado = [completadaObligatoria];

// Middleware para verificar validaciones
export const verificarValidaciones = (req, res, next) => {
  const resultadoValidacion = validationResult(req);
  if (!resultadoValidacion.isEmpty()) {
    const errores = resultadoValidacion.array();
    const soloDuplicado = errores.every(
      (e) => e.msg === MENSAJE_NOMBRE_DUPLICADO,
    );
    return res.status(soloDuplicado ? 409 : 400).json({
      mensaje: soloDuplicado ? MENSAJE_NOMBRE_DUPLICADO : "Parametros no validos",
      errores,
    });
  }
  next();
};