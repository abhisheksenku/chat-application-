const Chat = require('../models/messages');
const User = require('../models/users');

function registerHandler(io, socket) {
  socket.on('register', ({ userId, name }) => {
    socket.userId = userId;
    socket.userName = name;
    socket.join(`user_${userId}`);
    console.log(`${name} registered with ID ${userId}`);

    socket.broadcast.emit('user-joined', { userId, name });
  });
}

function sendMessageHandler(io, socket) {
  socket.on('send-message', async ({ to, message }) => {
    try {
      // check sender & receiver in DB
      const sender = await User.findByPk(socket.userId);
      const receiver = await User.findByPk(to);

      if (!sender || !receiver) {
        return socket.emit('error-message', { message: 'Invalid users' });
      }

      // directly create message in DB
      const msg = await Chat.create({
        message,
        senderId: socket.userId,
        receiverId: to
      });

      // emit to recipient
      io.to(`user_${to}`).emit('receive-message', {
        id: msg.id,
        from: socket.userId,
        fromName: socket.userName,
        to,
        message,
      });

      // emit to sender also (for UI consistency)
      io.to(`user_${socket.userId}`).emit('receive-message', {
        id: msg.id,
        from: socket.userId,
        fromName: socket.userName,
        to,
        message,
      });

    } catch (err) {
      console.error('Error saving message:', err);
      socket.emit('error-message', { message: 'Message delivery failed' });
    }
  });
}

function typingHandler(io, socket) {
  socket.on('typing', ({ to, isTyping }) => {
    io.to(`user_${to}`).emit('typing', {
      from: socket.userId,
      fromName: socket.userName,
      isTyping,
    });
  });
}

function disconnectHandler(io, socket) {
  socket.on('disconnect', () => {
    console.log(`${socket.userName || socket.id} disconnected`);
    socket.broadcast.emit('left', {
      userId: socket.userId,
      name: socket.userName,
    });
  });
}

module.exports = {
  registerHandler,
  sendMessageHandler,
  typingHandler,
  disconnectHandler,
};
