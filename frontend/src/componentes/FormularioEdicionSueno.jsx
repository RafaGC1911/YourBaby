import { useState } from "react";

function FormularioEdicionSueno(props) {
  //Recupero los datos del sueño seleccionado para mostrarlos inicialmente en el formulario.
  //Si el sueño no tiene hora de finalización, dejo ese campo vacío para poder completarlo.
  let [inicio, setInicio] = useState(
    props.sueno.inicio ? props.sueno.inicio.replace(" ", "T").slice(0, 16) : "",
  );

  let [fin, setFin] = useState(
    props.sueno.fin ? props.sueno.fin.replace(" ", "T").slice(0, 16) : "",
  );

  //Cargo las observaciones existentes para que el usuario pueda conservarlas o modificarlas.
  let [observaciones, setObservaciones] = useState(
    props.sueno.observaciones ?? "",
  );

  //Función que se ejecuta al guardar los cambios del registro.
  let guardarSueno = async (e) => {
    //Evito que el navegador recargue la página al enviar el formulario.
    e.preventDefault();

    //Limpio los mensajes anteriores antes de realizar una nueva operación.
    props.setMensaje("");
    props.setTipoMensaje("");

    //Compruebo que el inicio tenga una fecha y hora.
    if (!inicio) {
      props.setMensaje("Debes indicar cuándo comenzó el sueño.");
      props.setTipoMensaje("error");
      return;
    }

    //Compruebo que, si se ha indicado un final, no sea anterior al inicio.
    //Convierto ambos valores en objetos Date para poder compararlos correctamente.
    if (fin && new Date(fin) < new Date(inicio)) {
      props.setMensaje(
        "La hora de finalización no puede ser anterior al inicio.",
      );
      props.setTipoMensaje("error");
      return;
    }

    //Preparo los datos que voy a enviar al backend.
    //Si el campo final está vacío, envío null para indicar que el sueño continúa.
    let data = {
      inicio: inicio.replace("T", " ") + ":00",
      fin: fin ? fin.replace("T", " ") + ":00" : null,
      observaciones: observaciones.trim() || null,
    };

    try {
      //Envío los cambios mediante PATCH porque solo quiero actualizar los campos de este registro.
      let response = await fetch(
        `http://localhost:3000/api/suenos/${props.sueno.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
      );

      //Convierto la respuesta del backend en un objeto JS.
      let responseData = await response.json();

      //Compruebo si el servidor ha podido actualizar el registro.
      if (!response.ok) {
        throw new Error(responseData.message);
      }

      //Vuelvo a consultar los registros para mostrar los datos actualizados.
      let resultado = await props.alGuardar();

      //Cierro el formulario de edición y muestro el resultado de la operación.
      props.alCerrar();

      if (resultado) {
        props.setMensaje("Registro de sueño actualizado correctamente.");
        props.setTipoMensaje("exito");
      }
    } catch (error) {
      console.error("Error al actualizar el sueño:", error);

      props.setMensaje("No se pudo actualizar el registro de sueño.");
      props.setTipoMensaje("error");
    }
  };

  //Obtengo la fecha actual en formato YYYY-MM-DD para impedir seleccionar días futuros.
  let hoy = new Date();

  let fechaMaxima = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;

  return (
    <form className="formulario-edicion-sueno" onSubmit={guardarSueno}>
      <h3>Editar registro de sueño</h3>

      <div className="campo-sueno">
        <label htmlFor="inicio-edicion">Inicio del sueño</label>
        <input
          type="datetime-local"
          id="inicio-edicion"
          value={inicio}
          max={`${fechaMaxima}T23:59`}
          onChange={(e) => setInicio(e.target.value)}
          required
        />
      </div>

      <div className="campo-sueno">
        <label htmlFor="fin-edicion">Fin del sueño (opcional)</label>
        <input
          type="datetime-local"
          id="fin-edicion"
          value={fin}
          max={`${fechaMaxima}T23:59`}
          onChange={(e) => setFin(e.target.value)}
        />
      </div>

      <div className="campo-sueno">
        <label htmlFor="observaciones-edicion">Observaciones</label>
        <textarea
          id="observaciones-edicion"
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="Añade alguna observación si lo necesitas..."
        />
      </div>

      <div className="acciones-formulario-edicion">
        <button type="submit" className="boton-guardar-sueno">
          Guardar cambios
        </button>

        <button
          type="button"
          className="boton-cancelar-edicion"
          onClick={props.alCerrar}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default FormularioEdicionSueno;
