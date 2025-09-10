
const { default: mongoose } = require("mongoose");


const esquemaEstaciones = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    direccion: {
        type: String
    },

    latitud: {
        type: Number,
        required: true,
        min: -90,
        max: 90
    },

    longitud: {
        type: Number,
        required: true,
        min: -180,
        max: 180
    },

    capacidad: {
        type: Number,
        default: 5
    },

    bicicletasDisponibles: {
        type: Number,
        required: true,
        default: 0,
    },

    bicicletas: [
        {
            biciId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "bicicleta"
            },
            serial: String
        }
    ],

    foto: {
        type: String
    },

    activo:{
        type: Boolean,
        default: true
    }


}, {
    timestamps: true
});


exports.modeloEstaciones = mongoose.model('estacione', esquemaEstaciones);

// {
//   "nombre": "Estacion BIT",
//   "ubicacion": "Estacion BIT",
//   "latitud": -74.08175,
//   "longitud": 4.60971,
//   "capacidad": 5
// }