export function calcularRectangulo(base, altura) {
    const b = parseFloat(base);
    const a = parseFloat(altura);

    if (isNaN(b) || isNaN(a) || b <= 0 || a <= 0) {
        return { error: "La base y la altura deben ser números mayores a 0." };
    }

    const superficie = b * a;
    const perimetro = 2 * (b + a);

    return { base: b, altura: a, superficie, perimetro };
}