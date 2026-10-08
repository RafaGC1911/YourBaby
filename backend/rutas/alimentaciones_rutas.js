let express = require("express");
let router = express.Router();

let {
  guardarAlimentacion,
  obtenerAlimentaciones,
} = require("../controladores/alimentaciones_controlador");

router.post("/", guardarAlimentacion);
router.get("/", obtenerAlimentaciones);

module.exports = router;
