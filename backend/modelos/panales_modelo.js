let conexion = require("../configuracion/base_datos");

/**
 * Compruebo si un bebé pertenece al usuario que tiene la sesión iniciada.
 *
 * Utilizo esta función antes de registrar un pañal para impedir que un
 * usuario pueda asociar registros a bebés que pertenecen a otras cuentas.
 */
let comprobarBebeUsuario = (bebeId, usuarioId) => {
  let sql = `
    SELECT id
    FROM bebes
    WHERE id = ? AND usuario_id = ?
  `;

  return conexion.promise().query(sql, [bebeId, usuarioId]);
};

//Crear un nuevo registro de pañal
let crearPanal = (panal) => {
  let sql = `
    INSERT INTO panales
    (bebe_id, fecha_hora, tipo, observaciones)
    VALUES (?, ?, ?, ?)
  `;

  return conexion
    .promise()
    .query(sql, [
      panal.bebe_id,
      panal.fecha_hora,
      panal.tipo,
      panal.observaciones,
    ]);
};

/**
 * Obtengo todos los pañales de los bebés pertenecientes al usuario autenticado.
 *
 * Utilizo INNER JOIN para relacionar cada pañal con su bebé.
 * Después filtro por usuario_id, que pertenece a la tabla bebes.
 *
 * De esta forma no necesito guardar usuario_id también en panales,
 * porque puedo conocer al propietario a través del bebé relacionado.
 */
let obtenerPanales = (usuarioId) => {
  let sql = `
    SELECT panales.*
    FROM panales
    INNER JOIN bebes ON panales.bebe_id = bebes.id
    WHERE bebes.usuario_id = ?
    ORDER BY panales.fecha_hora DESC
  `;

  return conexion.promise().query(sql, [usuarioId]);
};

//Obtener los pañales de un bebé concreto, comprobando también su propietario
let obtenerPanalesPorBebe = (bebeId, usuarioId) => {
  let sql = `
    SELECT panales.*
    FROM panales
    INNER JOIN bebes ON panales.bebe_id = bebes.id
    WHERE panales.bebe_id = ? AND bebes.usuario_id = ?
    ORDER BY panales.fecha_hora DESC
  `;

  return conexion.promise().query(sql, [bebeId, usuarioId]);
};

/**
 * Compruebo que un registro de pañal pertenece al usuario autenticado.
 *
 * Utilizo esta consulta antes de modificarlo para distinguir entre un
 * registro que no existe y uno que pertenece a otra cuenta.
 */
let obtenerPanalIdUsuario = (id, usuarioId) => {
  let sql = `
    SELECT panales.*
    FROM panales
    INNER JOIN bebes ON panales.bebe_id = bebes.id
    WHERE panales.id = ? AND bebes.usuario_id = ?
  `;

  return conexion.promise().query(sql, [id, usuarioId]);
};

/**
 * Actualizo únicamente los campos permitidos de un pañal.
 *
 * Utilizo UPDATE junto con INNER JOIN para comprobar el propietario
 * directamente en la consulta de modificación.
 *
 * Los nombres de los campos se preparan en el controlador mediante
 * una lista de campos permitidos. Los valores siguen utilizando ?
 * para evitar introducir datos directamente dentro de la consulta SQL.
 */
let actualizarPanal = (id, usuarioId, panal) => {
  let campos = [];
  let valores = [];

  if (panal.fecha_hora !== undefined) {
    campos.push("panales.fecha_hora = ?");
    valores.push(panal.fecha_hora);
  }

  if (panal.tipo !== undefined) {
    campos.push("panales.tipo = ?");
    valores.push(panal.tipo);
  }

  if (panal.observaciones !== undefined) {
    campos.push("panales.observaciones = ?");
    valores.push(panal.observaciones);
  }

  let sql = `
    UPDATE panales
    INNER JOIN bebes ON panales.bebe_id = bebes.id
    SET ${campos.join(", ")}
    WHERE panales.id = ? AND bebes.usuario_id = ?
  `;

  //Añado al final los valores que identifican el pañal y su propietario.
  valores.push(id, usuarioId);

  return conexion.promise().query(sql, valores);
};

/**
 * Elimino un registro de pañal únicamente si pertenece al usuario.
 *
 * Utilizo DELETE junto con INNER JOIN para comprobar la propiedad
 * del registro en la misma consulta que realiza el borrado.
 */
let eliminarPanal = (id, usuarioId) => {
  let sql = `
    DELETE panales
    FROM panales
    INNER JOIN bebes ON panales.bebe_id = bebes.id
    WHERE panales.id = ? AND bebes.usuario_id = ?
  `;

  return conexion.promise().query(sql, [id, usuarioId]);
};

module.exports = {
  comprobarBebeUsuario,
  crearPanal,
  obtenerPanales,
  obtenerPanalesPorBebe,
  obtenerPanalIdUsuario,
  actualizarPanal,
  eliminarPanal,
};
