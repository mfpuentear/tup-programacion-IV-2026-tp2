function calcularMetricas(ladoA, ladoB) {
  const lado1 = Number(ladoA);
  const lado2 = Number(ladoB);

  if (!Number.isFinite(lado1) || !Number.isFinite(lado2) || lado1 <= 0 || lado2 <= 0) {
    throw new Error('Los lados deben ser números mayores que cero');
  }

  const perimetro = Number((2 * (lado1 + lado2)).toFixed(2));
  const superficie = Number((lado1 * lado2).toFixed(2));

  return {
    ladoA: lado1,
    ladoB: lado2,
    perimetro,
    superficie
  };
}

module.exports = { calcularMetricas };
