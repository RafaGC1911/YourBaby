let {
  crearSueno,
  obtenerSuenos: obtenerSuenosModelo,
  obtenerSuenosPorBebe: obtenerSuenosPorBebeModelo,
  actualizarSueno: actualizarSuenoModelo,
  eliminarSueno: eliminarSuenoModelo,
} = require("../modelos/suenos_modelo");

//Comprobar que el ID sea un número entero positivo
let validarId = (id) => {
  return Number.isInteger(Number(id)) && Number(id) > 0;
};

// Comprobar que una fecha y hora tengan un formato válido
let validarFecha = (fecha) => {
  if (typeof fecha !== "string" || fecha.trim() === "") {//Comprobar que sea una cadena y que el usuario no introduzca "   " que las puede dar por buenas
    return false;
  }

  let valorFecha = new Date(fecha);

  return !isNaN(valorFecha.getTime());//Si la fecha es inválida (un número o un "hola" por ejemplo), getTime() va a devolver NaN
};

let guardarSueno = async (req, res) => {
  try {
    let {bebe_id, inicio} = req.body;

    //Comprobar los campos obligatorios
    if (!validarId(bebe_id) || !validarFecha(inicio)) {
      return res.status(400).json({
        message: "Debes indicar un bebé válido y una hora de inicio válida",
      });
    }

    let fin = req.body.fin ?? null;

    //Comprobar la fecha de finalización si se ha indicado
    if (fin !== null && !validarFecha(fin)) {
      return res.status(400).json({
        message: "La hora de finalización no es válida",
      });
    }

    //La hora de finalización no puede ser anterior a la de inicio
    if (fin !== null && new Date(fin) < new Date(inicio)) {
      return res.status(400).json({
        message: "La hora de finalización no puede ser anterior al inicio",
      });
    }

    //Preparar los datos que se guardarán en la base de datos
    let sueno = {
      bebe_id: Number(bebe_id),
      inicio,
      fin,
      observaciones: req.body.observaciones ?? null,
    };

    let [resultado] = await crearSueno(sueno);

    res.status(201).json({
      message: "Registro de sueño creado correctamente",
      data: {
        id: resultado.insertId,
        ...sueno,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al registrar el sueño",
    });
  }
};

let obtenerSuenos = async (req, res) => {
  try {
    let [suenos] = await obtenerSuenosModelo();

    res.json({
      message: "Registros de sueño obtenidos correctamente",
      data: suenos,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al obtener los registros de sueño",
    });
  }
};

let obtenerSuenosPorBebe = async (req, res) => {
  try {
    let bebeId = req.params.bebeId;

    //Comprobar que el ID del bebé sea válido
    if (!validarId(bebeId)) {
      return res.status(400).json({
        message: "El ID del bebé no es válido",
      });
    }

    let [suenos] = await obtenerSuenosPorBebeModelo(bebeId);

    res.json({
      message: "Registros de sueño del bebé obtenidos correctamente",
      data: suenos,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al obtener los registros de sueño del bebé",
    });
  }
};

let actualizarSueno = async (req, res) => {
  try {
    let id = req.params.id;
    let sueno = req.body ?? {};

    //Comprobar que el ID del sueño sea válido
    if (!validarId(id)) {
      return res.status(400).json({
        message: "El ID del sueño no es válido",
      });
    }

    //Definir los campos que se pueden modificar
    let camposPermitidos = ["inicio", "fin", "observaciones"];
    let datosActualizados = {};

    //Guardar únicamente los campos enviados
    for (let campo of camposPermitidos) {
      if (sueno[campo] !== undefined) {
        datosActualizados[campo] = sueno[campo];
      }
    }

    // Comprobar que haya al menos un campo válido
    if (Object.keys(datosActualizados).length === 0) {
      return res.status(400).json({
        message: "Debes enviar al menos un campo válido para actualizar",
      });
    }

    //Validar la fecha de inicio si se quiere modificar
    if (
      datosActualizados.inicio !== undefined &&
      !validarFecha(datosActualizados.inicio)
    ) {
      return res.status(400).json({
        message: "La hora de inicio no es válida",
      });
    }

    //Validar la fecha de fin si se quiere modificar
    if (
      datosActualizados.fin !== undefined &&
      datosActualizados.fin !== null &&
      !validarFecha(datosActualizados.fin)
    ) {
      return res.status(400).json({
        message: "La hora de finalización no es válida",
      });
    }

    //Si se envían las dos fechas, comprobar que tengan un orden correcto
    if (
      datosActualizados.inicio !== undefined &&
      datosActualizados.fin !== undefined &&
      datosActualizados.fin !== null &&
      new Date(datosActualizados.fin) < new Date(datosActualizados.inicio)
    ) {
      return res.status(400).json({
        message: "La hora de finalización no puede ser anterior al inicio",
      });
    }

    //Comprobar que las observaciones sean texto
    if (
      datosActualizados.observaciones !== undefined &&
      datosActualizados.observaciones !== null &&
      typeof datosActualizados.observaciones !== "string"
    ) {
      return res.status(400).json({
        message: "Las observaciones deben ser un texto",
      });
    }

    let [resultado] = await actualizarSuenoModelo(id, datosActualizados);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        message: "Registro de sueño no encontrado",
      });
    }

    res.json({
      message: "Registro de sueño actualizado correctamente",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al actualizar el registro de sueño",
    });
  }
};

let eliminarSueno = async (req, res) => {
  try {
    let id = req.params.id;

    //Comprobar que el ID sea válido
    if (!validarId(id)) {
      return res.status(400).json({
        message: "El ID del sueño no es válido",
      });
    }

    let [resultado] = await eliminarSuenoModelo(id);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        message: "Registro de sueño no encontrado",
      });
    }

    res.json({
      message: "Registro de sueño eliminado correctamente",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al eliminar el registro de sueño",
    });
  }
};

module.exports = {
  guardarSueno,
  obtenerSuenos,
  obtenerSuenosPorBebe,
  actualizarSueno,
  eliminarSueno,
};
