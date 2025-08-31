const User = require('./users');
const Message = require('./messages');
const Group = require('../models/group');
const GroupMember = require('../models/groupMember');
const GroupMessage = require('../models/groupMessage');

// Define associations
User.hasMany(Message);
Message.belongsTo(User);

User.belongsToMany(Group, { through: GroupMember, foreignKey: 'userId', otherKey: 'groupId' });
Group.belongsToMany(User, { through: GroupMember, foreignKey: 'groupId', otherKey: 'userId' });

Group.hasMany(GroupMessage, { foreignKey: 'groupId' });
GroupMessage.belongsTo(Group, { foreignKey: 'groupId' });

User.hasMany(GroupMessage, { foreignKey: 'userId' });
GroupMessage.belongsTo(User, { foreignKey: 'userId' });


module.exports = { User, Message, Group, GroupMember, GroupMessage };
