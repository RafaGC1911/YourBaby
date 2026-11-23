
//Cargar las variables de entorno del archivo .env
require("dotenv").config();

//Importar express para usarlo
let express = require("express");

/*
Importar CORS (Cross-Origin Resource Sharing o Compartimento de Recursos entre Orígenes Distintos).
Es necesario instalarlo con npm para poder usarlo.
Se usa para que el navegador no bloquee las peticiones que React haga al servidor Express.
El navegador las bloquea a modo de protección ya que React y Express corren en puertos distintos.
*/
let cors = require("cors");

//Importar cookie-parser para poder leer las cookies que llegan desde el navegador
let cookieParser = require("cookie-parser");

//Crear aplicacion Express. La variable app será el objeto principal con el que configurar el servidor
let app = express();

/*
Elegimos el puerto donde escuchará nuestro servidor.

Por ahora será:

http://localhost:3000
*/
let port = 3000;

//Permitir peticiones desde React y aceptar el envío de cookies
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

//Middleware para poder leer las cookies que llegan en las peticiones
app.use(cookieParser());

//express.json() es un middleware de Express, su función es hacer que el servidor pueda entender datos que llegan en formato JSON dentro de una petición HTTP
app.use(express.json());

/******* RUTAS ******** */

let bebesRutas = require("./rutas/bebes_rutas");
let alimentacionesRutas = require("./rutas/alimentaciones_rutas");
let suenosRutas = require("./rutas/suenos_rutas");
let panalesRutas = require("./rutas/panales_rutas");
let pesosRutas = require("./rutas/pesos_rutas");
let usuariosRutas = require("./rutas/usuarios_rutas");

//Todas las peticiones que empiecen por /api/bebes las va a gestionar bebesRutas
app.use("/api/bebes", bebesRutas);
app.use("/api/alimentaciones", alimentacionesRutas);
app.use("/api/suenos", suenosRutas);
app.use("/api/panales", panalesRutas);
app.use("/api/pesos", pesosRutas);
app.use("/api/auth", usuariosRutas);


/******* ESCUCHA ***** */

//Poner a express a escuchar en el puerto que le diga (3000 en este caso)
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
