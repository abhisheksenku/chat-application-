const express = require('express');
const { createGroup, addUserToGroup, getGroupMessages, sendGroupMessage } = require('../controllers/groupController');
const userAuthenticate = require('../middleware/auth');

const router = express.Router();

// Route to create a new group
router.post('/create', userAuthenticate.authenticate, createGroup);

// Route to add a user to a group
router.post('/addUser', userAuthenticate.authenticate, addUserToGroup);

// Route to get messages of a specific group
router.get('/:groupId/messages', userAuthenticate.authenticate, getGroupMessages);

// Route to send a message to a group
router.post('/sendMessage', userAuthenticate.authenticate, sendGroupMessage);

module.exports = router;
