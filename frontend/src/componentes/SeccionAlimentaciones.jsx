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

  //Eliminar una alimentación concreta.
  let eliminarAlimentacion = async (id) => {
    //Pedir confirmación antes de eliminar el registro.
    let confirmar = window.confirm(
      "¿Seguro que quieres eliminar esta alimentación?",
    );

    if (!confirmar) {
      return;
    }

    setMensaje("");
    setTipoMensaje("");

    try {
      let response = await fetch(
        `http://localhost:3000/api/alimentaciones/${id}`,
        {
          method: "DELETE",
        },
      );

      //Actualizo la lista después de eliminar el registro.
      let resultado = await obtenerAlimentaciones();

      if (resultado) {
        setMensaje("Alimentación eliminada correctamente.");
        setTipoMensaje("exito");
      }

      let responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.message || "No se pudo eliminar la alimentación.",
        );
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
      <h2>Alimentaciones de {props.nombreBebe}</h2>

      {mensaje !== "" && (
        <p className={`mensaje mensaje-${tipoMensaje}`}>{mensaje}</p>
      )}
      {/*Solo se va a mostrar el formulario de registro cuando no esté abierto el de edición*/}
      {alimentacionEditando === null && (
        <FormularioAlimentacion
          bebeId={props.bebeId}
          alRegistrar={obtenerAlimentaciones}
          setMensaje={setMensaje}
          setTipoMensaje={setTipoMensaje}
        />
      )}

      {alimentacionEditando !== null && (
        <FormularioEdicionAlimentacion
          alimentacion={alimentacionEditando} //Muestra el formulario de edición si se ha pulsado el botón y le pasa el objeto al componente
          alGuardar={obtenerAlimentaciones} //Pasar al formulario la función que vuelve a consultar las alimentaciones.
          alCerrar={cerrarEdicion}
          setMensaje={setMensaje}
          setTipoMensaje={setTipoMensaje}
        />
      )}
      {alimentaciones.length > 0 && (
        <div className="lista-alimentaciones">
          {/**Listado de alimentaciones */}
          {alimentaciones.map((alimentacion) => (
            <article key={alimentacion.id}>
              {alimentacion.cantidad_ml !== null && (
                <p>Cantidad: {alimentacion.cantidad_ml} ml</p>
              )}

              <p>Tipo: {alimentacion.tipo}</p>
              <p>
                Fecha:{" "}
                {new Date(alimentacion.fecha_hora).toLocaleDateString("es-ES")}
              </p>

              <p>
                Hora:{" "}
                {new Date(alimentacion.fecha_hora).toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p>Observaciones: {alimentacion.observaciones}</p>

              {/**Botón eliminar */}
              <button
                type="button"
                onClick={() => eliminarAlimentacion(alimentacion.id)}
              >
                Eliminar
              </button>

              {/**Botón editar */}
              <button
                type="button"
                onClick={() => seleccionarAlimentacion(alimentacion)}
              >
                Editar
              </button>
            </article>
          ))}
        </div>
      )}

      {mensaje === "" && alimentaciones.length === 0 && (
        <p>No hay alimentaciones registradas.</p>
      )}

      <button type="button" onClick={props.alCerrar}>
        Cerrar alimentaciones
      </button>
    </section>
  );
}

export default SeccionAlimentaciones;
