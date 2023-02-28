const express = require('express');
const app= express();
const morgan = require('morgan')
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');
const authJwt = require('./helpers/jwt');
const errorHandler=require('./helpers/jwt');

app.use(cors());
app.options('*',cors());

const categoryRouter=require('./routers/categories');
const productRouter=require('./routers/products');
const userRouter=require('./routers/users');
const orderRouter=require('./routers/orders')

app.use(express.json());
app.use(morgan('tiny'));
app.use(authJwt);
app.use(errorHandler);

// _dirname will give application route.
app.use('/public/uploads', express.static(__dirname+'/public/uploads'));

const api = process.env.API_URL;
const connectionString=process.env.CONNECTION_STRING;

app.use(`${api}/categories`,categoryRouter);
app.use(`${api}/products`,productRouter);
app.use(`${api}/users`,userRouter);
app.use(`${api}/orders`,orderRouter);

mongoose.set('strictQuery', false);
//connect returns a promise so we can use then and error
mongoose.connect(connectionString,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    dbName:'MEAN-eshop'
})
.then(()=>{
    console.log('Database connection is ready.....')
})
.catch((error)=>{
    console.log(error);
});

app.listen(3000,()=>{
    console.log('Server is listening!!!')
})