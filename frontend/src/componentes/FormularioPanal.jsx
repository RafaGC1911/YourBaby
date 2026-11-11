
import { useState } from "react";

function FormularioPanal(props) {
  //Guardo los valores que introduce el usuario en el formulario.
  let [fechaHora, setFechaHora] = useState("");
  let [tipo, setTipo] = useState("");
  let [observaciones, setObservaciones] = useState("");
  let [mensaje, setMensaje] = useState("");
  let [tipoMensaje, setTipoMensaje] = useState("");

  //Obtengo la fecha actual para impedir que se registren pañales futuros.
  let hoy = new Date();
  let fechaMaxima = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;

  //Envio los datos del formulario al backend.
  let registrarPanal = async (e) => {
    e.preventDefault();

    //Convierto el formato de fecha del input al formato que espera el backend.
    let fechaHoraFormato = `${fechaHora.replace("T", " ")}:00`;

    let data = {
      bebe_id: Number(props.bebeId),
      fecha_hora: fechaHoraFormato,
      tipo,
      observaciones: observaciones.trim() || null,
    };

    try {
      let response = await fetch("http://localhost:3000/api/panales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      let responseData = await response.json();

      if (!response.ok) {
        setMensaje(responseData.message || "No se pudo registrar el pañal");
        setTipoMensaje("error");
        return;
      }

      //Actualizo el historial después de registrar el pañal.
      await props.alRegistrar();

      setMensaje(responseData.message);
      setTipoMensaje("exito");

      //Limpio los campos para poder registrar otro pañal.
      setFechaHora("");
      setTipo("");
      setObservaciones("");
    } catch (error) {
      setMensaje("No se pudo conectar con el servidor");
      setTipoMensaje("error");
    }
  };

  return (
    <form className="formulario-panal" onSubmit={registrarPanal}>
      <h3>Registrar pañal</h3>

      <div className="campo-panal">
        <label htmlFor="fechaHoraPanal">Fecha y hora:</label>
        <input
          type="datetime-local"
          id="fechaHoraPanal"
          value={fechaHora}
          onChange={(e) => setFechaHora(e.target.value)}
          max={`${fechaMaxima}T23:59`}
          required
        />
      </div>

      <div className="campo-panal">
        <label htmlFor="tipoPanal">Tipo de pañal:</label>
        <select
          id="tipoPanal"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          required
        >
          <option value="">Selecciona un tipo</option>
          <option value="pipí">Pipí</option>
          <option value="caca">Caca</option>
          <option value="mixto">Mixto</option>
        </select>
      </div>

      <div className="campo-panal">
        <label htmlFor="observacionesPanal">Observaciones:</label>
        <textarea
          id="observacionesPanal"
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="Observaciones opcionales"
        />
      </div>

      {mensaje && (
        <p className={`mensaje ${tipoMensaje}`}>
          {mensaje}
        </p>
      )}

      <button type="submit" className="boton-guardar-panal">
        Registrar pañal
      </button>
    </form>
  );
}

export default FormularioPanal;
