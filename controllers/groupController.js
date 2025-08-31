const Group = require('../models/group');
const GroupMember = require('../models/groupMember');
const GroupMessage = require('../models/groupMessage');
const User = require('../models/users');
// Create a new group
const createGroup = async (req, res) => {
  const { name } = req.body;
  const createdBy = req.user.id; // Assuming user info is added by authentication middleware

  try {
    const group = await Group.create({
      name,
      createdBy
    });
    res.status(201).json(group);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Error creating group' });
  }
};

// Add a user to a group
const addUserToGroup = async (req, res) => {
  const { groupId, userId } = req.body;

  try {
    // Ensure the user is not already a member
    const existingMember = await GroupMember.findOne({ where: { groupId, userId } });
    if (existingMember) {
      return res.status(400).json({ error: 'User is already a member of this group' });
    }

    await GroupMember.create({ groupId, userId });
    res.status(201).json({ message: 'User added to group' });
  } catch (error) {
    console.error('Error adding user to group:', error);
    res.status(500).json({ error: 'Error adding user to group' });
  }
};

// Get all messages for a specific group
const getGroupMessages = async (req, res) => {
  const { groupId } = req.params;

  try {
    const messages = await GroupMessage.findAll({
      where: { groupId },
      include: [{ model: User, attributes: ['name'] }] // Include user information with the messages
    });
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching group messages:', error);
    res.status(500).json({ error: 'Error fetching group messages' });
  }
};

// Send a message to a group
const sendGroupMessage = async (req, res) => {
  const { groupId, message } = req.body;
  const userId = req.user.id; // Assuming user info is available from the authentication middleware

  try {
    const newMessage = await GroupMessage.create({
      groupId,
      userId,
      message
    });
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error sending group message:', error);
    res.status(500).json({ error: 'Error sending group message' });
  }
};

module.exports = { createGroup, addUserToGroup, getGroupMessages, sendGroupMessage };


