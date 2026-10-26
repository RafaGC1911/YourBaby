function TarjetaBebe(props) {
  //Reorganizar la fecha para mostrarla con el formato dd/mm/yyy
  let fechaFormateada = "";
  let edadTexto = "";
  if (props.fechaNacimiento) {
    let partesFecha = props.fechaNacimiento.split("-");
    fechaFormateada = `${partesFecha[2]}/${partesFecha[1]}/${partesFecha[0]}`;

    //Calcular la edad del bebé para que muestre cuántos días o meses tiene desde su nacimiento el bebé.
    let fechaNacimiento = new Date(props.fechaNacimiento + "T00:00:00");
    let fechaActual = new Date(); //Obtiene fecha de hoy

    let diferenciaTiempo = fechaActual - fechaNacimiento; //Obtiene diferencia en milisegundos
    let edadDias = Math.floor(diferenciaTiempo / (1000 * 60 * 60 * 24)); //Convierte esa diferencia en días

    if (edadDias < 30) {
      edadTexto = edadDias + (edadDias === 1 ? " día" : " días");
    } else {
      //A partir de 30 días se muestra la edad en meses aprox. No tiene en cuenta meses naturales exactos
      let edadMeses = Math.floor(edadDias / 30);
      edadTexto = edadMeses + (edadMeses === 1 ? " mes" : " meses");
    }
  } else {
    edadTexto = "Fecha no disponible";
  }

  return (
    <article>
      <h3>{props.nombre}</h3>
      <p>Fecha de nacimiento: {fechaFormateada}</p>
      <p>Edad: {edadTexto}</p>
      <p>Peso al nacer: {props.pesoNacimiento} gramos</p>
    </article>
  );
}
export default TarjetaBebe;
