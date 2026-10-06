const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'fail',
      message: 'Error de validación en la solicitud',
      errors: errors.array().map(err => ({
        campo: err.path,
        ubicacion: err.location,
        mensaje: err.msg
      }))
    });
  }
  next();
};

module.exports = validate;