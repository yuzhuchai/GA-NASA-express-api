// will post and get only, inside each post is get from nasa api 
// prefix is /api/v1/nasadata 
const express = require('express')
const router = express.Router();
const NasaData = require('../models/nasaData')
const superagent = require('superagent')

//for MARS: 

// 	//the req.body will be date, rover
// 	// req.body.rover : curiosity(default), req.body.date (today's date-7)

// Mars Weather:  This API provides per-Sol summary data for each of the last seven available Sols (Martian Days). 
// users maybe able to pic which of the seven day that they would like to checkout. 

// what about sol  get the data back of all the sol keys and the corrospanding earth dates and pick one you wanna see? STRETCH GOAL

router.post('/mars', async (req,res)=>{
try{
	const num = Math.floor(Math.random()*10)

	const imgUrlapi = `https://api.nasa.gov/mars-photos/api/v1/rovers/${req.body.rover}/photos?earth_date=${req.body.date}&api_key=${process.env.API_KEY}`
	const response = await superagent.get(imgUrlapi)
	const parsedResponse = await JSON.parse(response.text)	
	const photourl = parsedResponse.photos[num].img_src  //this is the photo url for the post 


	const weatherUrlapi = `https://api.nasa.gov/insight_weather/?&api_key=${process.env.API_KEY}&feedtype=json&ver=1.0`
	const weatherResponse = await superagent.get(weatherUrlapi)
	const parsedWeatherResponse = await JSON.parse(weatherResponse.text) 
	const solDate = await parsedWeatherResponse.sol_keys[6] //this get you the latest date
	const singleSetData = parsedWeatherResponse[solDate] //this get you the data of the latest date 
	const latestdata = {
		'sol': solDate,
		'atmosphericTemp': singleSetData['AT']['av'],
		'firstDate': singleSetData['First_UTC'],
		'lastDate': singleSetData['Last_UTC'],
		'seasion': singleSetData['Season'],
		'horizontalWindSpeed': singleSetData['HWS']['av'],
		'windDirection': singleSetData['WD']['most_common']['compass_point']
	}

	const createdPost = await NasaData.create({api: [imgUrlapi, weatherUrlapi] , imgUrl: photourl, cat: 'MARS', content: JSON.stringify(latestdata)})
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