
let {
    crearPeso,
    obtenerPesos: obtenerPesosModelo,
    obtenerPesosPorBebe: obtenerPesosPorBebeModelo,
    actualizarPeso: actualizarPesoModelo,
    eliminarPeso: eliminarPesoModelo
} = require("../modelos/pesos_modelo");

// Crear una medición de peso
let guardarPeso = async (req, res) => {
    try {
        let { bebe_id, peso, fecha, observaciones } = req.body;

        if (bebe_id === undefined || peso === undefined || !fecha) {
            return res.status(400).json({
                mensaje: "El bebé, el peso y la fecha son obligatorios"
            });
        }

        if (
            !Number.isInteger(Number(bebe_id)) ||
            Number(bebe_id) <= 0
        ) {
            return res.status(400).json({
                mensaje: "El ID del bebé debe ser un número entero positivo"
            });
        }

        if (
            peso === null ||
            peso === "" ||
            !Number.isFinite(Number(peso)) ||
            Number(peso) <= 0 ||
            Number(peso) >= 1000
        ) {
            return res.status(400).json({
                mensaje: "El peso debe ser un número mayor que 0 y menor que 1000 kg"
            });
        }

        let fechaValida =
            /^\d{4}-\d{2}-\d{2}$/.test(fecha) &&
            !Number.isNaN(Date.parse(`${fecha}T00:00:00Z`)) &&
            new Date(`${fecha}T00:00:00Z`).toISOString().slice(0, 10) === fecha;

        if (!fechaValida) {
            return res.status(400).json({
                mensaje: "La fecha debe ser válida y tener el formato AAAA-MM-DD"
            });
        }

        let nuevoPeso = {
            bebe_id: Number(bebe_id),
            peso: Number(peso),
            fecha,
            observaciones: observaciones ?? null
        };

        let [resultado] = await crearPeso(nuevoPeso);

        return res.status(201).json({
            mensaje: "Medición de peso creada correctamente",
            id: resultado.insertId
        });
    } catch (error) {
        console.error("Error al crear la medición de peso:", error);

        return res.status(500).json({
            mensaje: "Error interno al crear la medición"
        });
    }
};

// Obtener todas las mediciones
let obtenerPesos = async (req, res) => {
    try {
        let [pesos] = await obtenerPesosModelo();

        return res.status(200).json(pesos);
    } catch (error) {
        console.error("Error al obtener las mediciones:", error);

        return res.status(500).json({
            mensaje: "Error interno al obtener las mediciones"
        });
    }
};

// Obtener las mediciones de un bebé
let obtenerPesosPorBebe = async (req, res) => {
    try {
        let { bebeId } = req.params;

        if (!Number.isInteger(Number(bebeId)) || Number(bebeId) <= 0) {
            return res.status(400).json({
                mensaje: "El ID del bebé debe ser un número positivo"
            });
        }

        let [pesos] = await obtenerPesosPorBebeModelo(bebeId);

        return res.status(200).json(pesos);
    } catch (error) {
        console.error("Error al obtener las mediciones del bebé:", error);

        return res.status(500).json({
            mensaje: "Error interno al obtener las mediciones del bebé"
        });
    }
};

// Actualizar una medición
let actualizarPeso = async (req, res) => {
    try {
        let { id } = req.params;
        let peso = req.body ?? {};

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                mensaje: "El ID de la medición no es válido"
            });
        }

        if (
            typeof peso !== "object" ||
            Array.isArray(peso) ||
            Object.keys(peso).length === 0
        ) {
            return res.status(400).json({
                mensaje: "Debes indicar al menos un campo para actualizar"
            });
        }

        let camposPermitidos = [
            "bebe_id",
            "peso",
            "fecha",
            "observaciones"
        ];

        let camposRecibidos = Object.keys(peso);

        let campoNoPermitido = camposRecibidos.some(
            (campo) => !camposPermitidos.includes(campo)
        );

        if (campoNoPermitido) {
            return res.status(400).json({
                mensaje: "Has enviado algún campo no permitido"
            });
        }

        if (peso.bebe_id !== undefined) {
            if (
                !Number.isInteger(Number(peso.bebe_id)) ||
                Number(peso.bebe_id) <= 0
            ) {
                return res.status(400).json({
                    mensaje: "El ID del bebé debe ser un número entero positivo"
                });
            }

            peso.bebe_id = Number(peso.bebe_id);
        }

        if (peso.peso !== undefined) {
            if (
                peso.peso === null ||
                peso.peso === "" ||
                !Number.isFinite(Number(peso.peso)) ||
                Number(peso.peso) <= 0 ||
                Number(peso.peso) >= 1000
            ) {
                return res.status(400).json({
                    mensaje: "El peso debe ser un número mayor que 0 y menor que 1000 kg"
                });
            }

            peso.peso = Number(peso.peso);
        }

        if (peso.fecha !== undefined) {
            let fechaValida =
                typeof peso.fecha === "string" &&
                /^\d{4}-\d{2}-\d{2}$/.test(peso.fecha) &&
                !Number.isNaN(Date.parse(`${peso.fecha}T00:00:00Z`)) &&
                new Date(`${peso.fecha}T00:00:00Z`).toISOString().slice(0, 10) === peso.fecha;

            if (!fechaValida) {
                return res.status(400).json({
                    mensaje: "La fecha debe ser válida y tener el formato AAAA-MM-DD"
                });
            }
        }

        let [resultado] = await actualizarPesoModelo(id, peso);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: "No se encontró la medición de peso"
            });
        }

        return res.status(200).json({
            mensaje: "Medición de peso actualizada correctamente"
        });
    } catch (error) {
        console.error("Error al actualizar la medición:", error);

        return res.status(500).json({
            mensaje: "Error interno al actualizar la medición"
        });
    }
};

// Eliminar una medición
let eliminarPeso = async (req, res) => {
    try {
        let { id } = req.params;

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                mensaje: "El ID de la medición no es válido"
            });
        }

        let [resultado] = await eliminarPesoModelo(id);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: "No se encontró la medición de peso"
            });
        }

        return res.status(200).json({
            mensaje: "Medición de peso eliminada correctamente"
        });
    } catch (error) {
        console.error("Error al eliminar la medición:", error);

        return res.status(500).json({
            mensaje: "Error interno al eliminar la medición"
        });
    }
};

module.exports = {
    guardarPeso,
    obtenerPesos,
    obtenerPesosPorBebe,
    actualizarPeso,
    eliminarPeso
};
