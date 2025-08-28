const User = require('../models/users');
const Message = require('../models/messages');

//associations
// One user can send many meesages, and particular message belongs to that particular user
User.hasMany(Message);
Message.belongsTo(User);

module.exports = {
    User,Message
}