const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
router.post('/add',userController.postUsers);
router.post('/login',userController.loginUser);
router.get('/fetch',userController.getAllUsers);
module.exports = router;