let {
  crearPanal,
  obtenerPanales: obtenerPanalesModelo,
  obtenerPanalesPorBebe: obtenerPanalesPorBebeModelo,
  actualizarPanal: actualizarPanalModelo,
  eliminarPanal: eliminarPanalModelo,
} = require("../modelos/panales_modelo");

//Comprobar que un ID sea un número entero positivo
let validarId = (id) => {
  return Number.isInteger(Number(id)) && Number(id) > 0;
};

//Comprobar que la fecha sea válida
let validarFecha = (fecha) => {
  if (typeof fecha !== "string" || fecha.trim() === "") {
    return false;
  }

  let fechaConvertida = new Date(fecha);

  return !isNaN(fechaConvertida.getTime());
};

//Tipos de pañal que permitimos registrar
let tiposPermitidos = ["pipí", "caca", "mixto"];

//Registrar un pañal
let guardarPanal = async (req, res) => {
  try {
    let { bebe_id, fecha_hora, tipo, observaciones } = req.body;

    //Comprobar que se hayan enviado los datos obligatorios
    if (!bebe_id || !fecha_hora || !tipo) {
      return res.status(400).json({
        message: "El bebé, la fecha y el tipo de pañal son obligatorios",
      });
    }

    //Comprobar que el ID del bebé sea válido
    if (!validarId(bebe_id)) {
      return res.status(400).json({
        message: "El ID del bebé debe ser un número entero positivo",
      });
    }

    //Comprobar que la fecha sea válida
    if (!validarFecha(fecha_hora)) {
      return res.status(400).json({
        message: "La fecha y hora no son válidas",
      });
    }

    //Comprobar que el tipo esté entre los permitidos
    if (!tiposPermitidos.includes(tipo)) {
      return res.status(400).json({
        message: "El tipo debe ser pipí, caca o mixto",
      });
    }

    let panal = {
      bebe_id: Number(bebe_id),
      fecha_hora,
      tipo,
      observaciones: observaciones ?? null,
    };

    let [resultado] = await crearPanal(panal);

    return res.status(201).json({
      message: "Registro de pañal creado correctamente",
      id: resultado.insertId,
    });
  } catch (error) {
    console.error("Error al crear el registro de pañal:", error);

    return res.status(500).json({
      message: "Error interno al crear el registro de pañal",
    });
  }
};

//Obtener todos los pañales
let obtenerPanales = async (req, res) => {
  try {
    let [panales] = await obtenerPanalesModelo();

    return res.status(200).json(panales);
  } catch (error) {
    console.error("Error al obtener los registros de pañales:", error);

    return res.status(500).json({
      message: "Error interno al obtener los registros",
    });
  }
};

//Obtener los pañales de un bebé concreto
let obtenerPanalesPorBebe = async (req, res) => {
  try {
    let { bebeId } = req.params;

    //Comprobar que el ID del bebé sea válido
    if (!validarId(bebeId)) {
      return res.status(400).json({
        message: "El ID del bebé debe ser un número entero positivo",
      });
    }

    let [panales] = await obtenerPanalesPorBebeModelo(bebeId);

    return res.status(200).json(panales);
  } catch (error) {
    console.error("Error al obtener los pañales del bebé:", error);

    return res.status(500).json({
      message: "Error interno al obtener los registros del bebé",
    });
  }
};

//Actualizar un pañal
let actualizarPanal = async (req, res) => {
  try {
    let { id } = req.params;
    let panal = req.body ?? {};

    //Comprobar que el ID del pañal sea válido
    if (!validarId(id)) {
      return res.status(400).json({
        message: "El ID debe ser un número entero positivo",
      });
    }

    //No permitir una petición vacía
    if (Object.keys(panal).length === 0) {
      return res.status(400).json({
        message: "Debes indicar al menos un campo para actualizar",
      });
    }

    //Solo permitimos modificar estos campos
    let camposPermitidos = ["bebe_id", "fecha_hora", "tipo", "observaciones"];

    let camposRecibidos = Object.keys(panal);

    //Comprobar que no se envíen campos que no permitimos modificar
    let campoNoPermitido = camposRecibidos.some(
      (campo) => !camposPermitidos.includes(campo),
    );

    if (campoNoPermitido) {
      return res.status(400).json({
        message: "Has enviado algún campo no permitido",
      });
    }

    //Validar el ID del bebé si se quiere cambiar
    if (panal.bebe_id !== undefined && !validarId(panal.bebe_id)) {
      return res.status(400).json({
        message: "El ID del bebé debe ser un número entero positivo",
      });
    }

    //Validar la fecha solo si se quiere cambiar
    if (panal.fecha_hora !== undefined && !validarFecha(panal.fecha_hora)) {
      return res.status(400).json({
        message: "La fecha y hora no son válidas",
      });
    }

    //Validar el tipo solo si se quiere cambiar
    if (panal.tipo !== undefined && !tiposPermitidos.includes(panal.tipo)) {
      return res.status(400).json({
        message: "El tipo debe ser pipí, caca o mixto",
      });
    }

    //Evitar que las observaciones tengan un formato incorrecto
    if (
      panal.observaciones !== undefined &&
      panal.observaciones !== null &&
      typeof panal.observaciones !== "string"
    ) {
      return res.status(400).json({
        message: "Las observaciones deben ser texto",
      });
    }

    //Convertir el ID del bebé a número antes de actualizar
    if (panal.bebe_id !== undefined) {
      panal.bebe_id = Number(panal.bebe_id);
    }

    let [resultado] = await actualizarPanalModelo(id, panal);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        message: "No se encontró el registro de pañal",
      });
    }

    return res.status(200).json({
      message: "Registro de pañal actualizado correctamente",
    });
  } catch (error) {
    console.error("Error al actualizar el registro de pañal:", error);

    return res.status(500).json({
      message: "Error interno al actualizar el registro",
    });
  }
};

//Eliminar un pañal
let eliminarPanal = async (req, res) => {
  try {
    let { id } = req.params;

    //Comprobar que el ID del pañal sea válido
    if (!validarId(id)) {
      return res.status(400).json({
        message: "El ID debe ser un número entero positivo",
      });
    }

    let [resultado] = await eliminarPanalModelo(id);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        message: "No se encontró el registro de pañal",
      });
    }

    return res.status(200).json({
      message: "Registro de pañal eliminado correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar el registro de pañal:", error);

    return res.status(500).json({
      message: "Error interno al eliminar el registro",
    });
  }
};

module.exports = {
  guardarPanal,
  obtenerPanales,
  obtenerPanalesPorBebe,
  actualizarPanal,
  eliminarPanal,
};
