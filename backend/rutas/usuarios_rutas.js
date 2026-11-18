/*
Importo Express para poder crear las rutas de autenticación.
*/
let express = require("express");
let router = express.Router();

/*
Importo las funciones del controlador que gestionan
el inicio, cierre y comprobación de sesión.
*/
let {
  iniciarSesion,
  cerrarSesion,
  verificarSesion,
  registrarUsuario,
} = require("../controladores/usuarios_controlador");

//Importo el middleware que comprueba el JWT
let verificarToken = require("../middleware/autenticacion");

//Ruta pública para iniciar sesión
router.post("/login", iniciarSesion);

//Ruta para cerrar sesión
router.post("/logout", cerrarSesion);

//Ruta protegida para comprobar si existe una sesión válida. Lleva middleware, ejecuta las dos funciones de verificación
router.get("/verificar", verificarToken, verificarSesion);

//Ruta pública para registrar una nueva cuenta
router.post("/registro", registrarUsuario);

//Exporto las rutas para utilizarlas desde servidor.js
module.exports = router;
