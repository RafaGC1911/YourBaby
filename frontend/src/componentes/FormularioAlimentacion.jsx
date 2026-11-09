import { useState } from "react";

function FormularioAlimentacion(props) {
  //Guardar los valores que introduce el usuario en el formulario.
  let [cantidad, setCantidad] = useState("");
  let [tipo, setTipo] = useState("");

  //Guardar la fecha y la hora de la alimentación por separado.
  let [fecha, setFecha] = useState("");
  let [hora, setHora] = useState("");

  let [observaciones, setObservaciones] = useState("");

  //Recoger datos del formulario cuando el usuario lo envía.
  let registrarAlimentacion = async (e) => {
    e.preventDefault();

    //Agrupar los datos para poder enviarlos después al servidor.
    let data = {
      bebe_id: props.bebeId, //bebeId viene de la sección alimentaciones que ya conoce el ID del bebé seleccionado
      cantidad_ml: cantidad === "" ? null : Number(cantidad), //Si cantidad está vacío envía null y si no convierte a número
      tipo: tipo,
      fecha_hora: `${fecha} ${hora}:00`, //Enviar los datos de fecha y hora al backend en el formato que espera
      observaciones: observaciones,
    };

    try {
      let response = await fetch("http://localhost:3000/api/alimentaciones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      let responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.message || "No se pudo registrar la alimentación.",
        );
      }

      //Actualizo la lista de alimentaciones y compruebo si ha funcionado.
      let resultado = await props.alRegistrar();
      if (resultado) {
        props.setMensaje("Alimentación registrada correctamente.");
        props.setTipoMensaje("exito");
      }

      //Limpiar los campos después de registrar la alimentación.
      setCantidad("");
      setTipo("");
      setFecha("");
      setHora("");
      setObservaciones("");
    } catch (error) {
      console.error("Error al registrar la alimentación:", error);
      props.setMensaje("No se pudo registrar la alimentación.");
      props.setTipoMensaje("error");
    }
  };

  //Obtengo la fecha actual en formato YYYY-MM-DD.
  let hoy = new Date();
  let fechaMaxima = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;

  return (
    <form className="formulario-alimentacion" onSubmit={registrarAlimentacion}>
      <h3>Registrar alimentación</h3>

      <div className="campo-alimentacion">
        <label htmlFor="cantidad_ml">Cantidad (ml)</label>
        <input
          type="number"
          id="cantidad_ml"
          name="cantidad_ml"
          min="1"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
        />
      </div>

      <div className="campo-alimentacion">
        <label htmlFor="tipo">Tipo de alimentación</label>
        <select
          id="tipo"
          name="tipo"
          required
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          <option value="">Selecciona una opción</option>
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
            name="fecha"
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
            name="hora"
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
          name="observaciones"
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          rows="3"
        />
      </div>

      <button type="submit" className="boton-guardar-alimentacion">
        Guardar alimentación
      </button>
    </form>
  );
}

export default FormularioAlimentacion;
