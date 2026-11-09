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

  //Validar que la fecha sea correcta y no sea futura.
  let errorFecha = validarFechaNoFutura(bebe.fecha_nacimiento);

  if (errorFecha) {
    return errorFecha;
  }

  if (
    !bebe.peso_nacimiento ||
    isNaN(bebe.peso_nacimiento) ||
    !Number.isFinite(Number(bebe.peso_nacimiento)) || //Comprueba que el valor convertido sea un número finito, así evita valores como Infinity o texto que no se puede convertir en número.
    Number(bebe.peso_nacimiento) <= 0 ||
    Number(bebe.peso_nacimiento) > 10000
  ) {
    return "El peso al nacer debe ser un número positivo y no superar los 10 kg";
  }

  return null;
};

/**Compruebo que una fecha tenga formato correcto, exista y no sea futura.*/
let validarFechaNoFutura = (fecha) => {
  if (typeof fecha !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return "La fecha debe tener el formato YYYY-MM-DD";
  }

  //Compruebo que la fecha exista realmente.
  let fechaComprobada = new Date(fecha + "T00:00:00Z");

  if (
    isNaN(fechaComprobada.getTime()) ||
    fechaComprobada.toISOString().slice(0, 10) !== fecha
  ) {
    return "La fecha introducida no es válida";
  }

  //Obtengo la fecha de hoy utilizando la hora local del servidor.
  let hoy = new Date();
  let fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;

  if (fecha > fechaHoy) {
    return "La fecha no puede ser posterior a hoy";
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
  let camposPermitidos = ["nombre", "fecha_nacimiento", "peso_nacimiento"];

  let datosActualizados = {};

  //Guardar en el objeto datosActualiados solo los campos que se hayan enviado
  //Así podemos modificar un solo campo sin enviar los demás
  for (let campo of camposPermitidos) {
    if (bebe[campo] !== undefined) {
      datosActualizados[campo] = bebe[campo];
    }
  }

  //Comprobar que se haya enviado al menos un campo válido
  if (Object.keys(datosActualizados).length === 0) {
    //object.keys() coge un objeto y devuelve un array con los nombres de todas sus claves
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

  
  //Comprobar la fecha solo si se quiere modificar.
  if (datosActualizados.fecha_nacimiento !== undefined) {
    let errorFecha = validarFechaNoFutura(datosActualizados.fecha_nacimiento);

    if (errorFecha) {
      return res.status(400).json({
        message: errorFecha,
      });
    }
  }


  // Comprobar el peso solo si se quiere modificar
  if (datosActualizados.peso_nacimiento !== undefined) {
    if (
      datosActualizados.peso_nacimiento === null ||
      datosActualizados.peso_nacimiento === "" ||
      !Number.isFinite(Number(datosActualizados.peso_nacimiento)) ||
      Number(datosActualizados.peso_nacimiento) <= 0 ||
      Number(datosActualizados.peso_nacimiento) > 10000
    ) {
      return res.status(400).json({
        message:
          "El peso al nacer debe ser un número mayor que 0 y no superar los 10 kg",
      });
    }

    // Convertir el peso a número antes de enviarlo al modelo
    datosActualizados.peso_nacimiento = Number(
      datosActualizados.peso_nacimiento,
    );
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
