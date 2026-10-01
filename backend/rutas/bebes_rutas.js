//Importar la librería Express para tener acceso a sus funciones.
const express = require("express");

/**
 * Crear un mini-servidor aislado (un enrutador). 
 * Este objeto router funciona de forma muy parecida a app, permitiéndote definir peticiones GET, POST, PUT, DELETE, etc.
 */
const router = express.Router();

const {
  obtenerBebes,
  crearBebe,
} = require("../controladores/bebes_controlador");

router.get("/", obtenerBebes);
router.post("/", crearBebe);


/**
 * Exportar este enrutador para que pueda ser importado y usado en mi archivo principal (servidor.js).
 */
module.exports = router;
