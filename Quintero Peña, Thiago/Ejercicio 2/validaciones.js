import Joi from 'joi';

export const validarProducto = (data) => {
  const schema = Joi.object({
    nombre: Joi.string().min(2).max(100).required(),
    precio: Joi.number().positive().required(),
    stock: Joi.number().integer().min(0).required()
  });

  return schema.validate(data);
};

export default validarProducto;