import { useState, useEffect } from "react";
import FormularioAlimentacion from "./FormularioAlimentacion.jsx";
import FormularioEdicionAlimentacion from "./FormularioEdicionAlimentacion.jsx";

function SeccionAlimentaciones(props) {
  //Guarda las alimentaciones que recibimos del servidor.
  let [alimentaciones, setAlimentaciones] = useState([]);
  let [mensaje, setMensaje] = useState("");
  //Para el formato mensaje de éxito o error
  let [tipoMensaje, setTipoMensaje] = useState("");

  //Guarda la alimentación que estamos editando.
  let [alimentacionEditando, setAlimentacionEditando] = useState(null); //null al principio porque inicialmente no se está editando ninguna alimentación

  //Seleccionar la alimentación a editar.
  let seleccionarAlimentacion = (alimentacion) => {
    //Limpiar los mensajes anteriores
    setMensaje("");
    setTipoMensaje("");

    //Función que se llama desde el botón
    setAlimentacionEditando(alimentacion);
  };

  //Cerrar el formulario de edición poniéndolo a null para que no se muestre
  let cerrarEdicion = () => {
    setAlimentacionEditando(null);
  };

  //Función para obtener las alimentaciones de un bebé.
  //Hago una petición al backend, actualizo la lista y devuelvo
  //un resultado para saber si la operación ha terminado correctamente.
  let obtenerAlimentaciones = async () => {
    try {
      let response = await fetch(
        `http://localhost:3000/api/alimentaciones/bebe/${props.bebeId}`,
      );

      if (!response.ok) {
        throw new Error("No se pudieron obtener las alimentaciones.");
      }

      let responseData = await response.json();

      setAlimentaciones(responseData.data);
      setMensaje("");
      setTipoMensaje("");

      //Indico que la carga se ha realizado correctamente.
      return true;
    } catch (error) {
      console.error("Error al obtener alimentaciones:", error);

      setMensaje("No se pudieron cargar las alimentaciones.");
      setTipoMensaje("error");

      //Indico que ha habido un problema al cargar los datos.
      return false;
    }
  };

  //Función para eliminar una alimentación concreta.
  //Primero pido confirmación, después envío la petición DELETE
  //y finalmente actualizo la lista para mostrar los datos actuales.
  let eliminarAlimentacion = async (id) => {
    //Pido confirmación antes de eliminar el registro.
    let confirmar = window.confirm(
      "¿Seguro que quieres eliminar esta alimentación?",
    );

    if (!confirmar) {
      return;
    }

    //Limpio los mensajes de operaciones anteriores.
    setMensaje("");
    setTipoMensaje("");

    try {
      let response = await fetch(
        `http://localhost:3000/api/alimentaciones/${id}`,
        {
          method: "DELETE",
        },
      );

      let responseData = await response.json();

      //Compruebo si el servidor ha podido eliminar el registro.
      if (!response.ok) {
        throw new Error(
          responseData.message || "No se pudo eliminar la alimentación.",
        );
      }

      //Actualizo la lista después de confirmar que la eliminación ha funcionado.
      let resultado = await obtenerAlimentaciones();

      if (resultado) {
        setMensaje("Alimentación eliminada correctamente.");
        setTipoMensaje("exito");
      }
    } catch (error) {
      console.error("Error al eliminar la alimentación:", error);

      setMensaje("No se pudo eliminar la alimentación.");
      setTipoMensaje("error");
    }
  };

  //Ejecuto la consulta cuando se abre la sección o cambia el bebé seleccionado.
  useEffect(() => {
    obtenerAlimentaciones();
  }, [props.bebeId]);

  return (
    <section className="seccion-alimentaciones">
      {/*Cabecera de la sección*/}
      <div className="cabecera-alimentaciones">
        <div>
          <h2>Alimentaciones</h2>
          <p>Historial de alimentación de {props.nombreBebe}</p>
        </div>

        <button type="button" className="boton-cerrar" onClick={props.alCerrar}>
          Cerrar
        </button>
      </div>

      {/*Mensajes de éxito o error*/}
      {mensaje !== "" && (
        <p className={`mensaje mensaje-${tipoMensaje}`}>{mensaje}</p>
      )}

      {/*Contenedor de los formularios*/}
      <div className="contenedor-formulario-alimentacion">
        {/*Muestro el formulario de registro si no estoy editando*/}
        {alimentacionEditando === null && (
          <FormularioAlimentacion
            bebeId={props.bebeId}
            alRegistrar={obtenerAlimentaciones}
            setMensaje={setMensaje}
            setTipoMensaje={setTipoMensaje}
          />
        )}

        {/*Muestro el formulario de edición cuando selecciono un registro*/}
        {alimentacionEditando !== null && (
          <FormularioEdicionAlimentacion
            alimentacion={alimentacionEditando}
            alGuardar={obtenerAlimentaciones}
            alCerrar={cerrarEdicion}
            setMensaje={setMensaje}
            setTipoMensaje={setTipoMensaje}
          />
        )}
      </div>

      {/*Historial de alimentaciones*/}
      <div className="historial-alimentaciones">
        <h3>Historial de registros</h3>

        {alimentaciones.length > 0 ? (
          <div className="lista-alimentaciones">
            {alimentaciones.map((alimentacion) => (
              <article className="tarjeta-alimentacion" key={alimentacion.id}>
                <div className="datos-alimentacion">
                  <h4>
                    {alimentacion.tipo === "pecho"
                      ? "Lactancia materna"
                      : "Biberón"}
                  </h4>

                  {alimentacion.cantidad_ml !== null && (
                    <p className="cantidad-alimentacion">
                      {alimentacion.cantidad_ml} ml
                    </p>
                  )}

                  <p>
                    Fecha:{" "}
                    {new Date(alimentacion.fecha_hora).toLocaleDateString(
                      "es-ES",
                    )}
                  </p>

                  <p>
                    Hora:{" "}
                    {new Date(alimentacion.fecha_hora).toLocaleTimeString(
                      "es-ES",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </p>

                  {alimentacion.observaciones && (
                    <p>Observaciones: {alimentacion.observaciones}</p>
                  )}
                </div>

                {/*Botones para modificar o eliminar el registro*/}
                <div className="acciones-alimentacion">
                  <button
                    type="button"
                    className="boton-editar"
                    onClick={() => seleccionarAlimentacion(alimentacion)}
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    className="boton-eliminar"
                    onClick={() => eliminarAlimentacion(alimentacion.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          mensaje === "" && (
            <p className="sin-alimentaciones">
              Todavía no hay alimentaciones registradas.
            </p>
          )
        )}
      </div>
    </section>
  );
}

export default SeccionAlimentaciones;
