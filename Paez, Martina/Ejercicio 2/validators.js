const { body, param, query, validationResult } = require('express-validator');
const pool = require('./db');

/**
 * Criterio de comparacion de nombres (consistente, documentado):
 * dos nombres se consideran el mismo si, al pasarlos a minusculas y
 * sacarles los espacios del principio y del final, quedan identicos.
 * Ej: "Lavar platos", "lavar platos" y "  Lavar Platos  " son la misma
 * tarea. Esto se aplica tanto en la API (aca) como en la base de datos
 * (columna nombre_normalizado con restriccion UNIQUE), como doble
 * resguardo ante condiciones de carrera.
 */
function normalizarNombre(nombre) {
  return nombre.trim().toLowerCase();
}

// Verifica unicidad consultando la base. Si idAExcluir se pasa (caso de
// PUT), no tiene en cuenta la propia tarea que se esta modificando.
async function nombreEsUnico(nombre, idAExcluir) {
  const normalizado = normalizarNombre(nombre);
  let sql = 'SELECT id FROM tareas WHERE nombre_normalizado = ?';
  const params = [normalizado];

  if (idAExcluir !== undefined) {
    sql += ' AND id != ?';
    params.push(idAExcluir);
  }

  const [rows] = await pool.query(sql, params);
  return rows.length === 0;
}

const validarNombreCreacion = [
  body('nombre')
    .exists({ checkFalsy: true }).withMessage('nombre es requerido')
    .bail()
    .isString().withMessage('nombre debe ser un texto')
    .bail()
    .trim()
    .isLength({ min: 1, max: 150 }).withMessage('nombre debe tener entre 1 y 150 caracteres')
    .bail()
    .custom(async (nombre) => {
      const esUnico = await nombreEsUnico(nombre);
      if (!esUnico) {
        throw new Error('Ya existe una tarea con ese nombre');
      }
      return true;
    }),
];

// Para modificar: el nombre es opcional (se puede actualizar solo el
// estado), pero si viene, se valida igual que en la creacion, excluyendo
// a la propia tarea de la verificacion de unicidad.
const validarNombreModificacion = [
  body('nombre')
    .optional()
    .isString().withMessage('nombre debe ser un texto')
    .bail()
    .trim()
    .isLength({ min: 1, max: 150 }).withMessage('nombre debe tener entre 1 y 150 caracteres')
    .bail()
    .custom(async (nombre, { req }) => {
      const esUnico = await nombreEsUnico(nombre, Number(req.params.id));
      if (!esUnico) {
        throw new Error('Ya existe una tarea con ese nombre');
      }
      return true;
    }),
  body('completada')
    .optional()
    .isBoolean().withMessage('completada debe ser un valor booleano (true/false)')
    .toBoolean(),
];

const validarIdParam = [
  param('id')
    .isInt({ gt: 0 }).withMessage('id debe ser un entero positivo')
    .toInt(),
];

// El filtro de estado solo admite "true" o "false" como string en la
// query, tal como exige el enunciado ("el valor utilizado para filtrar
// pertenezca a los estados admitidos").
const validarFiltroCompletada = [
  query('completada')
    .optional()
    .isIn(['true', 'false']).withMessage('completada debe ser "true" o "false"'),
];

function manejarErroresDeValidacion(req, res, next) {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({
      mensaje: 'Datos invalidos',
      errores: errores.array().map((e) => ({ campo: e.path, detalle: e.msg })),
    });
  }
  next();
}

module.exports = {
  normalizarNombre,
  validarNombreCreacion,
  validarNombreModificacion,
  validarIdParam,
  validarFiltroCompletada,
  manejarErroresDeValidacion,
};
