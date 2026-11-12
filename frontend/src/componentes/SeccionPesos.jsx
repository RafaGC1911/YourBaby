import { useState, useEffect } from "react";
import FormularioPeso from "./FormularioPeso";
import FormularioEdicionPeso from "./FormularioEdicionPeso";

function SeccionPesos(props) {
  let [pesos, setPesos] = useState([]);
  let [mensaje, setMensaje] = useState("");
  let [tipoMensaje, setTipoMensaje] = useState("");
  let [pesoEditando, setPesoEditando] = useState(null);

  //Obtener las mediciones de peso del bebé seleccionado
  let obtenerPesos = async () => {
    try {
      let response = await fetch(
        `http://localhost:3000/api/pesos/bebe/${props.bebeId}`,
      );

      let responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message);
      }

      setPesos(responseData.data);
      return true;
    } catch (error) {
      console.error("Error al obtener los pesos:", error);
      setMensaje("No se pudieron cargar las mediciones de peso");
      setTipoMensaje("error");
      return false;
    }
  };

  //Cargar las mediciones cuando se abra la sección o cambie el bebé
  useEffect(() => {
    obtenerPesos();
  }, [props.bebeId]);

  //Seleccionar una medición para editarla
  let seleccionarPeso = (peso) => {
    setPesoEditando(peso);
    setMensaje("");
    setTipoMensaje("");
  };

  //Cerrar el formulario de edición
  let cerrarEdicion = () => {
    setPesoEditando(null);
  };

  //Eliminar una medición de peso
  let eliminarPeso = async (id) => {
    if (!window.confirm("¿Quieres eliminar esta medición de peso?")) {
      return;
    }

    try {
      let response = await fetch(`http://localhost:3000/api/pesos/${id}`, {
        method: "DELETE",
      });

      let responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message);
      }

      setMensaje("Medición eliminada correctamente");
      setTipoMensaje("exito");

      await obtenerPesos();
    } catch (error) {
      console.error("Error al eliminar el peso:", error);
      setMensaje("No se pudo eliminar la medición");
      setTipoMensaje("error");
    }
  };

  //Mostrar una fecha en formato día/mes/año
  let formatearFecha = (fecha) => {
    return fecha.split("T")[0].split("-").reverse().join("/");
  };

  return (
    <section className="seccion-pesos">
      <h2>Control de peso de {props.nombreBebe}</h2>

      <button type="button" onClick={props.alCerrar}>
        Volver
      </button>

      <FormularioPeso
        bebeId={props.bebeId}
        alRegistrar={obtenerPesos}
        alMensaje={(texto, tipo) => {
          setMensaje(texto);
          setTipoMensaje(tipo);
        }}
      />

      {mensaje && <p className={`mensaje mensaje-${tipoMensaje}`}>{mensaje}</p>}

      <div className="historial-pesos">
        <h3>Historial de peso</h3>

        {pesos.length === 0 ? (
          <p>No hay mediciones de peso registradas.</p>
        ) : (
          <div className="lista-pesos">
            {pesos.map((peso) => (
              <article className="tarjeta-peso" key={peso.id}>
                <p>
                  <strong>Fecha:</strong> {formatearFecha(peso.fecha)}
                </p>

                <p>
                  <strong>Peso:</strong> {Number(peso.peso).toFixed(3)} kg
                </p>

                {peso.observaciones && (
                  <p>
                    <strong>Observaciones:</strong> {peso.observaciones}
                  </p>
                )}

                <div className="acciones-peso">
                  <button type="button" onClick={() => seleccionarPeso(peso)}>
                    Editar
                  </button>

                  <button type="button" onClick={() => eliminarPeso(peso.id)}>
                    Eliminar
                  </button>
                </div>

                {pesoEditando?.id === peso.id && (
                  <FormularioEdicionPeso
                    peso={pesoEditando}
                    alCerrar={cerrarEdicion}
                    alActualizar={obtenerPesos}
                    alMensaje={(texto, tipo) => {
                      setMensaje(texto);
                      setTipoMensaje(tipo);
                    }}
                  />
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default SeccionPesos;
