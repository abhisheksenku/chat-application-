const User = require('./users');
const Message = require('./messages');

User.hasMany(Message);
Message.belongsTo(User);

module.exports = { User, Message };
