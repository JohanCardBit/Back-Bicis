


// http://localhost:3001   ----> END POINT BASE
const express = require('express');
const app = express();
app.use(express.json());
require('dotenv').config();
const PUERTO = process.env.PORT || 3001;

const cors = require('cors');
const connetDB = require('./config/mongodb');
connetDB();


app.use(cors());

const ruta = require('./routes/router');
app.use('/api', ruta);

app.get('/corazon', (req, res) => {
    res.json({
        status: "ok",
        message: "El servidor funciona correctamente",
        fechaActual: new Date().toLocaleString()
    });
});

app.listen(PUERTO, () => {
    console.log(` SERVIDOR CORRIENDO EN EL PUERTO ${PUERTO}`);
});





