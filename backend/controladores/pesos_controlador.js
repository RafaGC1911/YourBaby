let {
  crearPeso,
  obtenerPesos: obtenerPesosModelo,
  obtenerPesosPorBebe: obtenerPesosPorBebeModelo,
  actualizarPeso: actualizarPesoModelo,
  eliminarPeso: eliminarPesoModelo,
} = require("../modelos/pesos_modelo");

//Comprobar que un ID sea un número entero positivo
let validarId = (id) => {
  return Number.isInteger(Number(id)) && Number(id) > 0;
};

//Comprobar que una fecha exista y tenga el formato 
let validarFecha = (fecha) => {
  if (typeof fecha !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return false;
  }

  let fechaConvertida = new Date(`${fecha}T00:00:00Z`);

  return (!Number.isNaN(fechaConvertida.getTime()));
};

//Crear una medición de peso
let guardarPeso = async (req, res) => {
  try {
    let { bebe_id, peso, fecha, observaciones } = req.body;

    //Comprobar que se hayan enviado los campos obligatorios
    if (bebe_id === undefined || peso === undefined || !fecha) {
      return res.status(400).json({
        message: "El bebé, el peso y la fecha son obligatorios",
      });
    }

    //Comprobar que el ID del bebé sea válido
    if (!validarId(bebe_id)) {
      return res.status(400).json({
        message: "El ID del bebé debe ser un número entero positivo",
      });
    }

    //Comprobar que el peso sea un número dentro del rango 
    if (
      peso === null ||
      peso === "" ||
      !Number.isFinite(Number(peso)) ||
      Number(peso) <= 0 ||
      Number(peso) >= 30
    ) {
      return res.status(400).json({
        message: "El peso debe ser un número mayor que 0 y menor que 30 kg",
      });
    }

    //Comprobar que la fecha sea válida
    if (!validarFecha(fecha)) {
      return res.status(400).json({
        message: "La fecha debe ser válida y tener el formato AAAA-MM-DD",
      });
    }

    //Preparar los datos antes de enviarlos al modelo
    let nuevoPeso = {
      bebe_id: Number(bebe_id),
      peso: Number(peso),
      fecha,
      observaciones: observaciones ?? null,
    };

    let [resultado] = await crearPeso(nuevoPeso);

    return res.status(201).json({
      message: "Medición de peso creada correctamente",
      id: resultado.insertId,
    });
  } catch (error) {
    console.error("Error al crear la medición de peso:", error);

    return res.status(500).json({
      message: "Error al crear la medición",
    });
  }
};

//Obtener todas las mediciones
let obtenerPesos = async (req, res) => {
  try {
    let [pesos] = await obtenerPesosModelo();

    return res.status(200).json(pesos);
  } catch (error) {
    console.error("Error al obtener las mediciones:", error);

    return res.status(500).json({
      message: "Error al obtener las mediciones",
    });
  }
};

//Obtener las mediciones de un bebé concreto
let obtenerPesosPorBebe = async (req, res) => {
  try {
    let { bebeId } = req.params;

    //Comprobar que el ID del bebé sea válido
    if (!validarId(bebeId)) {
      return res.status(400).json({
        message: "El ID del bebé debe ser un número entero positivo",
      });
    }

    let [pesos] = await obtenerPesosPorBebeModelo(bebeId);

    return res.status(200).json(pesos);
  } catch (error) {
    console.error("Error al obtener las mediciones del bebé:", error);

    return res.status(500).json({
      message: "Error al obtener las mediciones del bebé",
    });
  }
};

//Actualizar una medición mediante PATCH
let actualizarPeso = async (req, res) => {
  try {
    let { id } = req.params;
    let peso = req.body ?? {};

    //Comprobar que el ID de la medición sea válido
    if (!validarId(id)) {
      return res.status(400).json({
        message: "El ID de la medición no es válido",
      });
    }

    //Comprobar que se haya enviado al menos un campo
    if (
      typeof peso !== "object" ||
      Array.isArray(peso) ||
      Object.keys(peso).length === 0
    ) {
      return res.status(400).json({
        message: "Debes indicar al menos un campo para actualizar",
      });
    }

    //Lista de campos que permitimos modificar
    let camposPermitidos = ["bebe_id", "peso", "fecha", "observaciones"];

    let camposRecibidos = Object.keys(peso);

    //Rechazar los campos que no estén en la lista
    /**
     * some() recorre los elementos de camposRecibidos y comprueba si alguno cumple una condición.
     * includes(campo) comprueba si ese campo está dentro de camposPermitidos.
     * Invierte el resultado con ! porque busco un campo que no esté permitido
     * Si encuentra alguno, some() devuelve true. Si todos están permitidos devuelve false.
     */
    let campoNoPermitido = camposRecibidos.some(
      (campo) => !camposPermitidos.includes(campo),
    );

    if (campoNoPermitido) {
      return res.status(400).json({
        message: "Has enviado algún campo no permitido",
      });
    }

    //Validar el ID del bebé si se quiere modificar
    if (peso.bebe_id !== undefined) {
      if (!validarId(peso.bebe_id)) {
        return res.status(400).json({
          message: "El ID del bebé debe ser un número entero positivo",
        });
      }

      peso.bebe_id = Number(peso.bebe_id);
    }

    //Validar el peso si se quiere modificar
    if (peso.peso !== undefined) {//Comprueba si el usuario ha enviado el campo peso antes de seguir
      if (
        peso.peso === null ||
        peso.peso === "" ||
        Number(peso.peso) <= 0 ||
        Number(peso.peso) >= 30
      ) {
        return res.status(400).json({
          message: "El peso debe ser un número mayor que 0 y menor que 30 kg",
        });
      }

      peso.peso = Number(peso.peso);//Convertirlo porque los datos enviados en un JSON pueden llegar como texto si el usuario escribe "4.5" por ejemplo
    }

    //Validar la fecha si se quiere modificar
    if (peso.fecha !== undefined && !validarFecha(peso.fecha)) {
      return res.status(400).json({
        message: "La fecha debe ser válida y tener el formato AAAA-MM-DD",
      });
    }

    //Comprobar que las observaciones sean texto o null
    if (
      peso.observaciones !== undefined &&
      peso.observaciones !== null &&
      typeof peso.observaciones !== "string"
    ) {
      return res.status(400).json({
        message: "Las observaciones deben ser texto",
      });
    }

    let [resultado] = await actualizarPesoModelo(id, peso);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        message: "No se encontró la medición de peso",
      });
    }

    return res.status(200).json({
      message: "Medición de peso actualizada correctamente",
    });
  } catch (error) {
    console.error("Error al actualizar la medición:", error);

    return res.status(500).json({
      message: "Error interno al actualizar la medición",
    });
  }
};

//Eliminar una medición
let eliminarPeso = async (req, res) => {
  try {
    let { id } = req.params;

    //Comprobar que el ID de la medición sea válido
    if (!validarId(id)) {
      return res.status(400).json({
        message: "El ID de la medición no es válido",
      });
    }

    let [resultado] = await eliminarPesoModelo(id);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        message: "No se encontró la medición de peso",
      });
    }

    return res.status(200).json({
      message: "Medición de peso eliminada correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar la medición:", error);

    return res.status(500).json({
      message: "Error al eliminar la medición",
    });
  }
};

module.exports = {
  guardarPeso,
  obtenerPesos,
  obtenerPesosPorBebe,
  actualizarPeso,
  eliminarPeso,
};
