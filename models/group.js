const { DataTypes } = require('sequelize');
const database = require('../utilities/sql');

const Group = database.define('Group', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    timestamps: true 
});

module.exports = Group;
