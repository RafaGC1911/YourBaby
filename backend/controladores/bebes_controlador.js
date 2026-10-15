let {
  crearBebe,
  obtenerBebes: obtenerBebesModelo,
  obtenerBebeId: obtenerBebeIdModelo,
  actualizarBebe: actualizarBebeModelo,
  eliminarBebe: eliminarBebeModelo,
} = require("../modelos/bebes_modelo");

// Comprobar que el ID sea un número entero positivo
let validarId = (id) => {
  return Number.isInteger(Number(id)) && Number(id) > 0;
};

let validarBebe = (bebe) => {
  if (!bebe.nombre || bebe.nombre.trim() === "") {
    return "El nombre es obligatorio";
  }

  //Validar que tenga el formato de fecha correcto para que mysql trabaje luego
  if (
    !bebe.fecha_nacimiento ||
    !/^\d{4}-\d{2}-\d{2}$/.test(bebe.fecha_nacimiento)
  ) {
    return "La fecha debe tener el formato YYYY-MM-DD";
  }

  //Validar que sea una fecha válida, que el usuario no ponga 30 de febrero por ejemplo
  let fecha = new Date(bebe.fecha_nacimiento + "T00:00:00Z");

  if (
    isNaN(fecha.getTime()) ||
    fecha.toISOString().slice(0, 10) !== bebe.fecha_nacimiento
  ) {
    return "La fecha de nacimiento no es válida";
  }

  if (
    !bebe.peso_nacimiento ||
    isNaN(bebe.peso_nacimiento) ||
    Number(bebe.peso_nacimiento) <= 0
  ) {
    return "El peso al nacer debe ser un número positivo";
  }

  return null;
};

// Obtener todos los bebés
let obtenerBebes = async (req, res) => {
  try {
    let [bebes] = await obtenerBebesModelo();

    res.json({
      message: "Bebés obtenidos correctamente",
      data: bebes,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al intentar obtener la lista de bebés",
    });
  }
};

// Obtener un bebé por su ID
let obtenerBebeId = async (req, res) => {
  if (!validarId(req.params.id)) {
    return res.status(400).json({
      message: "El ID debe ser un número entero positivo",
    });
  }

  try {
    let [bebes] = await obtenerBebeIdModelo(req.params.id);

    if (bebes.length === 0) {
      return res.status(404).json({
        message: "Bebé no encontrado",
      });
    }

    res.json({
      message: "Bebé obtenido correctamente",
      data: bebes[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al obtener el bebé",
    });
  }
};

// Crear un bebé
let guardarBebe = async (req, res) => {
  let errorValidacion = validarBebe(req.body); //Si todo es correcto validarBebe devuelve null y el controlador sigue, si no, devuelve el mensaje que corresponda

  if (errorValidacion) {
    return res.status(400).json({
      message: errorValidacion,
    });
  }

  try {
    let [resultado] = await crearBebe(req.body);

    res.status(201).json({
      message: "Bebé creado correctamente",
      data: {
        id: resultado.insertId,
        nombre: req.body.nombre.trim(),
        fecha_nacimiento: req.body.fecha_nacimiento,
        peso_nacimiento: Number(req.body.peso_nacimiento),
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al crear el bebé",
    });
  }
};

//Actualizar los datos de un bebé 


let actualizarBebe = async (req, res) => {
  //Comprobar que el ID del bebé sea un número entero positivo
  if (!validarId(req.params.id)) {
    return res.status(400).json({
      message: "El ID debe ser un número entero positivo",
    });
  }

  let bebe = req.body;

  //Definir los campos que se pueden modificar
  let camposPermitidos = [
    "nombre",
    "fecha_nacimiento",
    "peso_nacimiento",
  ];

  let datosActualizados = {};

  //Guardar en el objeto datosActualiados solo los campos que se hayan enviado
  //Así podemos modificar un solo campo sin enviar los demás
  for (let campo of camposPermitidos) {
    if (bebe[campo] !== undefined) {
      datosActualizados[campo] = bebe[campo];
    }
  }

  //Comprobar que se haya enviado al menos un campo válido
  if (Object.keys(datosActualizados).length === 0) {//object.keys() coge un objeto y devuelve un array con los nombres de todas sus claves
    return res.status(400).json({
      message: "Debes enviar al menos un campo válido",
    });
  }

  //Comprobar el nombre solo si se quiere modificar
  if (
    datosActualizados.nombre !== undefined &&
    (typeof datosActualizados.nombre !== "string" ||
      datosActualizados.nombre.trim() === "")
  ) {
    return res.status(400).json({
      message: "El nombre es obligatorio",
    });
  }

  //Eliminar los espacios sobrantes al principio y al final del nombre
  if (datosActualizados.nombre !== undefined) {
    datosActualizados.nombre = datosActualizados.nombre.trim();
  }

  //Comprobar el formato de la fecha solo si se ha enviado
  if (datosActualizados.fecha_nacimiento !== undefined) {
    let fechaNacimiento = datosActualizados.fecha_nacimiento;

    //La fecha debe tener el formato año-mes-día porque luego es con lo que trabaja mysql
    if (
      typeof fechaNacimiento !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(fechaNacimiento)
    ) {
      return res.status(400).json({
        message: "La fecha debe tener el formato YYYY-MM-DD",
      });
    }

    //Comprobar que la fecha exista realmente y que no metan 30 de febrero por ejemplo
    let fecha = new Date(fechaNacimiento + "T00:00:00Z");

    if (isNaN(fecha.getTime())) {
      return res.status(400).json({
        message: "La fecha de nacimiento no es válida",
      });
    }
  }

  //Comprobar el peso solo si se quiere modificar
  if (datosActualizados.peso_nacimiento !== undefined) {
    if (datosActualizados.peso_nacimiento === "" || Number(datosActualizados.peso_nacimiento) <= 0) {
      return res.status(400).json({
        message: "El peso al nacer debe ser un número positivo",
      });
    }

    //Convertir el peso a número antes de enviarlo al modelo porque mysql espera un campo decimal
    datosActualizados.peso_nacimiento = Number(datosActualizados.peso_nacimiento);
  }

  try {
    // Buscar el bebé para comprobar que existe
    let [bebes] = await obtenerBebeIdModelo(req.params.id);

    if (bebes.length === 0) {
      return res.status(404).json({
        message: "Bebé no encontrado",
      });
    }

    // Enviar al modelo el ID y únicamente los campos que queremos modificar
    await actualizarBebeModelo(req.params.id, datosActualizados);

    // Informar de que la actualización se ha realizado correctamente
    res.json({
      message: "Bebé actualizado correctamente",
    });
  } catch (error) {
    // Mostrar el error en la consola para poder localizar el problema
    console.error(error);

    // Informar al cliente de que ha ocurrido un error en el servidor
    res.status(500).json({
      message: "Error al actualizar el bebé",
    });
  }
};


// Eliminar un bebé
let eliminarBebe = async (req, res) => {
  if (!validarId(req.params.id)) {
    return res.status(400).json({
      message: "El ID debe ser un número entero positivo",
    });
  }

  try {
    let [resultado] = await eliminarBebeModelo(req.params.id);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        message: "Bebé no encontrado",
      });
    }

    res.json({
      message: "Bebé eliminado correctamente",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "No se pudo eliminar el bebé. Puede tener registros asociados.",
    });
  }
};

module.exports = {
  obtenerBebes,
  guardarBebe,
  obtenerBebeId,
  actualizarBebe,
  eliminarBebe,
};
