const { DataTypes } = require('sequelize');
const database = require('../utilities/sql');
const Group = require('../models/group');
const User = require('../models/users');

const GroupMessage = database.define('GroupMessage', {
    id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    groupId: { 
        type: DataTypes.INTEGER, 
        allowNull: false, 
        references: { model: Group, key: 'id' } 
    },
    userId: { 
        type: DataTypes.INTEGER, 
        allowNull: false, 
        references: { model: User, key: 'id' } 
    },
    message: { 
        type: DataTypes.TEXT, 
        allowNull: false 
    }
}, {
    timestamps: true
});

module.exports = GroupMessage;
