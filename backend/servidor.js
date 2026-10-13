//Importar express para usarlo
let express = require('express');

/*
Importar CORS (Cross-Origin Resource Sharing o Compartimento de Recursos entre Orígenes Distintos). 
Es necesario instalarlo con npm para poder usarlo. 
Se usa para que el navegador no bloquee las peticiones que React haga al servidor Express. 
El navegador las bloquea a modo de protección ya que React y Express corren en puertos distintos y el navegador en principio 
esto lo entiende como malicioso.
*/
let cors = require("cors");


//Crear aplicacion Express. La variable app será el objeto principal con el que configurar el servidor
let app = express();

/*
Elegimos el puerto donde escuchará nuestro servidor.

Por ahora será:

http://localhost:3000
*/
let port = 3000;


app.use(cors());

//express.json() es un middleware de Express, su función es hacer que el servidor pueda entender datos que llegan en formato JSON dentro de una petición HTTP
app.use(express.json());



/******* RUTAS ******** */



let babiesRouter = require('./rutas/bebes_rutas');
let alimentacionesRouter = require('./rutas/alimentaciones_rutas');



//Todas las peticiones que empiecen por /api/bebes las va a gestionar babiesRouter
app.use('/api/bebes', babiesRouter);
app.use('/api/alimentaciones', alimentacionesRouter);



/******* ESCUCHA ***** */

//Poner a express a escuchar en el puerto que le diga (3000 en este caso)
app.listen(port, ()=>{
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

