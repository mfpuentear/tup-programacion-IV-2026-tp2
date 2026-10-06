import Joi from 'joi';

export const validarRectangulo = (data) => {
  const schema = Joi.object({
    base: Joi.number().positive().required(),
    altura: Joi.number().positive().required()
  });

  return schema.validate(data);
};

export default validarRectangulo;