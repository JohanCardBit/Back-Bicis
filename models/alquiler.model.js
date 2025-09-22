

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

    estacionLlegada: {
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

    duracionMs: {
        type: Number,
        default: 0
    },

    duracionTexto: {
        type: String,
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