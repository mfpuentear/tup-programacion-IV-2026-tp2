const { body, param, validationResult } = require('express-validator');
const pool = require('./db');

// Escala de notas: 1 a 10 (documentado en el README). Se valida tanto
// aca como con un CHECK en la base de datos.
const NOTA_MIN = 1;
const NOTA_MAX = 10;

// Mismo criterio de comparacion que en el Ejercicio 2: minusculas y sin
// espacios al borde. Se usa para detectar de forma consistente si dos
// registros corresponden al mismo alumno.
function normalizarNombre(nombre) {
  return nombre.trim().toLowerCase();
}

// ---------- Materias ----------

const validarNombreMateria = [
  body('nombre')
    .exists({ checkFalsy: true }).withMessage('nombre es requerido')
    .bail()
    .isString().withMessage('nombre debe ser un texto')
    .bail()
    .trim()
    .isLength({ min: 1, max: 150 }).withMessage('nombre debe tener entre 1 y 150 caracteres'),
];

// ---------- Calificaciones ----------

// Verifica que la materia exista, y de paso deja el dato disponible por
// si el controlador lo necesita (no se usa aca, pero queda documentado
// el motivo de la validacion).
async function materiaExiste(materiaId) {
  const [rows] = await pool.query('SELECT id FROM materias WHERE id = ?', [materiaId]);
  return rows.length > 0;
}

async function combinacionEsUnica(alumno, materiaId, idAExcluir) {
  const normalizado = normalizarNombre(alumno);
  let sql = 'SELECT id FROM calificaciones WHERE alumno_normalizado = ? AND materia_id = ?';
  const params = [normalizado, materiaId];

  if (idAExcluir !== undefined) {
    sql += ' AND id != ?';
    params.push(idAExcluir);
  }

  const [rows] = await pool.query(sql, params);
  return rows.length === 0;
}

const validarAlumno = body('alumno')
  .exists({ checkFalsy: true }).withMessage('alumno es requerido')
  .bail()
  .isString().withMessage('alumno debe ser un texto')
  .bail()
  .trim()
  .isLength({ min: 1, max: 150 }).withMessage('alumno debe tener entre 1 y 150 caracteres');

const validarMateriaId = body('materiaId')
  .exists().withMessage('materiaId es requerido')
  .bail()
  .isInt({ gt: 0 }).withMessage('materiaId debe ser un entero positivo')
  .bail()
  .toInt()
  .custom(async (materiaId) => {
    const existe = await materiaExiste(materiaId);
    if (!existe) {
      throw new Error('La materia indicada no existe');
    }
    return true;
  });

const validarNotas = body('notas')
  .exists().withMessage('notas es requerido')
  .bail()
  .isArray({ min: 3, max: 3 }).withMessage('notas debe ser un arreglo de exactamente 3 elementos')
  .bail()
  .custom((notas) => {
    const todasValidas = notas.every(
      (n) => typeof n === 'number' && n >= NOTA_MIN && n <= NOTA_MAX
    );
    if (!todasValidas) {
      throw new Error(`cada nota debe ser un numero entre ${NOTA_MIN} y ${NOTA_MAX}`);
    }
    return true;
  });

// Para crear: alumno, materiaId y notas son obligatorios, y se valida
// que la combinacion alumno-materia no exista todavia.
const validarCreacionCalificacion = [
  validarAlumno,
  validarMateriaId,
  validarNotas,
  body().custom(async (_, { req }) => {
    // Este chequeo final de unicidad se hace sobre el body completo
    // porque necesita tanto "alumno" como "materiaId" ya validados.
    if (req.body.alumno && req.body.materiaId) {
      const esUnico = await combinacionEsUnica(req.body.alumno, Number(req.body.materiaId));
      if (!esUnico) {
        throw new Error('Ya existe un registro de calificaciones para ese alumno en esa materia');
      }
    }
    return true;
  }),
];

// Para modificar: todos los campos son opcionales (se puede actualizar
// solo las notas, por ejemplo), pero si vienen se validan igual.
const validarModificacionCalificacion = [
  body('alumno').optional().custom((v) => typeof v === 'string' && v.trim().length > 0 && v.trim().length <= 150)
    .withMessage('alumno debe ser un texto no vacio de hasta 150 caracteres'),
  body('materiaId')
    .optional()
    .isInt({ gt: 0 }).withMessage('materiaId debe ser un entero positivo')
    .bail()
    .toInt()
    .custom(async (materiaId) => {
      const existe = await materiaExiste(materiaId);
      if (!existe) {
        throw new Error('La materia indicada no existe');
      }
      return true;
    }),
  body('notas')
    .optional()
    .isArray({ min: 3, max: 3 }).withMessage('notas debe ser un arreglo de exactamente 3 elementos')
    .bail()
    .custom((notas) => {
      const todasValidas = notas.every(
        (n) => typeof n === 'number' && n >= NOTA_MIN && n <= NOTA_MAX
      );
      if (!todasValidas) {
        throw new Error(`cada nota debe ser un numero entre ${NOTA_MIN} y ${NOTA_MAX}`);
      }
      return true;
    }),
  body().custom(async (_, { req }) => {
    // Solo se re-valida la unicidad si el alumno o la materia cambian;
    // si ninguno de los dos viene en el body, la combinacion no se
    // modifica y no hace falta volver a chequearla.
    if (req.body.alumno !== undefined || req.body.materiaId !== undefined) {
      const [actual] = await pool.query(
        'SELECT alumno, materia_id FROM calificaciones WHERE id = ?',
        [req.params.id]
      );
      if (actual.length === 0) return true; // el controlador devuelve 404

      const alumnoFinal = req.body.alumno !== undefined ? req.body.alumno : actual[0].alumno;
      const materiaFinal = req.body.materiaId !== undefined
        ? Number(req.body.materiaId)
        : actual[0].materia_id;

      const esUnico = await combinacionEsUnica(alumnoFinal, materiaFinal, Number(req.params.id));
      if (!esUnico) {
        throw new Error('Ya existe un registro de calificaciones para ese alumno en esa materia');
      }
    }
    return true;
  }),
];

const validarIdParam = [
  param('id')
    .isInt({ gt: 0 }).withMessage('id debe ser un entero positivo')
    .toInt(),
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
  NOTA_MIN,
  NOTA_MAX,
  normalizarNombre,
  validarNombreMateria,
  validarCreacionCalificacion,
  validarModificacionCalificacion,
  validarIdParam,
  manejarErroresDeValidacion,
};
