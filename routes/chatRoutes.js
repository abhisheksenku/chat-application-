const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messgesController');
const userAuthenticate = require('../middleware/auth');
router.post('/add',userAuthenticate.authenticate,messagesController.postMessages);
module.exports = router