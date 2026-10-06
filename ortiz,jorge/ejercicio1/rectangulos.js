import express from "express"
import { db } from "./db.js"
import {body,param,query,validationResult} from "express-validator"

const router = express.Router()


const validacionRectangulo = [
    body("base").isFloat({gt: 0}),
    body("altura").isFloat({gt: 0}),
];

const validarId = [
    param("id").isInt({min:1}),
];

const verificacionValidaciones = (req, res, next) => {
  const validacion = validationResult(req);
  if (!validacion.isEmpty()) {
    return res.status(400).json({success: false,message: "Falla de validación",errores: validacion.array(),
    });
  }
  next();
};


router.get("/",async (req, res) => {
 const [rows] = await db.execute("SELECT * FROM tabla_ejercicio1");
  res.json({ success: true, data: rows });
});


router.get("/:id",validarId,verificacionValidaciones, async  (req, res) => {
 
    const id = Number(req.params.id);
    const [rows] = await db.execute("SELECT * FROM tabla_ejercicio1 WHERE id=?", [id]);

   if (rows.length === 0) {
      return res
      .status(404)
      .json({ success: false, message: "El rectangulo no existe" });
  }

  res.json({ success: true, data: rows[0] });

});


router.post("/", validacionRectangulo, verificacionValidaciones, async(req, res)=>{
    const {base, altura} = req.body;

    const perimetro = 2* (base + altura);
    const superficie = base * altura;

    const [result]= await db.execute("INSERT INTO tabla_ejercicio1 (base , altura ,superficie,perimetro) VALUE (?,?,?,?)", 
        [base,altura,superficie,perimetro]
    );  

    return res.json({id:result.insertId,
        base:base,
        altura:altura,
        superficie,
        perimetro,
    });

});

router.put("/:id", validarId, validacionRectangulo, verificacionValidaciones, async (req, res) => {

    const id = Number(req.params.id);
    const { base, altura } = req.body;

    const Base = Number(base);
    const Altura = Number(altura);

    const perimetro = 2 * (Base + Altura);
    const superficie = Base * Altura;

    await db.execute(
        'UPDATE tabla_ejercicio1 SET base=?, altura=?, perimetro=?, superficie=? WHERE id=?', [base, altura, perimetro, superficie, id]
    );
    res.json({ success: true, data: { id, base, altura, perimetro, superficie },
      
    });
});


router.delete('/:id', validarId, verificacionValidaciones, async (req, res) => {
    const id = Number(req.params.id);

    await db.execute('DELETE FROM tabla_ejercicio1 WHERE id=?', [id]);
    res.json({ success: true, data: id});
});


export default router