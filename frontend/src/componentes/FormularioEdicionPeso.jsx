
import { useState } from "react";

function FormularioEdicionPeso(props) {
  let [peso, setPeso] = useState(String(props.peso.peso));
  let [fecha, setFecha] = useState(props.peso.fecha.split("T")[0]);
  let [observaciones, setObservaciones] = useState(
    props.peso.observaciones || "",
  );

  //Obtengo la fecha actual para impedir que se pueda seleccionar un día futuro
  let ahora = new Date();
  let fechaMaxima = `${ahora.getFullYear()}-${String(
    ahora.getMonth() + 1,
  ).padStart(2, "0")}-${String(ahora.getDate()).padStart(2, "0")}`;

  //Enviar los cambios de la medición al backend
  let actualizarPeso = async (e) => {
    e.preventDefault();

    try {
      let response = await fetch(
        `http://localhost:3000/api/pesos/${props.peso.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            peso: Number(peso),
            fecha,
            observaciones: observaciones.trim() || null,
          }),
        },
      );

      let responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message);
      }

      props.alMensaje("Medición actualizada correctamente", "exito");

      //Cierro el formulario y vuelvo a consultar el historial para mostrar los datos actualizados
      props.alCerrar();
      await props.alActualizar();
    } catch (error) {
      console.error("Error al actualizar el peso:", error);
      props.alMensaje("No se pudo actualizar la medición", "error");
    }
  };

  return (
    <form className="formulario-edicion-peso" onSubmit={actualizarPeso}>
      <h3>Editar medición</h3>

      <div className="campo-peso">
        <label htmlFor={`peso-edicion-${props.peso.id}`}>Peso (kg)</label>
        <input
          type="number"
          id={`peso-edicion-${props.peso.id}`}
          min="0.001"
          max="29.999"
          step="0.001"
          value={peso}
          onChange={(e) => setPeso(e.target.value)}
          required
        />
      </div>

      <div className="campo-peso">
        <label htmlFor={`fecha-edicion-${props.peso.id}`}>Fecha</label>
        <input
          type="date"
          id={`fecha-edicion-${props.peso.id}`}
          value={fecha}
          max={fechaMaxima}
          onChange={(e) => setFecha(e.target.value)}
          required
        />
      </div>

      <div className="campo-peso">
        <label htmlFor={`observaciones-edicion-${props.peso.id}`}>
          Observaciones
        </label>
        <textarea
          id={`observaciones-edicion-${props.peso.id}`}
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
        />
      </div>

      <div className="acciones-formulario-edicion">
        <button type="submit" className="boton-guardar-peso">
          Guardar cambios
        </button>

        <button type="button" onClick={props.alCerrar}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default FormularioEdicionPeso;
