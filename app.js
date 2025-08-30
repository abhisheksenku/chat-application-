const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const { Server } = require('socket.io');
const database = require('./utilities/sql');
const models = require('./models/association');
const userAuthenticate = require('./middleware/auth');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const chatHandlers = require('./sockets/chatSocket');
// socket handlers
const {
  registerHandler,
  sendMessageHandler,
  typingHandler,
  disconnectHandler
} = require('./sockets/chatSocket'); //  import handlers

const app = express();
const port = process.env.PORT || 3000;

// logging
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
);

// middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('combined', { stream: accessLogStream }));
app.use(cookieParser());
app.use(cors());

// routes
app.use('/user', userRoutes);
app.use('/chat', chatRoutes);

// root + auth-protected pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});
app.get('/chat', userAuthenticate.authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'chat.html'));
});

// create server + socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true
  }
});

// attach socket handlers
io.on('connection', (socket) => {
  console.log(`New socket: ${socket.id}`);
  registerHandler(io, socket);
  sendMessageHandler(io, socket);
  typingHandler(io, socket);
  disconnectHandler(io, socket);
});

// DB + start server
(async () => {
  try {
    await database.sync({ force: false });
    server.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Unable to connect to database', error);
  }
})();

// const express = require('express');
// const app = express();
// require('dotenv').config();
// const path = require('path');
// const morgan = require('morgan');
// const fs = require('fs');
// const cors = require('cors');
// const cookieParser = require('cookie-parser');
// const {Server} = require('socket.io');
// const http = require('http');
// const database = require('./utilities/sql');
// const models = require('./models/association');
// const port = process.env.PORT || 3000;
// const accessLogStream = fs.createWriteStream(
//     path.join(__dirname,'access.log'),
//     {flags:'a'}
// );
// //////
// //create HTTP server
// const server = http.createServer(app);
// //Attach socket.io to the server
// const io = new Server(server, {
//   cors: {
//     origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//     credentials: true
//   }
// });

// //miidlewares
// app.use(express.json());
// app.use(express.static(path.join(__dirname,'public')))
// app.use(morgan('combined',{stream:accessLogStream}));
// app.use(cookieParser());
// //authentication middleware
// const userAuthenticate = require('./middleware/auth');
// //routes
// const userRoutes = require('./routes/userRoutes');
// const chatRoutes = require('./routes/chatRoutes');
// //route handler
// app.use('/user',userRoutes);
// app.use('/chat',chatRoutes);

// io.on('connection', (socket)=>{
//     console.log(`New socket:${socket.id}`);
//     chatHandlers(io,socket);
// })
// //Root path
// app.get('/',(req,res)=>{
//     const filePath = path.join(__dirname,'views','signup.html');
//     res.sendFile(filePath);
// });
// app.get('/signup',(req,res)=>{
//     const filePath = path.join(__dirname,'views','signup.html');
//     res.sendFile(filePath);
// });
// app.get('/login',(req,res)=>{
//     const filePath = path.join(__dirname,'views','login.html');
//     res.sendFile(filePath);
// });
// app.get('/chat',userAuthenticate.authenticate,(req,res)=>{
//     const filePath = path.join(__dirname,'views','chat.html');
//     res.sendFile(filePath);
// });
// (async()=>{
//     try {
//         await database.sync({force:false});
//         server.listen(port,()=>{
//             console.log(`Server is running at http://localhost:${port}`);
//         });
//     } catch (error) {
//          console.error('Unable to connect to database', error);
//     }
// })();
