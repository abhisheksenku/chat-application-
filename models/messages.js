const {DataTypes} = require('sequelize');
const database = require('../utilities/sql');
const Message = database.define('Message',{
    id:{
        primaryKey:true,
        type:DataTypes.INTEGER,
        allowNull:false,
        autoIncrement:true
    },
    message:{
        type:DataTypes.STRING,
        allowNull:false
    }
},{
    timestamps:true
});
module.exports = Message;