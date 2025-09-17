

const { default: mongoose } = require("mongoose");
const { modeloEstaciones } = require("../models/estaciones.model");
const { alquilerModelo } = require("../models/alquiler.model");
const { modeloBicicletas } = require("../models/bicicletas.model");


exports.postAlquilar = async (req, res) => {
    try {
        let { estacionSalida, serial } = req.body;
        let userID = req.decode.id;
        let nombre = req.decode.nombre;

        if (!mongoose.Types.ObjectId.isValid(userID) || !mongoose.Types.ObjectId.isValid(estacionSalida)) {
            return res.status(400).json({ msj: "ID DE USUARIO O ESTACION INVALIDO" });
        }

        let estacion = await modeloEstaciones.findById(estacionSalida);
        if (!estacion) {
            return res.status(404).json({ msj: "ESTACION NO ENCONTRADA" });
        }

        let alquilerActivo = await alquilerModelo.findOne({ usuario: userID, activo: true });
        if (alquilerActivo) {
            return res.status(400).json({ msj: "YA TIENES UNA BICI ALQUILADA" });
        }

        let bicicleta = await modeloBicicletas.findOne({ estacion: estacionSalida, serial });
        if (!bicicleta) {
            return res.status(404).json({ msj: "BICICLETA NO ENCONTRADA EN ESTA ESTACION" });
        }

        if (bicicleta.estado === "mantenimiento") {
            return res.status(400).json({ msj: "LA BICICLETA ESTA EN MANTENIMIENTO" });
        }
        if (bicicleta.estado === "en uso") {
            return res.status(400).json({ msj: "LA BICICLETA YA ESTA EN USO" });
        }
        if (bicicleta.estado !== "disponible") {
            return res.status(400).json({ msj: `ESTADO NO VALIDO: ${bicicleta.estado}` });
        }


        let nuevoAlquiler = new alquilerModelo({
            usuario: userID,
            nombre,
            bicicleta: bicicleta._id,
            serial: bicicleta.serial,
            estacionSalida,
            fechaInicio: new Date(),
            activo: true
        });
        await nuevoAlquiler.save();


        bicicleta.estado = "en uso";
        await bicicleta.save();


        await modeloEstaciones.findByIdAndUpdate(estacionSalida, {
            $inc: { bicicletasDisponibles: -1 },
            $pull: { bicicletas: bicicleta._id }
        });

        return res.status(201).json({ msj: "ALQUILER REGISTRADO CORRECTAMENTE", nuevoAlquiler });

    } catch (error) {
        return res.status(500).json({ msj: "ERROR AL ALQUILAR", detalle: error.message });
    }
};



exports.postDevolver = async (req, res) => {
    try {
        let { estacionLlegada } = req.body;
        let userID = req.decode.id;

        if (!mongoose.Types.ObjectId.isValid(userID) || !mongoose.Types.ObjectId.isValid(estacionLlegada)) {
            return res.status(400).json({ msj: "ID DE USUARIO O ESTACION INVALIDO" });
        }

        let alquilerActivo = await alquilerModelo.findOne({ usuario: userID, activo: true });
        if (!alquilerActivo) {
            return res.status(400).json({ msj: "NO TIENES UN ALQUILER ACTIVO" });
        }

        let estacion = await modeloEstaciones.findById(estacionLlegada);
        if (!estacion) {
            return res.status(404).json({ msj: "ESTACION NO ENCONTRADA" });
        }

        let bicicleta = await modeloBicicletas.findById(alquilerActivo.bicicleta);
        if (!bicicleta) {
            return res.status(404).json({ msj: "BICICLETA NO ENCONTRADA" });
        }

        if (estacion.bicicletasDisponibles >= estacion.capacidad) {
            return res.status(400).json({ msj: "ESTACION LLENA, NO SE PUEDE DEVOLVER A ESTA ESTACION" });
        }


        alquilerActivo.estacionLlegada = estacionLlegada;
        alquilerActivo.fechaFin = new Date();
        alquilerActivo.activo = false;
        await alquilerActivo.save();


        bicicleta.estado = "disponible";
        bicicleta.estacion = estacionLlegada;
        await bicicleta.save();


        await modeloEstaciones.findByIdAndUpdate(estacionLlegada, {
            $inc: { bicicletasDisponibles: 1 },
            $push: { bicicletas: bicicleta._id }
        });


        let alquilerFinalizado = await alquilerModelo.findById(alquilerActivo._id)
            .populate("usuario", "nombre apellido")
            .populate("bicicleta", "serial")
            .populate("estacionSalida", "nombre")
            .populate("estacionLlegada", "nombre");


        let duracionAlquiler = new Date(alquilerFinalizado.fechaFin) - new Date(alquilerFinalizado.fechaInicio);

        let horas = Math.floor(duracionAlquiler / (1000 * 60 * 60));
        let minutos = Math.floor((duracionAlquiler % (1000 * 60 * 60)) / (1000 * 60));
        let segundos = Math.floor((duracionAlquiler % (1000 * 60)) / 1000);

        return res.status(200).json({
            msj: "ALQUILER FINALIZADO CORRECTAMENTE",
            alquiler: alquilerFinalizado,
            duracion: {
                horas,
                minutos,
                segundos,
                totalMs: duracionAlquiler
            }
        });

    } catch (error) {
        return res.status(500).json({ msj: "ERROR AL FINALIZAR ALQUILER", detalle: error.message });
    }
};



exports.getAlquileresActivos = async (req, res) => {
    try {
        let role = req.decode.role;
        if (role !== "admin") {
            return res.status(403).json({ msj: 'NO TIENES PERMISOS' })
        }

        let alquilerActivos = await alquilerModelo.find({ activo: true })
            .populate("usuario", "nombre apellido")
            .populate("bicicleta", "serial estado")
            .populate("estacionSalida", "nombre ubicacion")

        if (!alquilerActivos.length) {
            return res.status(404).json({ msj: 'NO HAY ALQUILERES ACTIVOS' })
        };

        return res.status(200).json(alquilerActivos)
    } catch (error) {
        return res.status(500).json({ msj: "ERROR AL CARGAR ALQUILERES ACTIVOS", detalle: error.message });

    }
}


exports.getHistorialAlquileresUser = async (req, res) => {
    try {
        let userID = req.decode.id;

        let historial = await alquilerModelo.find({ usuario: userID })
            .populate("bicicleta", "serial estado")
            .populate('estacionSalida', "nombre ubicacion")
            .populate("estacionLlegada", "nombre ubicacion")
            .sort({ fechaInicio: -1 });

        if (!historial.length) {
            return res.status(404).json({ msj: 'NO TIENES HISTORIAL DE ALQUILERES' })
        }

        return res.status(200).json(historial);
    } catch (error) {
        return res.status(500).json({ msj: "ERROR AL CONSULTAR ALQUILERES", detalle: error.message });
    }
}

exports.getAlquilerActivoUser = async (req, res) => {
    try {
        let userID = req.decode.id;

        let alquilerActivo = await alquilerModelo.findOne({ usuario: userID, activo: true })
            .populate("bicicleta", "serial estado")
            .populate("estacionSalida", "nombre ubicacion");

        if (!alquilerActivo) {
            return res.status(200).json({ alquiler: null, msj: "NO TIENES UN ALQUILER ACTIVO" });
        }

        return res.status(200).json({ alquiler: alquilerActivo, msj: "ALQUILER ACTIVO ENCONTRADO" });
    } catch (error) {
        return res.status(500).json({ msj: "ERROR AL CONSULTAR ALQUILER ACTIVO", detalle: error.message });
    }
};

// exports.getHistorialAlquileres = async (req, res) => {
//     try {
//         let { role } = req.decode;
//         if (role !== "admin") {
//             return res.status(403).json({ msj: "NO TIENES PERMISOS" });
//         }

//         let { correo, estacion } = req.query; 
//         let filtro = {};


//         if (correo) {
//             let usuario = await mongoose.model("User").findOne({ correo });
//             if (usuario) {
//                 filtro.usuario = usuario._id;
//             } else {
//                 return res.status(404).json({ msj: "NO SE ENCONTRO USUARIO CON ESE CORREO" });
//             }
//         }


//         if (estacion) {
//             let estacionData = await modeloEstaciones.findOne({ nombre: estacion });
//             if (estacionData) {
//                 filtro.$or = [
//                     { estacionSalida: estacionData._id },
//                     { estacionLlegada: estacionData._id }
//                 ];
//             } else {
//                 return res.status(404).json({ msj: "NO SE ENCONTRO ESTACION CON ESE NOMBRE" });
//             }
//         }

//         let historial = await alquilerModelo.find(filtro)
//             .populate("usuario", "nombre apellido correo")
//             .populate("bicicleta", "serial estado")
//             .populate("estacionSalida", "nombre")
//             .populate("estacionLlegada", "nombre")
//             .sort({ fechaInicio: -1 });

//         if (!historial.length) {
//             return res.status(404).json({ msj: "NO SE ENCONTRARON ALQUILERES" });
//         }

//         return res.status(200).json({ msj: "HISTORIAL DE ALQUILERES", historial });

//     } catch (error) {
//         return res.status(500).json({ msj: "ERROR AL CONSULTAR HISTORIAL", detalle: error.message });
//     }
// };






