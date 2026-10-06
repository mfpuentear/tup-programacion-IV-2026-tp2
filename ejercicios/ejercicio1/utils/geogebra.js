/**
 * 
 * @param {number} ladoA 
 * @param {number} ladoB 
 * @returns {{ perimetro: number, superficie: number }}
 */
const calcularPropiedades = (ladoA, ladoB) => {
  const a = Number(ladoA);
  const b = Number(ladoB);

  const perimetro = Number((2 * (a + b)).toFixed(2));
  const superficie = Number((a * b).toFixed(2));

  return { perimetro, superficie };
};

module.exports = { calcularPropiedades };