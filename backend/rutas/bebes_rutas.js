//Importar la librería Express para tener acceso a sus funciones.
let express = require("express");

/**
 * Crear un mini-servidor aislado (un enrutador). 
 * Este objeto router funciona de forma muy parecida a app, permitiéndote definir peticiones GET, POST, PUT, DELETE, etc.
 */
let router = express.Router();

let {
  obtenerBebes,
  guardarBebe,
  obtenerBebeId,
  actualizarBebe
} = require("../controladores/bebes_controlador");

router.get("/", obtenerBebes);
router.post("/", guardarBebe);
router.get("/:id",obtenerBebeId);
router.put("/:id",actualizarBebe);


/**
 * Exportar este enrutador para que pueda ser importado y usado en mi archivo principal (servidor.js).
 */
module.exports = router;
