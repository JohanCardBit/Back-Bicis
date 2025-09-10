const { default: mongoose } = require("mongoose");
const { userModelo } = require("../models/user.model");

exports.postUser = async (req, res) => {
    try {
        let primerUsuario = await userModelo.find();
        if (!primerUsuario.length) {
            req.body.role = "admin";
        } else {
            req.body.role = "user";
        }


        let existe = await userModelo.findOne({ correo: req.body.correo });
        if (existe) {
            return res.status(400).json({ msj: "EL CORREO YA ESTA REGISTRADO" });
        }

        let data = req.body;
        let nuevoUser = new userModelo(data);
        let userGuardado = await nuevoUser.save();

        res.status(201).json({ msj:  `${data.nombre}, TE HAZ REGISTRADO CORRECTAMENTE!` });

    } catch (error) {
        res.status(500).json({ msj: "ERROR AL CREAR USUARIO", detalle: error.message });
    }
};


exports.getUsers = async (req, res) => {
    try {
        const { role } = req.decode;

        if (role !== "admin") {
            return res.status(403).json({ msj: " NO AUTORIZADO" });
        }

        const data = await userModelo.find({}, "nombre apellido role foto correo");

        if (!data.length) {
            return res.status(404).json({ msj: "NO SE ENCONTRARON USUARIOS" });
        }

        res.status(200).json(data);

    } catch (error) {
        res.status(500).json({ msj: "ERROR AL CARGAR USUARIOS", detalle: error.message });
    }
};

exports.getOneUser = async (req, res) => {
    try {
        let userID = req.decode.id
        // let userName = req.decode.nombre

        if (!mongoose.Types.ObjectId.isValid(userID)) {
            return res.status(404).json({ msj: 'ID DE USUARIO INVALIDO' })
        };

        let dataID = await userModelo.findById(userID, "-password")
        if (dataID) {
            return res.status(200).json({ msj: 'USUARIO ENCONTRADO', dataID })
        } else {
            return res.status(500).json({ msj: 'USUARIO NO ENCONTRADO', dataID })
        };

    } catch (error) {
        return res.status(500).json({ msj: ' ERROR AL OBTENER DATOS', detalle: error.message })
    }
};


exports.putUser = async (req, res) => {
    try {
        let datos = req.body;
        let userID = req.decode.id;

        if (!mongoose.Types.ObjectId.isValid(userID)) {
            return res.status(404).json({ msj: 'ID DE USUARIO INVALIDO' });
        }

        let userActualizado = await userModelo.findByIdAndUpdate(
            userID,
            { $set: datos },
            { new: true, runValidators: true, select: "nombre apellido correo foto role" }
        );

        if (!userActualizado) {
            return res.status(404).json({ msj: 'USUARIO NO ENCONTRADO' });
        }

        return res.status(200).json({
            msj: 'USUARIO ACTUALIZADO CORRECTAMENTE', userActualizado
        });

    } catch (error) {
        return res.status(500).json({ msj: 'ERROR EN EL SERVIDOR', detalle: error.message });
    }
};


exports.deleteUser = async (req, res) => {
    try {
        let userID = req.params.id;
        let dueno = req.decode.id;
        let role = req.decode.role;

        if (!mongoose.Types.ObjectId.isValid(userID)) {
            return res.status(404).json({ msj: 'ID DE USUARIO INVALIDO' });
        }

        if (role !== "admin" && userID !== dueno) {
            return res.status(403).json({ msj: "NO AUTORIZADO" });
        }

        let dataEliminado = await userModelo.findByIdAndDelete(userID);
        if (!dataEliminado) {
            return res.status(404).json({ msj: 'USUARIO NO ENCONTRADO' });
        }

        return res.status(200).json({ msj: 'USUARIO ELIMINADO CORRECTAMENTE', dataEliminado });

    } catch (error) {
        return res.status(500).json({ msj: "ERROR EN EL SERVIDOR", detalle: error.message });
    }
};
