const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const userAuthenticate = require('../middleware/auth');
router.post('/add',userController.postUsers);
router.post('/login',userController.loginUser);
router.get('/fetch',userAuthenticate.authenticate,userController.getAllUsers);
module.exports = router;