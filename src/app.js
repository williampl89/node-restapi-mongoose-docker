const express = require('express');
const bodyParser = require('body-parser');
const _connect = require('./db/_connect');
const userRoutes = require('./routes/userRouter');
const todoRoutes = require('./routes/todoRouter');
//const {isAuthenticated} = require('./middlewares');

require('dotenv').config();
//mongo connection
_connect();

const app = express();

app.use(bodyParser.json());
//app.use(isAuthenticated);  ////con ese middleware se usa para verificar que se envie en las cabeceras el token

//Routes
app.use('/account', userRoutes);
app.use('/todos', todoRoutes);

app.listen(process.env.PORT, ()=> console.log(`App listenig on ${process.env.PORT}`));