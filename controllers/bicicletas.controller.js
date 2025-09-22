
const { default: mongoose } = require("mongoose");
const { modeloBicicletas } = require("../models/bicicletas.model");
const { modeloEstaciones } = require("../models/estaciones.model");



exports.postBicicleta = async (req, res) => {
    try {
        let role = req.decode.role;
        if (role !== "admin") {
            return res.status(403).json({ msj: "NO TIENES PERMISOS" });
        }

        let { serial, estacion } = req.body;
        if (!serial || !estacion) {
            return res.status(400).json({ msj: "FALTAN DATOS (SERIAL Y ESTACION)" });
        }


        const existe = await modeloBicicletas.findOne({ serial });
        if (existe) {
            return res.status(400).json({ msj: `YA EXISTE UNA BICICLETA CON EL SERIAL: ${serial}` });
        }

        let dataEstacion;

        if (mongoose.Types.ObjectId.isValid(estacion)) {
            dataEstacion = await modeloEstaciones.findById(estacion);
        }

        if (!dataEstacion) {
            dataEstacion = await modeloEstaciones.findOne({ nombre: estacion });
        }

        if (!dataEstacion) {
            return res.status(404).json({ msj: "ESTACION NO ENCONTRADA" });
        }

        if (dataEstacion.bicicletasDisponibles >= dataEstacion.capacidad) {
            return res.status(400).json({ msj: `ESTACION LLENA (${dataEstacion.capacidad})` });
        }


        let nuevaBici = new modeloBicicletas({
            serial,
            estado: "disponible",
            estacion: dataEstacion._id
        });

        await nuevaBici.save();


        await modeloEstaciones.findByIdAndUpdate(
            dataEstacion._id,
            {
                $inc: { bicicletasDisponibles: 1 },
                $push: { bicicletas: nuevaBici._id }
            }
        );

        return res.status(201).json({ msj: "BICICLETA CREADA", nuevaBici });

    } catch (error) {
        return res.status(500).json({ msj: "ERROR AL REGISTRAR LA BICI", detalle: error.message });
    }
};


exports.getBicicletas = async (req, res) => {
    try {
        let bicicletas = await modeloBicicletas.find()
            .populate("estacion", "nombre capacidad");

        if (!bicicletas.length) {
            return res.status(404).json({ msj: "NO SE ENCONTRARON BICICLETAS" });
        }

        return res.status(200).json(bicicletas);
    } catch (error) {
        return res.status(500).json({ msj: "ERROR AL CONSULTAR BICICLETAS", detalle: error.message, });
    }
};


exports.getBicicletasPorEstacion = async (req, res) => {
    try {
        let { estacion } = req.params;

        let dataEstacion;

        if (mongoose.Types.ObjectId.isValid(estacion)) {
            dataEstacion = await modeloEstaciones.findById(estacion);
        }

        if (!dataEstacion) {
            dataEstacion = await modeloEstaciones.findOne({ nombre: estacion });
        }

        if (!dataEstacion) {
            return res.status(404).json({ msj: "ESTACIÓN NO ENCONTRADA" });
        }

        let bicicletas = await modeloBicicletas
            .find({ estacion: dataEstacion._id })
            .populate("estacion", "nombre capacidad");

        if (!bicicletas.length) {
            return res.status(404).json({ msj: `NO HAY BICICLETAS EN LA ESTACIÓN: ${dataEstacion.nombre}`, });
        }

        return res.status(200).json(bicicletas);
    } catch (error) {
        return res.status(500).json({ msj: "ERROR AL CONSULTAR BICICLETAS POR ESTACIÓN", detalle: error.message, });
    }
};



exports.getOneBicicleta = async (req, res) => {
    try {
        let { id } = req.params;
        let bici;

        if (mongoose.Types.ObjectId.isValid(id)) {
            bici = await modeloBicicletas.findById(id).populate("estacion", "nombre");

        } else {
            bici = await modeloBicicletas.findOne({ serial: id }).populate("estacion", "nombre");
        };

        if (!bici) {
            return res.status(404).json({ msj: "NO SE ENCONTRO LA BICICLETA" });
        }

        return res.status(200).json(bici);
    } catch (error) {
        return res.status(500).json({ msj: "ERROR AL CONSULTAR BICI", detalle: error.message, });
    }
};



exports.putBicicleta = async (req, res) => {
    try {
        let { id } = req.params;
        let role = req.decode.role;
        if (role !== "admin") return res.status(403).json({ msj: "NO TIENES PERMISOS" });

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ msj: "ID INVALIDO" });
        }

        let datos = req.body;
        let bici = await modeloBicicletas.findByIdAndUpdate(id, datos, { new: true });

        if (!bici) {
            return res.status(404).json({ msj: "NO SE ENCONTRO LA BICI" });
        }

        return res.status(200).json({ msj: "BICICLETA ACTUALIZADA", bici });
    } catch (error) {
        return res.status(500).json({ msj: "ERROR AL ACTUALIZAR BICI", detalle: error.message });
    }
};


exports.deleteBicicleta = async (req, res) => {
    try {
        let { id } = req.params;
        let role = req.decode.role;
        if (role !== "admin") return res.status(403).json({ msj: "NO TIENES PERMISOS" });

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ msj: "ID INVALIDO" });
        }

        let bici = await modeloBicicletas.findById(id);
        if (!bici) return res.status(404).json({ msj: "NO SE ENCONTRO LA BICI" });

        if (bici.estado === "en uso") {
            return res.status(400).json({ msj: "NO SE PUEDE ELIMINAR UNA BICI EN USO" });
        }

        await modeloEstaciones.findByIdAndUpdate(bici.estacion, {
            $inc: { bicicletasDisponibles: -1 },
            $pull: { bicicletas: bici._id }
        });

        await modeloBicicletas.findByIdAndDelete(id);

        return res.status(200).json({ msj: "BICICLETA ELIMINADA" });
    } catch (error) {
        return res.status(500).json({ msj: "ERROR AL ELIMINAR BICI", detalle: error.message });
    }
};


