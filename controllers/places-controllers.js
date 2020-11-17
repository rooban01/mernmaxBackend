// const { v4: uuidv4 } = require('uuid');

const { validationResult } = require('express-validator');
const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');
const User = require('../models/user');
const mongoose = require('mongoose');




// get place by place id

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid;
    let place;
  try{
    place = await Place.findById(placeId)                 //mongoose
  }catch(err){
    const error = new HttpError('Place not found',500);
    return next(error);
    }
   

    if(!place){
     const error =  new HttpError('Could not find a place for the provided id.',404);
     return next(error);
    }
    res.json({place: place.toObject({getters:true})});  //place.toObject({getters:true}) to get id without _
}

// get place by place user id

const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid;
    // let places;
    let userWithPlaces;
    
    try{
     // places = await Place.find({creator: userId});   //mongoose
        userWithPlaces = await User.findById(userId);
    }catch(err){
      const errror = new HttpError('Fetching places failed please try again',500);
      return next(error);
    }
   
    

    if(!userWithPlaces || userWithPlaces.places.length === 0){
        return next(new HttpError('Could not find places for the provided user id.',404));
     }
    res.json({places: userWithPlaces.places.map(place => place.toObject({getters: true}))});  // to get regular js, to get id without _ here we use map we r fetching a array
}

// Create a place

const createPlace = async (req,res, next) => {

  const errors = validationResult(req);
  if(!errors.isEmpty()){
   return next(new HttpError('Invalid inputs passed, please check your data', 422));
  }

   const {title, description, address, creator} = req.body; //short cut for const title = req.body.title
   
   let coordinates;
   try{
     coordinates = await getCoordsForAddress(address);
   } catch(error){
     return next (error);
   }
   
  
  
   const createdPlace = new Place({
   
       title,  //shot cut for title: title
       description,
       location: coordinates,     
       image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg',
       address,
       creator
   });
   
   let user;
   try{

    user = await User.findById(creator);
   }catch(err){
    const error = new HttpError('Creating place failed, Please try again',500);
    return next(error);
   }
   if(!user){
    const error = new HttpError('User not found, Please try again',404);
    return next(error);
   }

   try{
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({session:sess});
    user.places.push(createdPlace);  //mongoose syntaxe
    await user.save({session:sess});
    sess.commitTransaction();

   }catch(err){
      const error = new HttpError('Creating place failed',500);
      return next(error);
   }
    

   res.status(201).json({place: createdPlace});
};

const updatePlace = async (req,res, next) => {
  
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    const error = new HttpError('Invalid inputs passed, please check your data', 422);
    return next(error);
  }

    const {title, description, coordinates, address, creator} = req.body;
    const placeId = req.params.pid;

    let place;
    try{
      place = await Place.findById(placeId);
    }catch(err){
      const error = new HttpError('Error server, Could not update! pleasetry again', 500);
      return next(error);
    }

    place.title = title;
    place.description = description;
    try{
       await place.save();
    }catch(err){
      const error = new HttpError('Error server, Could not update! pleasetry again', 500);
      return next(error);
    }
    
    res.status(200).json({place: place.toObject({getters: true})});

};

const deletePlace = async(req,res, next) => {
  const placeId = req.params.pid;
  
  
  let place;
   try{
     place = await Place.findById(placeId).populate('creator');
   }catch(err){
    const error = new HttpError('Error server, Could not delete the place! pleasetry again', 500);
    return next(error);
   }
if(!place){
     const error = new HttpError('Place could not find for this user id', 404);
    return next(error);
}

    try{
      const sess = await mongoose.startSession();
      sess.startTransaction();
      await place.remove({session:sess});
      place.creator.places.pull(place);
      await place.creator.save({session:sess});
      await sess.commitTransaction();
    }catch(err){
      const error = new HttpError('Error server, Could not delete the place! pleasetry again', 500);
      return next(error);
    }
   
  res.status(200).json({message: 'Place deleted'});
};


exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;