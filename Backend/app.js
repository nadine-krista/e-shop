const express = require('express');
const app= express();
const morgan = require('morgan')
const mongoose = require('mongoose');
const cors = require('cors');
const categoryRouter=require('./routers/categories');
require('dotenv/config');
const api = process.env.API_URL;

const connectionString=process.env.CONNECTION_STRING;
app.use(express.json());
app.use(morgan('tiny'));

app.use(cors());
app.options('*',cors());
app.use(`${api}/categories`,categoryRouter);

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