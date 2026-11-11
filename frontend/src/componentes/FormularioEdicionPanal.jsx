import { useState } from "react";

function FormularioEdicionPanal(props) {
  //Inicializo los campos con los datos del pañal que hemos seleccionado.
  let [fechaHora, setFechaHora] = useState(
    props.panal.fecha_hora.replace(" ", "T").slice(0, 16),
  );
  let [tipo, setTipo] = useState(props.panal.tipo);
  let [observaciones, setObservaciones] = useState(
    props.panal.observaciones || "",
  );
  let [mensaje, setMensaje] = useState("");
  let [tipoMensaje, setTipoMensaje] = useState("");

  //Obtengo la fecha actual para limitar el calendario.
  let hoy = new Date();
  let fechaMaxima = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;

  //Envío al backend los campos que queremos modificar.
  let actualizarPanal = async (e) => {
    e.preventDefault();

    //Convierto la fecha al formato que espera el backend.
    let fechaHoraFormato = `${fechaHora.replace("T", " ")}:00`;

    let data = {
      fecha_hora: fechaHoraFormato,
      tipo,
      observaciones: observaciones.trim() || null,
    };

    try {
      let response = await fetch(
        `http://localhost:3000/api/panales/${props.panal.id}`,
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
        setMensaje(responseData.message || "No se pudo actualizar el pañal");
        setTipoMensaje("error");
        return;
      }

      //Recargo el historial para mostrar los datos modificados.
      let historialActualizado = await props.alActualizar();

      if (!historialActualizado) {
        setMensaje(
          "El pañal se ha actualizado, pero no se pudo recargar el historial",
        );
        setTipoMensaje("error");
        return;
      }

      setMensaje(responseData.message);
      setTipoMensaje("exito");
    } catch (error) {
      setMensaje("No se pudo conectar con el servidor");
      setTipoMensaje("error");
    }
  };

  return (
    <form className="formulario-edicion-panal" onSubmit={actualizarPanal}>
      <h4>Editar pañal</h4>

      <div className="campo-panal">
        <label htmlFor={`fechaHoraEdicion-${props.panal.id}`}>
          Fecha y hora:
        </label>
        <input
          type="datetime-local"
          id={`fechaHoraEdicion-${props.panal.id}`}
          value={fechaHora}
          onChange={(e) => setFechaHora(e.target.value)}
          max={`${fechaMaxima}T23:59`}
          required
        />
      </div>

      <div className="campo-panal">
        <label htmlFor={`tipoEdicion-${props.panal.id}`}>Tipo de pañal:</label>
        <select
          id={`tipoEdicion-${props.panal.id}`}
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          required
        >
          <option value="pipí">Pipí</option>
          <option value="caca">Caca</option>
          <option value="mixto">Mixto</option>
        </select>
      </div>

      <div className="campo-panal">
        <label htmlFor={`observacionesEdicion-${props.panal.id}`}>
          Observaciones:
        </label>
        <textarea
          id={`observacionesEdicion-${props.panal.id}`}
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="Observaciones opcionales"
        />
      </div>

      {mensaje && <p className={`mensaje mensaje-${tipoMensaje}`}>{mensaje}</p>}

      <div className="acciones-formulario-edicion">
        <button type="submit" className="boton-guardar-panal">
          Guardar cambios
        </button>

        <button type="button" onClick={props.alCerrar}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default FormularioEdicionPanal;
