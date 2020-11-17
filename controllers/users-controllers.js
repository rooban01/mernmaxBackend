// const { v4: uuidv4 } = require('uuid');

const {validationResult} = require('express-validator');
const HttpError = require('../models/http-error');
const User = require('../models/user');


const getUsers = async (req, res, next) => {
   
    let users;
    try{
        users = await User.find({}, '-password');
    }catch(err){
        const error = new HttpError('Error server, fetching  user impossible', 500);
        return next(error);
    }
    if(!users){
        const error = new HttpError('Users not found', 404);
        return next(error); 
    }

    res.json({users: users.map(user => user.toObject({getters:true}))});


};

const signup = async (req, res, next) => {
    const errors = validationResult(req);
  if(!errors.isEmpty()){
    const error = new HttpError('Invalid inputs passed, please check your data', 422);
    return next(error);
  }
    const {name,email, password} = req.body;
    let existingUser;
    
    try{
        existingUser = await User.findOne({email: email})
    }catch(err){
        const error = new HttpError('Signing up failed, please try again.',500);
        return next(error);
    }
    if(existingUser){
        const error = new HttpError('Email exists already', 422);
        return next(error);
    }
    

    const createdUser = new User({
        name,
        email,
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg',
        password,
        places:[]
    });

    try{
        await createdUser.save();   //mongoose
      }catch(err){
         const error = new HttpError('Signing up failed please try again',500);
         return next(error);
      }
       

    res.status(201).json({ user: createdUser.toObject({getters:true})});
};

const login = async (req, res, next) => {
    const {email, password} = req.body;

    let existingUser;
    
    try{
        existingUser = await User.findOne({email: email})   //findone async
    }catch(err){
        const error = new HttpError('loging in failed, please try again.',500);
        return next(error);
    }
    if(!existingUser || existingUser.password !== password ){
        const error = new HttpError('User or password incorrect', 401);
        return next(error);
    }


    res.json({message: 'Logged in!'});
};


exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;