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


const esquemaUsuarios = mongoose.Schema({

    nombre: {
        type: String,
        required: true,
        minLength: [3, "El nombre debe tener minimo 3 letras"],
        maxLength: [30, "El nombre no puede tener mas de 30 letras"],
        match: [/^[a-zA-ZáéíóúüÁÉÍÓÚÜ\s]+$/, "El nombre solo puede contener letras"]
    },

    apellido: {
        type: String,
        required: true,
        minLength: [3, "El apellido debe tener minimo 3 letras"],
        maxLength: [30, "El apellido no puede tener mas de 30 letras"],
        match: [/^[a-zA-ZáéíóúüÁÉÍÓÚÜ\s]+$/, "El apellido solo puede contener letras"]
    },

    correo: {
        type: String,
        required: true,
        unique: true,
        minLength: [5, "El correo debe tener minimo 5 caracteres"],
        maxLength: [50, "El correo no puede tener mas de 50 caracteres"],
        lowercase: true, set: v => v.replace(/\s+/g, ''),                                                                              //quitar espacios
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Debes ingresar un correo válido"]
    },

    password: {
        type: String,
        required: true,
        minlength: [4, "La contraseña debe tener mnimo 4 caracteres"],
        maxlength: [20, "La contraseña debe tener maximo 20 caracteres"],
        match: [/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/, "Debe contener mayúscula, minúscula, número y símbolo"],
    },

    foto:{
        type: String,
        default: 'https://www.teleadhesivo.com/es/img/asfs771-jpg/folder/products-listado-merchant/pegatinas-coches-motos-homer-bebiendo-cerveza.jpg',
    },

    role:{
        type: String,
        enum:['user', 'admin'],
        default: 'user',
    },

    
}, {
    timestamps: true
});


exports.userModelo = mongoose.model('usuario', esquemaUsuarios);


/*
{
"nombre": "Johan",
"apellido": "Cardenas",
"correo": "johan@gmail.com",
"password": "Johan123*",
"foto": 'https://www.teleadhesivo.com/es/img/asfs771-jpg/folder/products-listado-merchant/pegatinas-coches-motos-homer-bebiendo-cerveza.jpg',
"role": "admin"
}
*/