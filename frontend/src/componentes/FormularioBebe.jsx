import { useState } from "react";

function FormularioBebe(props) {
  //Estados de las variables
  let [nombre, setNombre] = useState("");
  let [fechaNacimiento, setFechaNacimiento] = useState("");
  let [pesoNacimiento, setPesoNacimiento] = useState("");
  let [mensaje, setMensaje] = useState("");
  //Para el formato mensaje de éxito o error
  let [tipoMensaje, setTipoMensaje] = useState("");

  //Función para gestionar como se envían los datos
  let gestionarEnvio = async (e) => {
    e.preventDefault();

    setMensaje(""); //Hacer que desaparezca el mensaje de error de comprobaciones cuando usuario envíe los datos bien
    setTipoMensaje("");

    //Comprobar que los campos obligatorios estén rellenados
    if (
      nombre.trim() === "" ||
      fechaNacimiento === "" ||
      pesoNacimiento === ""
    ) {
      setMensaje("Debes rellenar todos los campos.");
      setTipoMensaje("error");
      return;
    }

    //Comprobar que el peso sea un número mayor que cero.
    if (Number(pesoNacimiento) <= 0 || Number(pesoNacimiento) > 10000) {
      setMensaje("El peso debe ser mayor que cero y no superar los 10 kg.");
      setTipoMensaje("error");
      return;
    }

    let bebe = {
      nombre: nombre,
      fecha_nacimiento: fechaNacimiento,
      peso_nacimiento: pesoNacimiento,
    };

    try {
      let response = await fetch("http://localhost:3000/api/bebes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bebe),
      });

      let responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "No se pudo registrar el bebé");
      }

      //Avisamos a App de que el bebé se ha registrado correctamente par aque actualice la lista en pantalla
      props.alRegistrar();

      //Mostrar mensaje de éxito
      setMensaje(`Se ha registrado a ${nombre} correctamente.`);
      setTipoMensaje("exito");

      //Limpiar campos del formulario al enviar los datos
      setNombre("");
      setFechaNacimiento("");
      setPesoNacimiento("");
    } catch (error) {
      console.error("Error al registrar el bebé:", error);
      setTipoMensaje("error");
    }
  };

  return (
    <section>
      <h2>Registrar un bebé</h2>

      {/**Si el mensaje de éxito no está vacío lo muestra, pero antes se comprueba por qué texto empieza el mensaje, si
       * lo hace por una de esas frases se va a clase error y si no a la clase éxito para luego mostrar el mensaje con formato adecuado
       */}
      {mensaje !== "" && (
        <p className={tipoMensaje == "error" ? "mensaje-error" : "mensaje-exito"}>
          {mensaje}
        </p>
      )}

      <form onSubmit={gestionarEnvio}>
        <label>
          Nombre:
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </label>

        <label>
          Fecha de nacimiento:
          <input
            type="date"
            value={fechaNacimiento}
            onChange={(e) => setFechaNacimiento(e.target.value)}
          />
        </label>

        <label>
          Peso al nacer (gramos):
          <input
            type="number"
            value={pesoNacimiento}
            onChange={(e) => {setPesoNacimiento(e.target.value);}}
            
          />
        </label>

        <button type="submit">Registrar bebé</button>
      </form>
    </section>
  );
}

export default FormularioBebe;
