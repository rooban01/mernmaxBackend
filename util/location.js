// const HttpError = require('../models/http-error');

//  const axios = require('axios')
// const API_KEY= 'hskhfdshsll' deliverd by google

// const axios = require("axios")


// async function getCoordsForAddress(address){
//    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`)
   
//    const data = response.data;

//    if(!data || data ==='ZERO_RESULTS'){
//       const error = new HttpError('Could not find location for the specified address',422);

//       throw error;
//    }

//    const  coordinates = data.results[0].geometry.location;
//    return coordinates;
// }






//dummy coordinate
function getCoordsForAddress(address){
    return {
        
            lat: 40.7484405,
            lng: -73.9878584
          
    }
}

module.exports = getCoordsForAddress;