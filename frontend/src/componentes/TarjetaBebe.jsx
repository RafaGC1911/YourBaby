function TarjetaBebe(props) {
  //Reorganizar la fecha para mostrarla con el formato dd/mm/yyy
  let fechaFormateada = "";
  if (props.fechaNacimiento) {
    let partesFecha = props.fechaNacimiento.split("-");
    fechaFormateada = `${partesFecha[2]}/${partesFecha[1]}/${partesFecha[0]}`;
  }

  return (
    <article>
      <h3>{props.nombre}</h3>
      <p>Fecha de nacimiento: {fechaFormateada}</p>
      <p>Peso al nacer: {props.pesoNacimiento} gramos</p>
    </article>
  );
}
export default TarjetaBebe;
