

const { default: mongoose } = require("mongoose");
const { modeloEstaciones } = require("../models/estaciones.model");

exports.postEstacion = async (req, res) => {
    try {
        let admin = req.decode.role;
        if (admin !== "admin") {
            return res.status(403).json({ msj: "NO TIENES PERMISOS" });
        }

        let datos = req.body;
        let nuevaEstacion = new modeloEstaciones(datos);
        let estacionGuardada = await nuevaEstacion.save();
        return res.status(200).json({ msj: "ESTACION CREADA CORRECTAMENTE", estacionGuardada });

    } catch (error) {
        return res.status(500).json({ msj: "ERROR AL CREAR ESTACION", detalle: error.message });
    }
};

exports.getEstaciones = async (req, res) => {
    try {
        let data = await modeloEstaciones.find();
        if (!data.length) {
            return res.status(404).json({ msj: "NO SE ENCONTRARON ESTACIONES" });
        }

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ msj: "ERROR AL CARGAR ESTACIONES", detalle: error.message });
    }
};

exports.getOneEstacion = async (req, res) => {
    try {
        let id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ msj: "ID INVALIDO" });
        }

        let data = await modeloEstaciones.findById(id);
        if (!data) {
            return res.status(404).json({ msj: "NO SE ENCONTRO LA ESTACION" });
        }
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ msj: "ERROR AL CARGAR ESTACION", detalle: error.message });
    }
};

exports.putEstacion = async (req, res) => {
    try {
        let id = req.params.id;
        let admin = req.decode.role;
        if (admin !== "admin") {
            return res.status(403).json({ msj: "NO TIENES PERMISOS" });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ msj: "ID INVALIDO" });
        }

        let data = await modeloEstaciones.findById(id);
        if (!data) {
            return res.status(404).json({ msj: "NO SE ENCONTRO LA ESTACION" });
        }

        let datos = req.body;
        let estacionActualizada = await modeloEstaciones.findByIdAndUpdate(id, datos, { new: true });
        return res.status(200).json({ msj: "ESTACION ACTUALIZADA CORRECTAMENTE", estacionActualizada });

    } catch (error) {
        return res.status(500).json({ msj: "ERROR AL ACTUALIZAR ESTACION", detalle: error.message });
    }
};

exports.deleteEstacion = async (req, res) => {
    try {
        let id = req.params.id;
        let admin = req.decode.role;
        if (admin !== "admin") {
            return res.status(403).json({ msj: "NO TIENES PERMISOS" });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ msj: "ID INVALIDO" });
        }

        let data = await modeloEstaciones.findById(id);
        if (!data) {
            return res.status(404).json({ msj: "NO SE ENCONTRO LA ESTACION " });
        }

        if (data.bicicletas.length > 0 || data.bicicletasDisponibles > 0) {
            return res.status(400).json({ msj: `NO SE PUEDE ELIMINAR: LA ESTACION TIENE ${data.bicicletas.length} BICIS` });
        }
        let estacionEliminada = await modeloEstaciones.findByIdAndDelete(id);

        return res.status(200).json({ msj: "ESTACION ELIMINADA CORRECTAMENTE", estacionEliminada });
    } catch (error) {
        return res
            .status(500)
            .json({ msj: "ERROR AL ELIMINAR ESTACION", detalle: error.message });
    }
};

exports.putEstado = async (req, res) => {
    try {
        let id = req.params.id;
        let admin = req.decode.role;

        if (admin !== "admin") {
            return res.status(403).json({ msj: "NO TIENES PERMISOS" });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ msj: "ID INVALIDO" });
        }

        let estacion = await modeloEstaciones.findById(id);
        if (!estacion) {
            return res.status(404).json({ msj: "ESTACION NO ENCONTRADA" });
        }

        const updated = await modeloEstaciones.findByIdAndUpdate(
            id,
            { activo: !estacion.activo },
            { new: true }
        );

        return res.status(200).json({
            msj: `ESTACION ${updated.activo ? "ACTIVADA" : "DESACTIVADA"} CORRECTAMENTE`,
            estacion: updated,
        });
    } catch (error) {
        return res.status(500).json({
            msj: "ERROR AL CAMBIAR ESTADO DE LA ESTACION",
            detalle: error.message,
        });
    }
};

