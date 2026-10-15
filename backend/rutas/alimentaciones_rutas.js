let express = require("express");
let router = express.Router();

let {
  guardarAlimentacion,
  obtenerAlimentaciones,
  obtenerAlimentacionesPorBebe,
  actualizarAlimentacion,
  eliminarAlimentacion
} = require("../controladores/alimentaciones_controlador");

router.post("/", guardarAlimentacion);
router.get("/", obtenerAlimentaciones);
router.get("/bebe/:bebeId", obtenerAlimentacionesPorBebe);
router.patch("/:id", actualizarAlimentacion);
router.delete("/:id", eliminarAlimentacion);

module.exports = router;
