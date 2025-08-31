const { DataTypes } = require('sequelize');
const database = require('../utilities/sql');
const Group = require('../models/group');
const User = require('../models/users');

// Define the GroupMember model with correct foreign keys
const GroupMember = database.define('GroupMember', {
    groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: Group, key: 'id' },
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: User, key: 'id' },
        primaryKey: true
    }
}, {
    timestamps: false
});

module.exports = GroupMember;
