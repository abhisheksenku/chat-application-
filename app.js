const express = require('express');
const app = express();
require('dotenv').config();
const path = require('path');
const morgan = require('morgan');
const fs = require('fs');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { METHODS } = require('http');
const database = require('./utilities/sql');
const models = require('./models/association');
const port = process.env.PORT || 3000;
const accessLogStream = fs.createWriteStream(
    path.join(__dirname,'access.log'),
    {flags:'a'}
);
////
app.use(cors({
    origin:['http://127.0.0.1:5500','http://localhost:5500'],
    METHODS: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
    credentials:true
}));
//miidlewares
app.use(express.json());
app.use(express.static(path.join(__dirname,'public')))
app.use(morgan('combined',{stream:accessLogStream}));
app.use(cookieParser());
//authentication middleware
const userAuthenticate = require('./middleware/auth');
//routes
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
//route handler
app.use('/user',userRoutes);
app.use('/chat',chatRoutes);
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
app.get('/chat',userAuthenticate.authenticate,(req,res)=>{
    const filePath = path.join(__dirname,'views','chat.html');
    res.sendFile(filePath);
});
(async()=>{
    try {
        await database.sync({force:true});
        app.listen(port,()=>{
            console.log(`Server is running at http://localhost:${port}`);
        });
    } catch (error) {
         console.error('Unable to connect to database', error);
    }
})();
