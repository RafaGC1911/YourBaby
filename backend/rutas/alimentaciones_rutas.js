let express = require("express");
let router = express.Router();

let {
  guardarAlimentacion,
  obtenerAlimentaciones,
  obtenerAlimentacionesPorBebe,
} = require("../controladores/alimentaciones_controlador");

router.post("/", guardarAlimentacion);
router.get("/", obtenerAlimentaciones);
router.get("/bebe/:bebeId", obtenerAlimentacionesPorBebe);

module.exports = router;
