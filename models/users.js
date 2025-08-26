const {DataTypes}= require('sequelize');
const database = require('../utilities/sql');
const User = database.define('User',{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true,
        allowNull:false
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    email:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true
    },
    phone:{
        type:DataTypes.STRING(15),
        allowNull:false
    },
    password:{
        type:DataTypes.TEXT,
        allowNull:false
    }
},{
    timestamps:true
});
module.exports = User;