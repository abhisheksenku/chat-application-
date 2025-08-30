const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messagesController');
const userAuthenticate = require('../middleware/auth');
router.post('/add',userAuthenticate.authenticate,messagesController.postMessages);
router.get('/fetch/:userId',userAuthenticate.authenticate,messagesController.getMessages);
module.exports = router