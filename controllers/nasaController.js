// will post and get only, inside each post is get from nasa api 
// prefix is /api/v1/nasadata 
const express = require('express')
const router = express.Router();
const NasaData = require('../models/nasaData')
const superagent = require('superagent')

//for MARS: 

// 	//the req.body will be date, rover
// 	// req.body.rover : curiosity(default), req.body.date (today's date-7)

router.post('/mars', async (req,res)=>{
try{
	const num = Math.floor(Math.random()*10)
	const url = `https://api.nasa.gov/mars-photos/api/v1/rovers/${req.body.rover}/photos?earth_date=${req.body.date}&api_key=${process.env.API_KEY}`
	const response = await superagent.get(url)
	const parsedResponse = await JSON.parse(response.text)	

	const photourl = parsedResponse.photos[num].img_src
	const createdPost = await NasaData.create({api: url, imgUrl: photourl, cat: 'mars', })
	res.status(200).json({
		success: true,
		code: 200,
		message: 'succes',
		data: createdPost
	})

	}catch(err){
		res.status(500).json({
	        success: false,
	        message: "internal server error",
	        error: err
    	})
	} //end of catch
})


module.exports = router;