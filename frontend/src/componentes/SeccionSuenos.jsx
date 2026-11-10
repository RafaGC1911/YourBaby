import { useState, useEffect } from "react";
import FormularioSueno from "./FormularioSueno";
import FormularioEdicionSueno from "./FormularioEdicionSueno";

function SeccionSuenos(props) {
  //Guardo los registros de sueño del bebé seleccionado.
  let [suenos, setSuenos] = useState([]);

  //Controlo los mensajes que aparecen después de cada operación.
  let [mensaje, setMensaje] = useState("");
  let [tipoMensaje, setTipoMensaje] = useState("");

  //Guardo el sueño que se está modificando.
  let [suenoEditando, setSuenoEditando] = useState(null);

  //Obtengo los registros de sueño del bebé desde el backend.
  let obtenerSuenos = async () => {
    try {
      let response = await fetch(
        `http://localhost:3000/api/suenos/bebe/${props.bebeId}`,
      );

      if (!response.ok) {
        throw new Error("No se pudieron obtener los registros de sueño");
      }

      let responseData = await response.json();

      setSuenos(responseData.data);
      setMensaje("");
      setTipoMensaje("");

      return true;
    } catch (error) {
      console.error("Error al obtener los sueños:", error);
      setMensaje("No se pudieron cargar los registros de sueño.");
      setTipoMensaje("error");

      return false;
    }
  };

  //Cargo los sueños cuando se abre la sección o cambia el bebé seleccionado.
  useEffect(() => {
    obtenerSuenos();
  }, [props.bebeId]);

  //Selecciono el registro que quiero modificar y limpio los mensajes anteriores.
  let seleccionarSueno = (sueno) => {
    setMensaje("");
    setTipoMensaje("");
    setSuenoEditando(sueno);
  };

  //Cierro el formulario de edición y vuelvo al formulario de registro.
  let cerrarEdicion = () => {
    setSuenoEditando(null);
  };

  //Elimino un registro de sueño después de pedir confirmación.
  let eliminarSueno = async (id) => {
    let confirmar = window.confirm(
      "¿Seguro que quieres eliminar este registro de sueño?",
    );

    if (!confirmar) {
      return;
    }

    setMensaje("");
    setTipoMensaje("");

    try {
      let response = await fetch(`http://localhost:3000/api/suenos/${id}`, {
        method: "DELETE",
      });

      let responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message);
      }

      //Actualizo el historial para quitar el registro eliminado.
      let resultado = await obtenerSuenos();

      if (resultado) {
        setMensaje("Registro de sueño eliminado correctamente.");
        setTipoMensaje("exito");
      }
    } catch (error) {
      console.error("Error al eliminar el sueño:", error);
      setMensaje("No se pudo eliminar el registro de sueño.");
      setTipoMensaje("error");
    }
  };

  //Convierto la fecha recibida en un formato más fácil de leer.
  let formatearFecha = (fecha) => {
    if (!fecha) {
      return "";
    }

    return new Date(fecha.replace(" ", "T")).toLocaleString("es-ES");
  };

  //Calculo cuánto tiempo ha durado un sueño utilizando su hora de inicio y fin
  let calcularDuracion = (sueno) => {
    //Si todavía no hay una hora de finalización, el sueño continúa.
    if (!sueno.fin) {
      return "Sueño en curso";
    }

    //Convierto las fechas recibidas del backend en objetos Date.
    let fechaInicio = new Date(sueno.inicio.replace(" ", "T"));
    let fechaFin = new Date(sueno.fin.replace(" ", "T"));

    //Compruebo que ambas fechas sean válidas antes de realizar el cálculo.
    if (
      isNaN(fechaInicio.getTime()) ||
      isNaN(fechaFin.getTime()) ||
      fechaFin < fechaInicio
    ) {
      return "Duración no disponible";
    }

    //Obtengo la diferencia entre ambas fechas en milisegundos.
    let diferencia = fechaFin - fechaInicio;

    //Convierto los milisegundos en minutos y calculo horas y minutos restantes.
    let minutosTotales = Math.floor(diferencia / 60000);
    let horas = Math.floor(minutosTotales / 60);
    let minutos = minutosTotales % 60;

    //Devuelvo la duración en un formato fácil de leer.
    if (horas === 0) {
      return `${minutos} min`;
    }

    return `${horas} h ${minutos} min`;
  };

  return (
    <section className="seccion-suenos">
      <div className="cabecera-seccion">
        <div>
          <h2>Registro del sueño</h2>
          <p>Historial de sueño de {props.nombreBebe}</p>
        </div>

        <button type="button" onClick={props.alCerrar}>
          Cerrar
        </button>
      </div>

      {mensaje && <p className={`mensaje mensaje-${tipoMensaje}`}>{mensaje}</p>}

      {suenoEditando === null ? (
        <FormularioSueno
          bebeId={props.bebeId}
          alRegistrar={obtenerSuenos}
          setMensaje={setMensaje}
          setTipoMensaje={setTipoMensaje}
        />
      ) : (
        <FormularioEdicionSueno
          sueno={suenoEditando}
          alGuardar={obtenerSuenos}
          alCerrar={cerrarEdicion}
          setMensaje={setMensaje}
          setTipoMensaje={setTipoMensaje}
        />
      )}

      <div className="historial-suenos">
        <h3>Historial de sueño</h3>

        {suenos.length === 0 ? (
          <p>No hay registros de sueño.</p>
        ) : (
          <div className="lista-suenos">
            {suenos.map((sueno) => (
              <article className="tarjeta-sueno" key={sueno.id}>
                <div>
                  <p>
                    <strong>Inicio:</strong> {formatearFecha(sueno.inicio)}
                  </p>

                  <p>
                    <strong>Fin:</strong>{" "}
                    {sueno.fin ? formatearFecha(sueno.fin) : "Sueño en curso"}
                  </p>

                  <p>
                    <strong>Duración:</strong> {calcularDuracion(sueno)}
                  </p>

                  {sueno.observaciones && (
                    <p>
                      <strong>Observaciones:</strong> {sueno.observaciones}
                    </p>
                  )}
                </div>

                <div className="acciones-sueno">
                  <button type="button" onClick={() => seleccionarSueno(sueno)}>
                    Editar
                  </button>

                  <button type="button" onClick={() => eliminarSueno(sueno.id)}>
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default SeccionSuenos;
