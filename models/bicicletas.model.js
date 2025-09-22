
const { default: mongoose } = require("mongoose");


const esquemaBicicletas = mongoose.Schema({
    serial: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },

    estado: {
        type: String,
        enum: ['disponible', 'en uso', 'en mantenimiento'],
        default: 'disponible',
    },

    estacion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'estacione',
        required: true
    },
}, {
    timestamps: true
});

exports.modeloBicicletas = mongoose.model('bicicleta', esquemaBicicletas);


/*
"serial": "bicione1",
"estado": 'disponible',
"estacion": id de estacion o nombre
*/ 
