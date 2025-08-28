const Message = require('../models/messages');
const User = require('../models/users');
const sequelize = require('../utilities/sql');
require('dotenv').config();
const postMessages = async(req,res)=>{
    const {to,message} = req.body;
    const UserId = req.user.id;
    if(!to||!message){
        return res.status(400).json({error:'Receiver and message are required'});
    }
    const t = await sequelize.transaction();
    try {
        const newMessage = await Message.create({
            message,
            receiverId:to,
            senderId:UserId
        },{transaction:t});
        const user = await User.findByPk(UserId)
        await t.commit();
        res.status(200).json({
            // message:`${newMessage} is sent from ${user}`,
            message: `${newMessage.message} is sent from ${user.name}`,
            chatMessage:newMessage
        })
    } catch (error) {
        await t.rollback();
        console.error('Error while sending the message',error),
        res.status(500).send('Error while adding the expense')
    }
};
const getMessages = async(req,res)=>{
    try {
        const otherUsersId = req.params.userId;
        const UserId = req.user.id;
        const messages = await Message.findAll({
            where:{
                [Chat.sequelize.Op.Or]:[
                    {senderId:UserId,receiverId:otherUsersId},
                    {senderId:otherUsersId,receiverId:UserId}
                ]
            },
            include:[
                {model:User, as: 'sender',attributes:['id','name']},
                {model:User,as:'receiver',attributes:['id','name']}
            ],
            order:[['createdAt','ASC']]
        });
                const formatted = messages.map(msg => ({
            id: msg.id,
            senderId: msg.sender.id,
            senderName: msg.sender.name,
            receiverId: msg.receiver.id,
            receiverName: msg.receiver.name,
            message: msg.message,
            createdAt: msg.createdAt
        }));

        res.json(formatted);
    } catch (error) {
        res.status(500).json({error:'Failed to fetch messages'});
    }
};
module.exports = {
    postMessages,
    getMessages
}