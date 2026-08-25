//Importar express para usarlo
const express = require('express');

//Crear aplicacion Express. La constante app será el objeto principal con el que configurar el servidor
const aplicacion = express();

/*
Elegimos el puerto donde escuchará nuestro servidor.

Por ahora será:

http://localhost:3000
*/
const PUERTO = 3000;

//Poner a express a escuchar en el puerto que le diga (3000 en este caso)
aplicacion.listen(PUERTO, ()=>{
  console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
});

