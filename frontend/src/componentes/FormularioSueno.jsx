import { useState } from "react";

function FormularioSueno(props) {
  //Creo un estado para guardar la fecha y hora en la que comienza el sueño.
  //Lo inicializo vacío porque el usuario debe indicar cuándo se ha dormido el bebé.
  let [inicio, setInicio] = useState("");

  //Creo otro estado para guardar la fecha y hora de finalización.
  //Este campo no es obligatorio(NULL), ya que podemos registrar un sueño que todavía no ha terminado
  let [fin, setFin] = useState("");

  //Guardo las observaciones que el usuario quiera añadir al registro.
  //Por ejemplo, si el bebé se ha despertado varias veces o le ha costado dormirse.
  let [observaciones, setObservaciones] = useState("");

  //Función que se ejecuta al enviar el formulario para registrar un nuevo sueño.
  let registrarSueno = async (event) => {
    //Evito que el navegador recargue la página al enviar el formulario.
    event.preventDefault();

    //Limpio los mensajes anteriores para que no se mezclen con el resultado de esta operación.
    props.setMensaje("");
    props.setTipoMensaje("");

    //Compruebo que se haya indicado la fecha y hora de inicio.
    //Aunque el campo sea obligatorio en HTML, también lo compruebo desde JS.
    if (!inicio) {
      props.setMensaje("Debes indicar cuándo comenzó el sueño.");
      props.setTipoMensaje("error");
      return;
    }

    //Preparo los datos que voy a enviar al backend.
    //Si la hora de finalización está vacía, envío null para indicar que el sueño continúa.
    let data = {
      bebe_id: props.bebeId,
      inicio: inicio.replace("T", " ") + ":00",
      fin: fin ? fin.replace("T", " ") + ":00" : null,
      observaciones: observaciones.trim() || null,
    };

    try {
      //Envío los datos mediante una petición POST a la API de sueños.
      let response = await fetch("http://localhost:3000/api/suenos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      //Convierto la respuesta del servidor en un objeto JS.
      let responseData = await response.json();

      //Si el backend devuelve un error, muestro un mensaje y no continúo.
      if (!response.ok) {
        throw new Error(responseData.message);
      }

      //Vuelvo a consultar los sueños para actualizar el historial.
      //La función obtenerSuenos devuelve true si la consulta termina correctamente.
      let resultado = await props.alRegistrar();

      //Solo muestro el mensaje de éxito si también se ha actualizado el historial.
      if (resultado) {
        props.setMensaje("Registro de sueño guardado correctamente.");
        props.setTipoMensaje("exito");

        //Limpio los campos para que el formulario esté preparado para otro registro.
        setInicio("");
        setFin("");
        setObservaciones("");
      }
    } catch (error) {
      //Guardo el error en consola para poder localizar posibles problemas durante el desarrollo.
      console.error("Error al registrar el sueño:", error);

      //Muestro un mensaje al usuario
      props.setMensaje("No se pudo registrar el sueño.");
      props.setTipoMensaje("error");
    }
  };

  //Obtengo la fecha actual en formato YYYY-MM-DD para impedir seleccionar días futuros.
  let hoy = new Date();

  let fechaMaxima = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
  
  return (
    <form className="formulario-sueno" onSubmit={registrarSueno}>
      <h3>Registrar sueño</h3>

      <div className="campo-sueno">
        <label htmlFor="inicio">Inicio del sueño</label>
        <input
          type="datetime-local"
          id="inicio"
          value={inicio}
          onChange={(event) => setInicio(event.target.value)}
          max={`${fechaMaxima}T23:59`}
          required
        />
      </div>

      <div className="campo-sueno">
        <label htmlFor="fin">Fin del sueño (opcional)</label>
        <input
          type="datetime-local"
          id="fin"
          value={fin}
          max={`${fechaMaxima}T23:59`}
          onChange={(event) => setFin(event.target.value)}
        />
      </div>

      <div className="campo-sueno">
        <label htmlFor="observaciones">Observaciones</label>
        <textarea
          id="observaciones"
          value={observaciones}
          onChange={(event) => setObservaciones(event.target.value)}
          placeholder="Añade alguna observación si lo necesitas..."
        />
      </div>

      <button type="submit" className="boton-guardar-sueno">
        Guardar sueño
      </button>
    </form>
  );
}

export default FormularioSueno;
