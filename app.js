const express = require('express');
const app = express();
require('dotenv').config();
const path = require('path');
const morgan = require('morgan');
const fs = require('fs');
const cors = require('cors');
const { METHODS } = require('http');
const port = process.env.PORT || 3000;
const accessLogStream = fs.createWriteStream(
    path.join(__dirname,'access.log'),
    {flags:'a'}
);
////
app.use(cors({
    origin:'http://127.0.0.1:5500',
    METHODS: ['GET','POST','PUT','DELETE','PATCH','OPTIONS']
}));
app.use(express.json());
app.use(express.static(path.join(__dirname,'public')))
app.use(morgan('combined',{stream:accessLogStream}));
//Root path
app.get('/',(req,res)=>{
    const filePath = path.join(__dirname,'views','signup.html');
    res.sendFile(filePath);
});
app.get('/signup',(req,res)=>{
    const filePath = path.join(__dirname,'views','signup.html');
    res.sendFile(filePath);
});
app.get('/login',(req,res)=>{
    const filePath = path.join(__dirname,'views','login.html');
    res.sendFile(filePath);
});
app.listen(port,()=>{
    console.log(`Server is running at http://localhost:${port}`);
})
