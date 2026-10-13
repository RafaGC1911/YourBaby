let express = require("express");
let router = express.Router();

let {
  guardarSueno,
  obtenerSuenos,
  obtenerSuenosPorBebe,
  actualizarSueno,
  eliminarSueno,
} = require("../controladores/suenos_controlador");

router.post("/", guardarSueno);
router.get("/", obtenerSuenos);
router.get("/bebe/:bebeId", obtenerSuenosPorBebe);
router.patch("/:id", actualizarSueno);
router.delete("/:id", eliminarSueno);

module.exports = router;
