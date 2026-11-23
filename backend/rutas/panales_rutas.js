let express = require("express");
let router = express.Router();
let verificarToken = require("../middleware/autenticacion");

let {
    guardarPanal,
    obtenerPanales,
    obtenerPanalesPorBebe,
    actualizarPanal,
    eliminarPanal
} = require("../controladores/panales_controlador");

router.use(verificarToken);

router.post("/", guardarPanal);
router.get("/", obtenerPanales);
router.get("/bebe/:bebeId", obtenerPanalesPorBebe);
router.patch("/:id", actualizarPanal);
router.delete("/:id", eliminarPanal);

module.exports = router;
