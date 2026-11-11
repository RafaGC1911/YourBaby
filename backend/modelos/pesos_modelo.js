
let conexion = require("../configuracion/base_datos");

//Crear una nueva medición de peso
let crearPeso = (peso) => {
  let sql = `
    INSERT INTO pesos
    (bebe_id, peso, fecha, observaciones)
    VALUES (?, ?, ?, ?)
  `;

  return conexion.promise().query(sql, [
    peso.bebe_id,
    peso.peso,
    peso.fecha,
    peso.observaciones,
  ]);
};

//Obtener todas las mediciones
let obtenerPesos = () => {
  let sql = `
    SELECT *
    FROM pesos
    ORDER BY fecha DESC, id DESC
  `;

  return conexion.promise().query(sql);
};

//Obtener las mediciones de un bebé concreto
let obtenerPesosPorBebe = (bebeId) => {
  let sql = `
    SELECT *
    FROM pesos
    WHERE bebe_id = ?
    ORDER BY fecha DESC, id DESC
  `;

  return conexion.promise().query(sql, [bebeId]);
};

//Actualizar una medición
let actualizarPeso = (id, peso) => {
  let campos = [];
  let valores = [];

  //Voy añadiendo a la consulta únicamente los campos recibidos
  if (peso.bebe_id !== undefined) {
    campos.push("bebe_id = ?");
    valores.push(peso.bebe_id);
  }

  if (peso.peso !== undefined) {
    campos.push("peso = ?");
    valores.push(peso.peso);
  }

  if (peso.fecha !== undefined) {
    campos.push("fecha = ?");
    valores.push(peso.fecha);
  }

  if (peso.observaciones !== undefined) {
    campos.push("observaciones = ?");
    valores.push(peso.observaciones);
  }

  let sql = `
    UPDATE pesos
    SET ${campos.join(", ")}
    WHERE id = ?
  `;

  //Añado el ID al final porque es el último parámetro de la consulta
  valores.push(id);

  return conexion.promise().query(sql, valores);
};

//Eliminar una medición
let eliminarPeso = (id) => {
  let sql = `
    DELETE FROM pesos
    WHERE id = ?
  `;

  return conexion.promise().query(sql, [id]);
};

module.exports = {
  crearPeso,
  obtenerPesos,
  obtenerPesosPorBebe,
  actualizarPeso,
  eliminarPeso,
};
