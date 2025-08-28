const Message = require('../models/messages');
const User = require('../models/users');
const sequelize = require('../utilities/sql');
require('dotenv').config();
const postMessages = async(req,res)=>{
    const {message} = req.body;
    const UserId = req.user.id;
    if(!message){
        return res.status(400).json({error:'Message is needed'});
    };
    const t = await sequelize.transaction();
    try {
        const newMessage = await Message.create({
            message,
            UserId
        },{transaction:t});
        const user = await User.findByPk(UserId)
        await t.commit();
        res.status(200).json({
            // message:`${newMessage} is sent from ${user}`,
            message: `${newMessage.chatMessage} is sent from ${user.name}`,
            chatMessage:newMessage
        })
    } catch (error) {
        await t.rollback();
        console.error('Error while sending the message',error),
        req.status(500).send('Error while adding the expense')
    }
};
module.exports = {
    postMessages
}