
/*
Importo la librería Express para tener acceso a sus funciones.
*/
let express = require("express");

/**
 * Crear un mini-servidor aislado (un enrutador).
 * Este objeto router funciona de forma muy parecida a app, permitiéndote definir peticiones GET, POST, PUT, DELETE, etc.
 */
let router = express.Router();

//Importo el middleware que comprueba si el usuario está autenticado
let verificarToken = require("../middleware/autenticacion");

let {
  obtenerBebes,
  guardarBebe,
  obtenerBebeId,
  actualizarBebe,
  eliminarBebe
} = require("../controladores/bebes_controlador");

/*
Aplico el middleware a todas las rutas de este enrutador.
De esta forma, antes de ejecutar cualquier controlador de bebés,
compruebo que la petición contiene un JWT válido.
*/
router.use(verificarToken);

//Rutas protegidas de bebés
router.get("/", obtenerBebes);
router.post("/", guardarBebe);
router.get("/:id", obtenerBebeId);
router.patch("/:id", actualizarBebe);
router.delete("/:id", eliminarBebe);

/**
 * Exportar este enrutador para que pueda ser importado y usado en mi archivo principal (servidor.js).
 */
module.exports = router;
