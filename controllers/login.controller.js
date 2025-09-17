const { userModelo } = require("../models/user.model");
const jwt = require('jsonwebtoken')

exports.login = async (req, res) => {
    try {
        let data = req.body;

        let user = await userModelo.findOne({ correo: data.correo })
        if (user) {
            if (data.password === user.password) {
                const token = jwt.sign(
                    {
                        id: user._id,
                        nombre: user.nombre,
                        apellido: user.apellido,
                        correo: user.correo,
                        role: user.role
                    },

                    process.env.SECRET_JWT_KEY,
                    { expiresIn: process.env.TOKEN_EXPIRE },
                );
                return res.status(200).json({ Welcome: `${user.nombre}`,role: user.role, token })

            } else {
                return res.status(401).json({ msj: 'CONTRASENA INCORRECTA' })
            };

        } else {
            return res.status(404).json({msj: 'USUARIO NO ENCONTRADO'})
        };
    } catch (error) {
        return res.status(500).json({ error: "Error interno del servidor", detalle: error.message });
    }
};
