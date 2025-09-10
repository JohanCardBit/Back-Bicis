// Alquiler de Bicicletas por Estaciones
// 🎯 Objetivo General:
// Crear una aplicación que permita gestionar el alquiler de bicicletas en diferentes estaciones de una ciudad.
// BackEnd
// Entidades:
// Estacion: nombre, ubicación (latitud y longitud), capacidad, bicicletasDisponibles
// Bicicleta: serial, estado (disponible, en uso, en mantenimiento)
// Alquiler: usuario, bicicleta, estacionSalida, fechaInicio, fechaFin (opcional), activo (boolean)
// user: nombre, apellido, correo, password, foto
// Requerimientos:
// API REST con rutas para:
// GET /estaciones – Listar estaciones con disponibilidad
// GET /estaciones/:id – Detalle de estación
// GET /bicicletas – Listar bicicletas por estado
// POST /alquilar – Registrar alquiler de bicicleta (asignar a usuario y estación)
// POST /devolver – Finalizar alquiler
// Restricciones:
// No permitir alquilar si no hay bicicletas disponibles
// No permitir alquilar bicicletas en mantenimiento
// Relaciones:
// Una estación tiene muchas bicicletas
// Un alquiler tiene una bicicleta y una estación

const { default: mongoose } = require("mongoose");


const esquemaAlquiler = mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'usuario',
        required: true
    },

    bicicleta: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'bicicleta',
        required: true,
    },

    estacionSalida: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'estacione',
        required: true
    },

    estacionLlegada:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'estacione',
        default: null,
    },

    fechaInicio: {
        type: Date,
        default: Date.now
    },

    fechaFin: {
        type: Date,
        default: null
    },

    activo: {
        type: Boolean,
        default: true
    }

}, {
    timestamps: true
});


exports.alquilerModelo = mongoose.model('Alquiler', esquemaAlquiler);