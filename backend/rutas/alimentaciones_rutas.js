let express = require("express");
let router = express.Router();

let {
  guardarAlimentacion,
} = require("../controladores/alimentaciones_controlador");

router.post("/", guardarAlimentacion);

module.exports = router;
