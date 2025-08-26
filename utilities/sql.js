// The dotenv package loads environment variables from the .env file, and the .config() method is what injects (or populates) those variables into process.env, making them usable in your application.
require('dotenv').config();
// require('dotenv').config({ path: '/var/configs/expensetrackingapp/.env' });

// we are destructuring -pulling out just that one property and assigning it to a variable named Sequelize.
const {Sequelize} = require('sequelize');
// we are creating a sequelize instance
//its like we are trying to make a connection with datse to interact with them using the credentials
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host:process.env.DB_HOST,
        dialect:process.env.DB_DIALECT
    }
);
// IIFE to immediately run an async function that authenticates your Sequelize connection.
(async()=>{
    try {
        await sequelize.authenticate();
        console.log('Connection has been started with SQL');
    } catch (error) {
        console.error('Error while connecting to databse');
    }
})();
module.exports = sequelize;
// (()=>{
//     sequelize.authenticate()
//                 .then(()=>{
//                     console.log('Connection has been started with SQL');
//                 })
//                 .catch((error)=>{
//                     console.error('Error while connecting to databse',error);
//                 });
// })();
