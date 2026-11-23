import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function GraficaPeso(props) {
  //Ordeno las mediciones desde la más antigua hasta la más reciente para que la evolución se represente correctamente de izquierda a derecha.
  let datosOrdenados = [...props.pesos].sort((a, b) => {
    return new Date(a.fecha) - new Date(b.fecha) || a.id - b.id;
  });

  //Preparo los datos con el formato que necesita Recharts para dibujar la gráfica.
  let datosGrafica = datosOrdenados.map((peso) => {
    return {
      fecha: peso.fecha.split("T")[0].split("-").reverse().join("/"),
      peso: Number(peso.peso),
    };
  });

  //Muestro un mensaje cuando todavía no existen mediciones suficientes para representar la evolución.
  if (datosGrafica.length < 2) {
    return (
      <div className="contenedor-grafica-peso">
        <h3>Evolución del peso</h3>
        <p>
          Necesitas registrar al menos dos mediciones para mostrar la gráfica.
        </p>
      </div>
    );
  }

  return (
    <div className="contenedor-grafica-peso">
      <h3>Evolución del peso</h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={datosGrafica}
          margin={{ top: 15, right: 20, left: 0, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="fecha" tick={{ fill: "#493D32", fontSize: 12 }} />

          <YAxis
            domain={["auto", "auto"]}
            tick={{ fill: "#493D32", fontSize: 12 }}
            tickFormatter={(valor) => `${valor.toFixed(1)} kg`}
          />

          <Tooltip
            formatter={(valor) => [`${Number(valor).toFixed(3)} kg`, "Peso"]}
            labelFormatter={(fecha) => `Fecha: ${fecha}`}
          />

          <Line
            type="monotone"
            dataKey="peso"
            stroke="#8B735D"
            strokeWidth={3}
            dot={{ r: 5, fill: "#8B735D" }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default GraficaPeso;
