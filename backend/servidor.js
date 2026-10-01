//Importar express para usarlo
const express = require('express');

/*
Importar CORS (Cross-Origin Resource Sharing o Compartimento de Recursos entre Orígenes Distintos). 
Es necesario instalarlo con npm para poder usarlo. 
Se usa para que el navegador no bloquee las peticiones que React haga al servidor Express. 
El navegador las bloquea a modo de protección ya que React y Express corren en puertos distintos y el navegador en principio 
esto lo entiende como malicioso.
*/
const cors = require("cors");

//Crear aplicacion Express. La constante app será el objeto principal con el que configurar el servidor
const app = express();

/*
Elegimos el puerto donde escuchará nuestro servidor.

Por ahora será:

http://localhost:3000
*/
const port = 3000;


app.use(cors());

//express.json() es un middleware de Express, su función es hacer que el servidor pueda entender datos que llegan en formato JSON dentro de una petición HTTP
app.use(express.json());



/******* RUTAS ******** */

//Importar el archivos  para usar las rutas
const apiRouter = require('./rutas/api');

const babiesRouter = require('./rutas/bebes_rutas');

/**
 * Decirle a Express que todas las rutas que gestione apiRouter empezarán por /api
 * 
 *  */ 
app.use('/api', apiRouter);

//Todas las peticiones que empiecen por /api/bebes las va a gestionar babiesRouter
app.use('/api/bebes', babiesRouter);





/******* ESCUCHA ***** */

//Poner a express a escuchar en el puerto que le diga (3000 en este caso)
app.listen(port, ()=>{
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

