import Joi from 'joi';

export const validarMateria = (data) => {
  const schema = Joi.object({
    nombre: Joi.string().min(2).max(100).required()
  });
  return schema.validate(data);
};

export const validarCalificacion = (data) => {
  const schema = Joi.object({
    alumno: Joi.string().min(2).max(100).required(),
    materia_id: Joi.number().integer().positive().required(),
    nota1: Joi.number().min(0).max(10).optional(),
    nota2: Joi.number().min(0).max(10).optional(),
    nota3: Joi.number().min(0).max(10).optional()
  });
  return schema.validate(data);
};