const User = require('./users');
const Message = require('./messages');

// One user can send many messages
User.hasMany(Message, { as: "SentMessages", foreignKey: "senderId" });

// One user can receive many messages
User.hasMany(Message, { as: "ReceivedMessages", foreignKey: "receiverId" });

// Each message belongs to a sender and a receiver
Message.belongsTo(User, { as: "Sender", foreignKey: "senderId" });
Message.belongsTo(User, { as: "Receiver", foreignKey: "receiverId" });

module.exports = { User, Message };
