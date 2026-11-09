import { useState } from "react";

function FormularioEdicionAlimentacion(props) {
  //Inicializar los estados con los datos de la alimentación seleccionada
  let [cantidad, setCantidad] = useState(props.alimentacion.cantidad_ml ?? "");
  /**El operador ?? comprueba si el valor es null o undefined y si lo es pone una cadena vacía
   * Así se evita que los campos del formulario aparezcan con valores null */

  let [tipo, setTipo] = useState(props.alimentacion.tipo);

  let [fecha, setFecha] = useState(props.alimentacion.fecha_hora.slice(0, 10));

  let [hora, setHora] = useState(props.alimentacion.fecha_hora.slice(11, 16));

  let [observaciones, setObservaciones] = useState(
    props.alimentacion.observaciones ?? "",
  );

  //Función que recoge los datos modificados y los prepara para enviarlos al servidor
  let guardarCambios = async (e) => {
    e.preventDefault();

    //Agrupar los datos actualizados.
    let data = {
      cantidad_ml: cantidad === "" ? null : Number(cantidad),
      tipo: tipo,
      fecha_hora: `${fecha} ${hora}:00`,
      observaciones: observaciones,
    };

    try {
      let response = await fetch(
        `http://localhost:3000/api/alimentaciones/${props.alimentacion.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
      );

      let responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.message || "No se pudo actualizar la alimentación.",
        );
      }

      //Actualizo la lista y compruebo si se ha cargado correctamente.
      let resultado = await props.alGuardar();

      //Cierro el formulario porque el backend ya ha guardado los cambios.
      props.alCerrar();

      if (resultado) {
        props.setMensaje("Alimentación actualizada correctamente.");
        props.setTipoMensaje("exito");
      }
    } catch (error) {
      console.error("Error al actualizar la alimentación:", error);
      props.setMensaje("No se pudo actualizar la alimentación.");
      props.setTipoMensaje("error");
    }
  };

  //Obtengo la fecha actual en formato YYYY-MM-DD.
  let hoy = new Date();
  let fechaMaxima = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;

  return (
    <form className="formulario-edicion-alimentacion" onSubmit={guardarCambios}>
      <h3>Editar alimentación</h3>

      <div className="campo-alimentacion">
        <label htmlFor="cantidad">Cantidad (ml)</label>
        <input
          type="number"
          id="cantidad"
          min="1"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
        />
      </div>

      <div className="campo-alimentacion">
        <label htmlFor="tipo">Tipo de alimentación</label>
        <select
          id="tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          <option value="pecho">Pecho</option>
          <option value="biberon">Biberón</option>
        </select>
      </div>

      <div className="campos-fecha-hora">
        <div className="campo-alimentacion">
          <label htmlFor="fecha">Fecha</label>
          <input
            type="date"
            id="fecha"
            value={fecha}
            max={fechaMaxima}
            onChange={(e) => setFecha(e.target.value)}
            required
          />
        </div>

        <div className="campo-alimentacion">
          <label htmlFor="hora">Hora</label>
          <input
            type="time"
            id="hora"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="campo-alimentacion">
        <label htmlFor="observaciones">Observaciones</label>
        <textarea
          id="observaciones"
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          rows="3"
        />
      </div>

      <div className="acciones-formulario-edicion">
        <button type="submit" className="boton-guardar-alimentacion">
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

export default FormularioEdicionAlimentacion;
