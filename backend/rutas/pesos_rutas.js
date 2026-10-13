
let express = require("express");
let router = express.Router();

let {
    guardarPeso,
    obtenerPesos,
    obtenerPesosPorBebe,
    actualizarPeso,
    eliminarPeso
} = require("../controladores/pesos_controlador");

// Crear una medición
router.post("/", guardarPeso);

// Obtener todas las mediciones
router.get("/", obtenerPesos);

// Obtener las mediciones de un bebé
router.get("/bebe/:bebeId", obtenerPesosPorBebe);

// Actualizar una medición
router.patch("/:id", actualizarPeso);

// Eliminar una medición
router.delete("/:id", eliminarPeso);

module.exports = router;
