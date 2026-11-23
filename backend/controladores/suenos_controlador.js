let {
  crearSueno,
  comprobarBebeUsuario,
  obtenerSuenos: obtenerSuenosModelo,
  obtenerSuenosPorBebe: obtenerSuenosPorBebeModelo,
  obtenerSuenoIdUsuario: obtenerSuenoIdUsuarioModelo,
  actualizarSueno: actualizarSuenoModelo,
  eliminarSueno: eliminarSuenoModelo,
} = require("../modelos/suenos_modelo");

//Comprobar que el ID sea un número entero positivo
let validarId = (id) => {
  /*
  Convierto el valor a Number antes de comprobarlo porque los
  parámetros de las rutas y los datos enviados desde React
  normalmente llegan como cadenas de texto.

  Number.isInteger comprueba que el resultado sea un número entero.
  También compruebo que sea mayor que cero porque los identificadores
  de nuestros registros deben ser positivos.
  */
  return Number.isInteger(Number(id)) && Number(id) > 0;
};

//Comprobar que una fecha y hora tengan un formato y valor válidos
let validarFecha = (fecha) => {
  if (typeof fecha !== "string" || fecha.trim() === "") {
    //Rechazo los valores que no sean texto o que estén vacíos.
    return false;
  }

  /*
  Creo un objeto Date para comprobar si JavaScript reconoce
  el valor recibido como una fecha válida.

  getTime() devuelve los milisegundos correspondientes a la fecha.
  Si la fecha no es válida, devuelve NaN.
  */
  let valorFecha = new Date(fecha);

  return !isNaN(valorFecha.getTime());
};

/**
 * Compruebo que una fecha sea válida y que no esté en el futuro.
 * Interpreto la fecha como hora local para evitar que JavaScript
 * la convierta automáticamente a UTC y provoque desfases horarios.
 */
let validarFechaNoFutura = (fecha) => {
  //Primero compruebo que el valor tenga una fecha válida.
  if (!validarFecha(fecha)) {
    return false;
  }

  //Convierto el formato recibido en una fecha interpretada como hora local.
  let fechaLocal = new Date(fecha.replace(" ", "T"));

  //Comparo la fecha recibida con el momento actual.
  return fechaLocal <= new Date();
};

//Registrar un nuevo sueño
let guardarSueno = async (req, res) => {
  try {
    let { bebe_id, inicio } = req.body;

    //Comprobar que el ID del bebé y la hora de inicio sean válidos
    if (!validarId(bebe_id) || !validarFechaNoFutura(inicio)) {
      return res.status(400).json({
        message: "Debes indicar un bebé válido y una hora de inicio válida",
      });
    }

    /*
    Utilizo el operador ?? para asignar null cuando no se indica
    una hora de finalización.

    Esto permite registrar un sueño que todavía está en curso.
    A diferencia de ||, el operador ?? solamente utiliza el valor
    de la derecha cuando el valor de la izquierda es null o undefined.
    */
    let fin = req.body.fin ?? null;

    //Comprobar la fecha de finalización si se ha indicado
    if (fin !== null && !validarFechaNoFutura(fin)) {
      return res.status(400).json({
        message: "La hora de finalización no es válida",
      });
    }

    //Interpreto ambas fechas como horas locales antes de compararlas.
    if (
      fin !== null &&
      new Date(fin.replace(" ", "T")) < new Date(inicio.replace(" ", "T"))
    ) {
      return res.status(400).json({
        message: "La hora de finalización no puede ser anterior al inicio",
      });
    }

    /*
    Compruebo que el bebé pertenece al usuario autenticado antes
    de guardar el sueño.

    No utilizo un ID de usuario enviado desde React porque podría
    manipularse desde el navegador. Utilizo req.usuario.id, que
    procede del token JWT verificado por el middleware.
    */
    let [bebes] = await comprobarBebeUsuario(Number(bebe_id), req.usuario.id);

    if (bebes.length === 0) {
      return res.status(404).json({
        message: "Bebé no encontrado",
      });
    }

    //Preparo los datos que voy a guardar en la base de datos
    let sueno = {
      bebe_id: Number(bebe_id),
      inicio,
      fin,
      observaciones: req.body.observaciones ?? null,
    };

    /*
    Espero a que MySQL termine de insertar el registro.
    Guardo el resultado para poder recuperar insertId, que contiene
    el identificador generado automáticamente para el nuevo sueño.
    */
    let [resultado] = await crearSueno(sueno);

    return res.status(201).json({
      message: "Registro de sueño creado correctamente",
      data: {
        id: resultado.insertId,
        ...sueno,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error al registrar el sueño",
    });
  }
};

//Obtener todos los sueños del usuario autenticado
let obtenerSuenos = async (req, res) => {
  try {
    /*
    Paso el ID del usuario al modelo para que la consulta SQL
    devuelva exclusivamente los sueños de sus propios bebés.
    */
    let [suenos] = await obtenerSuenosModelo(req.usuario.id);

    return res.json({
      message: "Registros de sueño obtenidos correctamente",
      data: suenos,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error al obtener los registros de sueño",
    });
  }
};

//Obtener los sueños de un bebé concreto
let obtenerSuenosPorBebe = async (req, res) => {
  try {
    let bebeId = req.params.bebeId;

    //Comprobar que el ID del bebé sea un número entero positivo
    if (!validarId(bebeId)) {
      return res.status(400).json({
        message: "El ID del bebé no es válido",
      });
    }

    /*
    Envío tanto el ID del bebé solicitado como el ID del usuario.
    El modelo comprueba que el bebé pertenece a ese usuario antes
    de devolver sus registros de sueño.
    */
    let [suenos] = await obtenerSuenosPorBebeModelo(bebeId, req.usuario.id);

    return res.json({
      message: "Registros de sueño del bebé obtenidos correctamente",
      data: suenos,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error al obtener los registros de sueño del bebé",
    });
  }
};

//Actualizar un registro de sueño
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

    //Definir los campos que permito modificar
    let camposPermitidos = ["inicio", "fin", "observaciones"];

    let datosActualizados = {};

    /*
    Recorro los campos permitidos y guardo solamente aquellos
    que realmente se han enviado en la petición.

    Así puedo utilizar PATCH para modificar un solo campo sin
    tener que enviar todos los datos del sueño.
    */
    for (let campo of camposPermitidos) {
      if (sueno[campo] !== undefined) {
        datosActualizados[campo] = sueno[campo];
      }
    }

    //Comprobar que se haya enviado al menos un campo permitido
    if (Object.keys(datosActualizados).length === 0) {
      return res.status(400).json({
        message: "Debes enviar al menos un campo válido para actualizar",
      });
    }

    //Validar la fecha de inicio si se quiere modificar
    if (
      datosActualizados.inicio !== undefined &&
      !validarFechaNoFutura(datosActualizados.inicio)
    ) {
      return res.status(400).json({
        message: "La hora de inicio no es válida",
      });
    }

    //Validar la fecha de finalización si se quiere modificar
    if (
      datosActualizados.fin !== undefined &&
      datosActualizados.fin !== null &&
      !validarFechaNoFutura(datosActualizados.fin)
    ) {
      return res.status(400).json({
        message: "La hora de finalización no es válida",
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

    /*
    Antes de actualizar, recupero el sueño utilizando su ID y el
    identificador del usuario autenticado.

    Esta consulta cumple dos funciones:
    1. Comprueba que el sueño existe y pertenece al usuario.
    2. Me permite consultar las fechas actuales para validar
       correctamente el resultado de la modificación.
    */
    let [suenos] = await obtenerSuenoIdUsuarioModelo(id, req.usuario.id);

    if (suenos.length === 0) {
      return res.status(404).json({
        message: "Registro de sueño no encontrado",
      });
    }

    //Recupero el registro actual de la base de datos
    let suenoActual = suenos[0];

    /*
    Combino las fechas actuales con las que se quieren modificar.

    Si el usuario solamente cambia el inicio, mantengo el fin actual.
    Si solamente cambia el fin, mantengo el inicio actual.

    El operador ?? permite conservar el valor anterior cuando el
    nuevo valor es null o undefined. Sin embargo, en el caso de fin,
    null significa que queremos dejar el sueño sin finalizar, por
    lo que utilizo una comprobación explícita con !== undefined.
    */
    let inicioFinal =
      datosActualizados.inicio !== undefined
        ? datosActualizados.inicio
        : suenoActual.inicio;

    let finFinal =
      datosActualizados.fin !== undefined
        ? datosActualizados.fin
        : suenoActual.fin;

    //Comprobar que las fechas resultantes mantienen un orden correcto
    if (finFinal !== null && new Date(finFinal) < new Date(inicioFinal)) {
      return res.status(400).json({
        message: "La hora de finalización no puede ser anterior al inicio",
      });
    }

    /*
    Una vez superadas todas las validaciones, envío los datos al modelo.
    También paso req.usuario.id para que la propia consulta UPDATE
    vuelva a comprobar que el sueño pertenece al usuario.
    */
    let [resultado] = await actualizarSuenoModelo(
      id,
      req.usuario.id,
      datosActualizados,
    );

    /*
    affectedRows indica cuántas filas ha modificado MySQL.
    Si devuelve cero, puede significar que no se ha encontrado
    el registro o que los valores enviados eran exactamente iguales.
    Como ya hemos comprobado previamente que el sueño existe,
    no puedo interpretar automáticamente el cero como un error.
    */
    return res.json({
      message: "Registro de sueño actualizado correctamente",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error al actualizar el registro de sueño",
    });
  }
};

//Eliminar un registro de sueño
let eliminarSueno = async (req, res) => {
  try {
    let id = req.params.id;

    //Comprobar que el ID del sueño sea válido
    if (!validarId(id)) {
      return res.status(400).json({
        message: "El ID del sueño no es válido",
      });
    }

    /*
    Paso el ID del sueño y el ID del usuario al modelo.
    La consulta SQL comprueba la propiedad antes de eliminarlo,
    por lo que no puedo borrar sueños de otras cuentas.
    */
    let [resultado] = await eliminarSuenoModelo(id, req.usuario.id);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        message: "Registro de sueño no encontrado",
      });
    }

    return res.json({
      message: "Registro de sueño eliminado correctamente",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error al eliminar el registro de sueño",
    });
  }
};

//Exporto las funciones para utilizarlas desde las rutas
module.exports = {
  guardarSueno,
  obtenerSuenos,
  obtenerSuenosPorBebe,
  actualizarSueno,
  eliminarSueno,
};
