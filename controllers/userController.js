const User = require('../models/users');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const{Op} = require('sequelize');
const sequelize = require('../utilities/sql');
require('dotenv').config();

function genearteAccessToken(id){
    return jwt.sign({UserId:id},process.env.JWT_SECRET,{expiresIn:'1h'});
}

const postUsers = async(req,res)=>{
    const t = await sequelize.transaction();
    const {name,email,phone,password} = req.body;
    if(!name||!email||!phone||!password){
        return res.status(400).json({error:'Name,email,phone,password are required'});
    }
    try {
        const existingUser = await User.findOne({
            where:{email},transaction:t
        });
        if(existingUser){
            await t.rollback();
            return res.status(400).json({error:'User already exists'});
        }
        const hashedPassword = await bcrypt.hash(password,saltRounds);
        const newUser = await User.create({
            name,
            email,
            phone,
            password:hashedPassword
        },{transaction:t});
        await t.commit();
        res.status(200).json({
            message:`User with ${newUser.name} is added succesfully`,
            user:newUser
        });
    } catch (error) {
        await t.rollback();
        console.error('Error while adding the user',error);
        res.status(500).send('Error while adding the user');
    }
};
const loginUser = async(req,res)=>{
    const {email,password} = req.body;
    if(!email||!password){
        return req.status(400).json({error:'email,password are required'});
    }
    try {
        const emailValidation = await User.findOne({
            where:{email}
        });
        if(!emailValidation){
            return res.status(404).json({error:'Unauthorized user'});
        }
        else if(!await bcrypt.compare(password, emailValidation.password)){
            return res.status(401).json({error:'Invalid response'});
        }
        const token = genearteAccessToken(emailValidation.id);
        await User.update({isOnline:true},{
            where:{id:emailValidation.id}
        })
        return res.status(200)
            .cookie("token", token, {
                httpOnly: true,
                secure: false, // change to true in production (HTTPS)
                sameSite: "strict",
            })
            .json({
                message: 'Login successful',
                token,
                user: { id: emailValidation.id, email: emailValidation.email },
            });
    } catch (error) {
        console.error('Error during login:',error);
        res.status(500).json({error:'Internal server error'});
    }
};
const getAllUsers = async(req,res)=>{
    try {
        const currentUserId = req.user.id;
        const allUsers = await User.findAll({
            where:{id:{[Op.ne]:currentUserId}}
        });
        res.status(200).json(allUsers);
    } catch (error) {
        console.error('Error while retrieving users:',error);
        res.status(500).send('Error while fetching users');
    }
}
module.exports = {
    postUsers,
    loginUser,
    getAllUsers
}