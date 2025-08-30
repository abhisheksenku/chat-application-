const Message = require('../models/messages');
const User = require('../models/users');
const sequelize = require('../utilities/sql');
require('dotenv').config();
const { Op } = require('sequelize');
const getMessages = async (req, res) => {
    try {
        const otherUserId = parseInt(req.params.userId, 10);   // person you are chatting with
        const myId = parseInt(req.user.id, 10);               // logged-in user

        if (isNaN(otherUserId) || isNaN(myId)) {
            return res.status(400).json({ error: 'Invalid userId' });
        }

        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { senderId: myId, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: myId }
                ]
            },
            include: [
                {
                    model: User,
                    as: 'Sender',
                    attributes: ['name']
                },
                {
                    model: User,
                    as: 'Receiver',
                    attributes: ['name']
                }
            ],
            order: [['createdAt', 'ASC']]
        });

        res.json(messages.map(m => ({
            senderId: m.senderId,
            receiverId: m.receiverId,
            message: m.message,
            senderName: m.Sender.name,
            receiverName: m.Receiver.name
        })));

    } catch (error) {
        console.error("getMessages error:", error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};
// const fetchMessages = async (req, res) => {
//   const { userId, otherId } = req.params;
//   const u1 = parseInt(userId, 10);
//   const u2 = parseInt(otherId, 10);

//   if (isNaN(u1) || isNaN(u2)) {
//     return res.status(400).json({ error: 'Invalid userId' });
//   }

//   try {
//     const messages = await Message.findAll({
//       where: {
//         [Op.or]: [
//           { senderId: u1, receiverId: u2 },
//           { senderId: u2, receiverId: u1 }
//         ]
//       },
//       order: [['createdAt', 'ASC']]
//     });
//     res.json(messages);
//   } catch (err) {
//     console.error("fetchMessages error:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

// const postMessages = async(req,res)=>{
//     const {to,message} = req.body;
//     const UserId = req.user.id;
//     if(!to||!message){
//         return res.status(400).json({error:'Receiver and message are required'});
//     }
//     const t = await sequelize.transaction();
//     try {
//         const newMessage = await Message.create({
//             message,
//             receiverId:to,
//             UserId
//         },{transaction:t});
//         const user = await User.findByPk(UserId)
//         await t.commit();
//         res.status(200).json({
//             // message:`${newMessage} is sent from ${user}`,
//             message: `${newMessage.message} is sent from ${user.name}`,
//             chatMessage:newMessage
//         })
//     } catch (error) {
//         await t.rollback();
//         console.error('Error while sending the message',error),
//         res.status(500).send('Error while adding the user')
//     }
// };
// const getMessages = async(req,res)=>{
//     try {
//         const otherUsersId = req.params.userId;
//         const UserId = req.user.id;
//         const messages = await Message.findAll({
//               where: {
//                     [Op.or]: [
//                     { UserId:UserId, receiverId: otherUsersId },
//                     { UserId: otherUsersId, receiverId: UserId }
//                     ]
//                 },
//                 order: [['createdAt', 'ASC']]
//         });
//         res.json(messages);
//     } catch (error) {
//         res.status(500).json({error:'Failed to fetch messages'});
//     }
// };
module.exports = {
    // postMessages,
    getMessages
}