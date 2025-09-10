const jwt = require('jsonwebtoken');

exports.middlewareJWT = (req, res, next) => {
    try {
        let token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ error: "TOKEN NO SUMINISTRADO " });
        }

        token = token.split(" ")[1];

        jwt.verify(token, process.env.SECRET_JWT_KEY, (error, decode) => {
            if (error) {
                return res.status(401).json({
                    error: "ERROR DE AUTENTICACION ",
                    detalle: error.message 
                });
            }

            req.decode = decode;
            next();
        });

    } catch (error) {
        res.status(500).json({ error: "Error en middleware JWT", detalle: error.message });
    }
};
