import express from "express";
import { db } from "./db.js";
import { body, param, validationResult } from "express-validator";

const router = express.Router();

// Validamos los datos de un rectángulo. La base y la altura deben ser números mayores que 0.
// isFloat permite números enteros y decimales.
const validarRectangulo = [
  body("base", "base inválido").isFloat({ gt: 0 }),
  body("altura", "altura inválido").isFloat({ gt: 0 }),
];

// Validamos el ID recibido por la URL. El ID debe ser un número entero mayor o igual a 1.
const validarId = [
  param("id").isInt({ min: 1 }),
];

// Middleware encargado de comprobar si las validaciones anteriores encontraron algún error.
const verificarValidaciones = (req, res, next) => {
    const validacion = validationResult(req);
    if(!validacion.isEmpty()){
        // Devolvemos el código 400, que indica que la petición enviada por el cliente tiene datos incorrectos.
        return res
        .status(400)
        .json({success: false, message: "Falla de validacion", errores: validacion.array(),})
    }
    next();
};

// Metodo POST utilizado para crear un nuevo rectángulo. La ruta será /resultado. 
// Primero se validan base y altura y luego se comprueban los resultados de esas validaciones. 
// Y Calculamos el perímetro y la superficie del rectángulo.
router.post("/resultado", validarRectangulo, verificarValidaciones, async(req,res)=> {
    const {base, altura} = req.body;
    const perimetro = 2 * (base + altura);
    const superficie = base * altura;

    // Insertamos el nuevo rectángulo en la base de datos. 
    // Los signos ? son parámetros que serán reemplazados por los valores enviados en el segundo argumento. 
    // Esto permite utilizar consultas parametrizadas.
    const [result] = await db.execute("INSERT INTO rectangulos (base, altura, perimetro, superficie) VALUES (?, ?, ?, ?)",
    [base, altura, perimetro, superficie]
);

// Devolvemos los datos del rectángulo creado. insertId contiene el ID generado automáticamente por la base de datos.
    return res.json({
        id: result.insertId,
        base,
        altura,
        perimetro,
        superficie,
    });

});

// Método PUT utilizado para modificar un rectángulo existente.
// La ruta /resultado/:id recibe el ID del rectángulo que queremos modificar. 
// Se validan tanto el ID como la base y la altura.
router.put("/resultado/:id", [...validarId, ...validarRectangulo], verificarValidaciones, async (req, res) => {
    const id = Number(req.params.id);
    const {base, altura} = req.body;
    const n1 = parseInt(base);
    const n2 = parseInt(altura);

    const [exists] = await db.execute("SELECT id FROM rectangulos WHERE id=?", [id]);
    if (exists.length === 0){
        return res
        .status(404)
        .json({success: false, message: "Rectangulo no encontrado"});
    }

    const perimetro = 2 * (n1+n2);
    const superficie = n1 * n2;

    // Actualizamos el registro en la base de datos. Se modifican base, altura, perímetro y superficie del rectángulo cuyo ID coincida.
    await db.execute("UPDATE rectangulos SET base=?, altura=?, perimetro=?, superficie=? WHERE id=?",
        [n1, n2, perimetro, superficie, id]
    );

    return res.json({id, base: n1, altura: n2, perimetro, superficie});
});

// Método DELETE utilizado para eliminar un rectángulo. 
// La ruta recibe el ID mediante la URL. Ejemplo: /resultado/5
router.delete("/resultado/:id", validarId, verificarValidaciones, async (req, res) => {
    const id = Number(req.params.id);

    const [exists] = await db.execute("SELECT id FROM rectangulos WHERE id=?", [id]);
    if (exists.length === 0){
        return res
        .status(404)
        .json({success: false, message: "Rectangulo no encontrado"});
    }

    await db.execute("DELETE FROM rectangulos WHERE id=?", [id]);

    return res.json({success: true, message: "Rectangulo eliminado"});
})
// Método GET utilizado para consultar todos los rectángulos almacenados en la base de datos.
router.get("/calculo", async (req,res) => {
    // Realizamos una consulta SELECT para obtener los datos de todos los rectángulos.
    const [rows] = await db.execute("SELECT id, base, altura, perimetro, superficie FROM rectangulos");
    return res.json(rows);
});
// Exportamos el router para poder utilizarlo desde el archivo principal de nuestra aplicación.
export default router;