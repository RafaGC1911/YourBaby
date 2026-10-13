let {
  crearSueno,
  obtenerSuenos: obtenerSuenosModelo,
  obtenerSuenosPorBebe: obtenerSuenosPorBebeModelo,
  actualizarSueno: actualizarSuenoModelo,
  eliminarSueno: eliminarSuenoModelo,
} = require("../modelos/suenos_modelo");

let guardarSueno = async (req, res) => {
  try {
    let { bebe_id, inicio } = req.body; //Extrae los valores directamente (id e inicio) en estas dos variables en vez de hacer dos if para cada condición

    if (!bebe_id || !inicio) {
      return res.status(400).json({
        message: "El bebé y la hora de inicio son obligatorios",
      });
    }

    let sueno = {
      bebe_id,
      inicio,
      fin: req.body.fin ?? null, // El ?? significa que utilizamos null si el valor de la izquierda es null o undefined.
      //Con esto se consigue no enviar undefined a MySQL si un periodo de sueño no tiene hora de finalización y las observaciones son opcionales
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

    if (Object.keys(sueno).length === 0) {//Controlar que no me manden objeto vacío
      return res.status(400).json({
        message: "Debes enviar al menos un campo para actualizar",
      });
    }

    let [resultado] = await actualizarSuenoModelo(id, sueno);

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
