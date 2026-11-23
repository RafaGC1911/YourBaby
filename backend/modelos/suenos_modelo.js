
let conexion = require("../configuracion/base_datos");

//Función para registrar un nuevo sueño
let crearSueno = (sueno) => {
  let sql = `
  INSERT INTO sueno
  (bebe_id, inicio, fin, observaciones)
  VALUES (?, ?, ?, ?)
  `;

  /*
  Envío los datos del sueño mediante un array de valores.
  Utilizo interrogantes en la consulta SQL para que MySQL
  introduzca los valores de forma segura y evitar concatenar
  directamente datos que vienen de una petición del usuario.
  */
  return conexion
    .promise()
    .query(sql, [
      sueno.bebe_id,
      sueno.inicio,
      sueno.fin,
      sueno.observaciones,
    ]);
};

//Comprobar que un bebé pertenece al usuario que ha iniciado sesión
let comprobarBebeUsuario = (bebeId, usuarioId) => {
  let sql = `
  SELECT id FROM bebes
  WHERE id = ? AND usuario_id = ?
  `;

  /*
  Antes de guardar un sueño necesito comprobar que el bebé
  seleccionado pertenece al usuario que está haciendo la petición.

  Comparo el ID del bebé con el ID del usuario autenticado.
  Si no encuentro ningún resultado, significa que el bebé no
  existe o que pertenece a otra cuenta.
  */
  return conexion.promise().query(sql, [bebeId, usuarioId]);
};

//Obtener todos los sueños del usuario
let obtenerSuenos = (usuarioId) => {
  let sql = `
  SELECT sueno.*
  FROM sueno
  INNER JOIN bebes
  ON sueno.bebe_id = bebes.id
  WHERE bebes.usuario_id = ?
  `;

  /*
  Utilizo INNER JOIN para relacionar cada sueño con su bebé.
  La condición ON indica que el campo bebe_id de la tabla sueno
  debe coincidir con el campo id de la tabla bebes.

  Una vez relacionadas las tablas, filtro los resultados mediante
  usuario_id para devolver solamente los sueños de sus bebés.

  Escribo sueno.* para obtener todas las columnas de la tabla sueno,
  sin devolver innecesariamente los datos de la tabla bebes.
  */
  return conexion.promise().query(sql, [usuarioId]);
};

//Obtener los sueños de un bebé comprobando quién es su propietario
let obtenerSuenosPorBebe = (bebeId, usuarioId) => {
  let sql = `
  SELECT sueno.*
  FROM sueno
  INNER JOIN bebes
  ON sueno.bebe_id = bebes.id
  WHERE sueno.bebe_id = ?
  AND bebes.usuario_id = ?
  `;

  /*
  En esta consulta compruebo dos condiciones:
  1. Que el sueño pertenezca al bebé solicitado.
  2. Que ese bebé pertenezca al usuario autenticado.

  De esta manera, aunque otro usuario conozca el ID de un bebé,
  no podrá consultar sus registros de sueño.
  */
  return conexion.promise().query(sql, [bebeId, usuarioId]);
};

//Obtener un sueño concreto comprobando que pertenece al usuario
let obtenerSuenoIdUsuario = (id, usuarioId) => {
  let sql = `
  SELECT sueno.*
  FROM sueno
  INNER JOIN bebes
  ON sueno.bebe_id = bebes.id
  WHERE sueno.id = ?
  AND bebes.usuario_id = ?
  `;

  /*
  Utilizo esta función antes de actualizar un sueño para recuperar
  sus datos actuales y comprobar que pertenece al usuario.

  También necesito conocer las fechas que ya están guardadas,
  porque si modifico solamente el inicio o el fin tengo que
  comprobar que la otra fecha siga manteniendo un orden correcto.
  */
  return conexion.promise().query(sql, [id, usuarioId]);
};

//Actualizar un sueño comprobando que pertenece al usuario
let actualizarSueno = (id, usuarioId, sueno) => {
  let campos = [];
  let valores = [];

  //Voy añadiendo únicamente los campos que se quieren modificar
  if (sueno.inicio !== undefined) {
    campos.push("inicio = ?");
    valores.push(sueno.inicio);
  }

  if (sueno.fin !== undefined) {
    campos.push("fin = ?");
    valores.push(sueno.fin);
  }

  if (sueno.observaciones !== undefined) {
    campos.push("observaciones = ?");
    valores.push(sueno.observaciones);
  }

  let sql = `
  UPDATE sueno
  INNER JOIN bebes
  ON sueno.bebe_id = bebes.id
  SET ${campos.join(", ")}
  WHERE sueno.id = ?
  AND bebes.usuario_id = ?
  `;

  /*
  Utilizo INNER JOIN también en la actualización para relacionar
  el sueño con su bebé y comprobar quién es su propietario.

  Así no basta con conocer el ID del sueño para modificarlo,
  también tiene que pertenecer a un bebé del usuario autenticado.

  Al final añado el ID del sueño y el ID del usuario al array
  de valores, respetando el orden de los interrogantes de la SQL.
  */
  valores.push(id, usuarioId);

  return conexion.promise().query(sql, valores);
};

//Eliminar un sueño comprobando que pertenece al usuario
let eliminarSueno = (id, usuarioId) => {
  let sql = `
  DELETE sueno
  FROM sueno
  INNER JOIN bebes
  ON sueno.bebe_id = bebes.id
  WHERE sueno.id = ?
  AND bebes.usuario_id = ?
  `;

  /*
  Relaciono el sueño con su bebé antes de eliminarlo.
  De esta forma, solamente puedo borrar el registro si el bebé
  asociado pertenece al usuario que ha iniciado sesión.
  */
  return conexion.promise().query(sql, [id, usuarioId]);
};

//Exporto las funciones para utilizarlas desde el controlador
module.exports = {
  crearSueno,
  comprobarBebeUsuario,
  obtenerSuenos,
  obtenerSuenosPorBebe,
  obtenerSuenoIdUsuario,
  actualizarSueno,
  eliminarSueno,
};
