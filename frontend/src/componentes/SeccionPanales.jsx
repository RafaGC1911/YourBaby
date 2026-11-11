import { useState, useEffect } from "react";
import FormularioPanal from "./FormularioPanal.jsx";
import FormularioEdicionPanal from "./FormularioEdicionPanal.jsx";

function SeccionPanales(props) {
  //Guardo los pañales del bebé, los mensajes de respuesta y el registro que estoy editando.
  let [panales, setPanales] = useState([]);
  let [mensaje, setMensaje] = useState("");
  let [tipoMensaje, setTipoMensaje] = useState("");
  let [panalEditando, setPanalEditando] = useState(null);

  //Consulto los pañales asociados al bebé seleccionado.
  let obtenerPanales = async () => {
    try {
      let response = await fetch(
        `http://localhost:3000/api/panales/bebe/${props.bebeId}`,
      );

      let responseData = await response.json();

      if (!response.ok) {
        setMensaje(
          responseData.message || "No se pudieron obtener los pañales",
        );
        setTipoMensaje("error");
        return false;
      }

      //Actualizo el historial con los datos recibidos del backend.
      setPanales(responseData.data);
      return true;
    } catch (error) {
      setMensaje("No se pudieron cargar los pañales");
      setTipoMensaje("error");
      return false;
    }
  };

  //Cargo el historial cuando se abre la sección o cambia el bebé seleccionado.
  useEffect(() => {
    obtenerPanales();
  }, [props.bebeId]);

  //Abro el formulario de edición y limpio los mensajes anteriores.
  let seleccionarPanal = (panal) => {
    setPanalEditando(panal);
    setMensaje("");
    setTipoMensaje("");
  };

  //Cierro el formulario de edición.
  let cerrarEdicion = () => {
    setPanalEditando(null);
  };

  //Elimino un pañal y actualizo el historial para mostrar los cambios.
  let eliminarPanal = async (id) => {
    let confirmar = window.confirm(
      "¿Seguro que quieres eliminar este registro?",
    );

    if (!confirmar) {
      return;
    }

    try {
      let response = await fetch(`http://localhost:3000/api/panales/${id}`, {
        method: "DELETE",
      });

      let responseData = await response.json();

      if (!response.ok) {
        setMensaje(responseData.message || "No se pudo eliminar el pañal");
        setTipoMensaje("error");
        return;
      }

      await obtenerPanales();
      setMensaje(responseData.message);
      setTipoMensaje("exito");
      setPanalEditando(null);
    } catch (error) {
      setMensaje("No se pudo eliminar el pañal");
      setTipoMensaje("error");
    }
  };

  //Transformo la fecha recibida para mostrarla en formato español.
  let formatearFecha = (fecha) => {
    return new Date(fecha.replace(" ", "T")).toLocaleString("es-ES");
  };

  return (
    <section className="seccion-panales">
      <div className="cabecera-seccion">
        <div>
          <h2>Control de pañales</h2>
          <p>Registros de {props.nombreBebe}</p>
        </div>

        <button onClick={props.alCerrar}>Volver</button>
      </div>

      <FormularioPanal bebeId={props.bebeId} alRegistrar={obtenerPanales} />

      {mensaje && <p className={`mensaje mensaje-${tipoMensaje}`}>{mensaje}</p>}

      <div className="historial-panales">
        <h3>Historial de pañales</h3>

        {panales.length === 0 ? (
          <p>Todavía no hay pañales registrados.</p>
        ) : (
          <div className="lista-panales">
            {panales.map((panal) => {
              //Adapto el nombre del tipo para utilizarlo como clase CSS.
              let claseTipo = panal.tipo === "pipí" ? "pipi" : panal.tipo;
              return (
                <article className="tarjeta-panal" key={panal.id}>
                  <p>
                    <strong>Fecha:</strong> {formatearFecha(panal.fecha_hora)}
                  </p>

                  <p>
                    <strong>Tipo:</strong>{" "}
                    <span className={`etiqueta-panal etiqueta-${claseTipo}`}>
                      {panal.tipo}
                    </span>
                  </p>

                  <p>
                    <strong>Observaciones:</strong>{" "}
                    {panal.observaciones || "Sin observaciones"}
                  </p>

                  <div className="acciones-panal">
                    <button onClick={() => seleccionarPanal(panal)}>
                      Editar
                    </button>

                    <button onClick={() => eliminarPanal(panal.id)}>
                      Eliminar
                    </button>
                  </div>
                  {/**El operador ?. permite consultar el identificador aunque panalEditando sea null.
                   * Si hay un pañal seleccionado para editar y coincide con el de la tarjeta, mostramos su formulario de edición.
                   * Porque queremos mostrar el formulario de edición únicamente dentro de la tarjeta cuyo identificador coincide con el pañal seleccionado.
                   * Es una forma de evitar errores al acceder a propiedades de objetos que pueden estar vacíos.*/}
                  {panalEditando?.id === panal.id && (
                    <FormularioEdicionPanal
                      panal={panalEditando}
                      alCerrar={cerrarEdicion}
                      alActualizar={obtenerPanales}
                    />
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default SeccionPanales;
