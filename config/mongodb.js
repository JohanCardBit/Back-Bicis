const mongoose = require('mongoose');

const connetDB = async () => {
    const URL = process.env.DB_URL
    try {
        await mongoose.connect(URL)
        console.log("CONECTADO A LA BASE DE DATOS ");
    } catch (error) {
        console.log("NO SE CONECTO A LA BASE DATOS ");
    }
}

module.exports = connetDB;