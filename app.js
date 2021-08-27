const debug = require('debug')('app:inicio')
const express = require('express');
const config = require('config');
const morgan = require('morgan');
const Joi = require('@hapi/joi');
const app = express();

app.use(express.json());
app.use(express.urlencoded({extented:true}))
app.use(express.static('public'));

//Configuracion de entornos
console.log('Aplicacion: ' +config.get('nombre'));
console.log('BD server: '+ config.get('configDB.host'));

//Uso de middleware de tercero
if(app.get('env')=== 'development') {
    app.use(morgan('tiny'));
    debug('Morgan Habilitado')
}

const usuarios = [
    {id:1, nombre:"Alina"},
    {id:2, nombre:"Samil"},
    {id:3, nombre:"Misael"},
    {id:4, nombre:"Gabriel"}
]

//peticion
app.get('/', (req, res)=>{
    res.send('Hola Mundo desde Express.');
});

app.get('/api/usuarios', (req, res)=>{
    res.send(usuarios);
})

app.get('/api/usuarios/:id', (req, res)=>{
    let usuario = existeUsuario(req.params.id)
    if(!usuario) res.status(404).send('El usuario no fue encontrado');
    res.send(usuario)
});

app.post('/api/usuarios', (req, res) => {

    const {error, value} = validarUsuario(req.body.nombre);
    if(!error){
        const usuario = {
            id: usuarios.length + 1,
            nombre: value.nombre
        };
        usuarios.push(usuario);
        res.send(usuario);
    }else{
        const mensaje = error.details[0].message
        res.status(400).send(mensaje)
    }
})


app.put('/api/usuarios/:id', (req, res) =>{
    //Encontrar si existe el objeto usuario
    let usuario = existeUsuario(req.params.id)
    if(!usuario) {
        res.status(404).send('El usuario no fue encontrado');
        return;
    }
    

    const {error, value} = validarUsuario(req.body.nombre);
    if(error){
        const mensaje = error.details[0].message
        res.status(400).send(mensaje)
        return;
    }

    usuario.nombre = value.nombre;
    res.send(usuario);
})


app.delete('/api/usuarios/:id', (req, res)=>{
    let usuario = existeUsuario(req.params.id)
    if(!usuario) {
        res.status(404).send('El usuario no fue encontrado');
        return;
    }

    const index = usuarios.indexOf(usuario);
    usuarios.splice(index, 1);

    res.send(usuario);
})

const port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log(`Escuchando en el puerto ${port}...`);
})
//app.post(); //envio de datos
//app.put(); //actualizacion
//app.delete(); //eliminacion


function existeUsuario(id) {
    return (usuarios.find(u => u.id === parseInt(id)));
}

function validarUsuario(nom) {
    const schema = Joi.object({
        nombre: Joi.string()
        .min(3)
        .required()
    })
    return (schema.validate({ nombre: nom }));
}