const express = require('express');
const user = require('../controllers/users.controller');
const { login } = require('../controllers/login.controller');
const { middlewareJWT } = require('../middlewares/jwt');
const estacion = require('../controllers/estaciones.controller');
const alquiler = require('../controllers/alquiler.controller');
const bicicletas = require('../controllers/bicicletas.controller');
const ruta = express.Router();



// LOGIN - REGISTER
ruta.post('/register', user.postUser);                                                                          //OKk            
ruta.post('/login', login);                                                                                     //OKK    


// USUARIOS
ruta.get('/users', middlewareJWT, user.getUsers)                                                                //OKK                    
ruta.get('/user/:id', middlewareJWT, user.getOneUser)                                                           //OKK  REVISAR                          
ruta.put('/user/update/:id', middlewareJWT, user.putUser)                                                       //OKK                                


//ESTACIONES 
ruta.post('/estacion/create', middlewareJWT, estacion.postEstacion)                                             //OKK
ruta.get('/estaciones', middlewareJWT, estacion.getEstaciones)                                                  //OKK    
ruta.get('/estacion/:id', middlewareJWT, estacion.getOneEstacion)                                               //OKk
ruta.put('/estacion/update/:id', middlewareJWT, estacion.putEstacion)                                           //OKk
ruta.delete('/estacion/delete/:id', middlewareJWT, estacion.deleteEstacion)                                     //OKk
ruta.put('/estacion/estado/:id', middlewareJWT, estacion.putEstado);


//AQUILERES
ruta.post('/alquilar/create', middlewareJWT, alquiler.postAlquilar)                                             
ruta.post('/alquiler/devolver', middlewareJWT, alquiler.postDevolver)
ruta.get('/alquiler/activos', middlewareJWT, alquiler.getAlquileresActivos);
ruta.get('/alquiler/historial/user', middlewareJWT, alquiler.getHistorialAlquileresUser);
ruta.get('/alquiler/activo/user', middlewareJWT, alquiler.getAlquilerActivoUser);



// BICICLETAS
ruta.post('/bicicleta/create', middlewareJWT, bicicletas.postBicicleta)                                         //OKK
ruta.get('/bicicletas', middlewareJWT, bicicletas.getBicicletas)                                                //OKK
ruta.get('/bicicleta/estacion/:estacion', middlewareJWT, bicicletas.getBicicletasPorEstacion)                   //id o nombre
ruta.get('/bicicleta/one/:id', middlewareJWT, bicicletas.getOneBicicleta)                                       //id o serial
ruta.put('/bicicleta/update/:id', middlewareJWT, bicicletas.putBicicleta)                                       //solo admin
ruta.delete('/bicicleta/delete/:id', middlewareJWT, bicicletas.deleteBicicleta)                                 //admin no debe estar en uso

module.exports = ruta;


