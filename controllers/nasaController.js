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


// this is the default and sample for mars cat post data: 
router.get('/mars', async (req,res)=>{
try{
	const num = Math.floor(Math.random()*10)

	const imgUrlapi = `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?earth_date=2019-8-20&api_key=${process.env.API_KEY}`
	const response = await superagent.get(imgUrlapi)
	const parsedResponse = await JSON.parse(response.text)	
	const photourl = parsedResponse.photos[num].img_src  //this is the photo url for the post 


	const weatherUrlapi = `https://api.nasa.gov/insight_weather/?&api_key=${process.env.API_KEY}&feedtype=json&ver=1.0`
	const weatherResponse = await superagent.get(weatherUrlapi)
	const parsedWeatherResponse = await JSON.parse(weatherResponse.text) 
	const solDate = await parsedWeatherResponse.sol_keys[6] //this get you the latest date
	const singleSetData = parsedWeatherResponse[solDate] //this get you the data of the latest date 

	// const [response, weatherResponse] = Promise.all[superagent.get(imgUrlapi), superagent.get(weatherUrlapi)]
	const latestdata = {
		'sol_keys': parsedWeatherResponse.sol_keys,
		'sol': solDate,
		'atmosphericTemp': singleSetData['AT']['av'],
		'firstDate': singleSetData['First_UTC'],
		'lastDate': singleSetData['Last_UTC'],
		'seasion': singleSetData['Season'],
		'horizontalWindSpeed': singleSetData['HWS']['av'],
		'windDirection': singleSetData['WD']['most_common']['compass_point']
	}

	const createdPost = await NasaData.create({
		api: [imgUrlapi, weatherUrlapi], 
		imgUrl: photourl, 
		cat: 'MARS', 
		myData: JSON.stringify(latestdata), 
		defaultInfo: true
	})


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




// for Earth and Near Earth OBjs. 
router.get('/earth', async (req,res)=>{
	try{
		const num = Math.floor(Math.random()*10)

		const imgUrlapi = `https://api.nasa.gov/EPIC/api/natural?api_key=${process.env.API_KEY}`
		const imgResponse = await superagent.get(imgUrlapi)
		const parsedimgResponse = await JSON.parse(imgResponse.text)
		const oneImg = parsedimgResponse[num]
		const imgCaption = oneImg.caption
		// this is the newest avaliable
		const imgDate = oneImg.date 
		const year = imgDate.split('-')[0]
		const month = imgDate.split('-')[1]
		const day = imgDate.split('-')[2].split(' ')[0]
		const imgUrl = `https://epic.gsfc.nasa.gov/archive/natural/${year}/${month}/${day}/png/${oneImg.image}.png` 
		const todayDate = new Date().toISOString().slice(0,10)

		const nearEarthObjapi = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${todayDate}&api_key=${process.env.API_KEY}`

		const neoResponse = await superagent.get(nearEarthObjapi)
		const parsedneoResponse = await JSON.parse(neoResponse.text)

		const objs = parsedneoResponse.near_earth_objects[todayDate]
		const obj = objs[0]

		const latestdata = {
			'imgCaption': imgCaption,
			'imgDate': imgDate,
			'neoName': obj.name,
			'neoMagnitude': obj.absolute_magnitude_h,
			'neoDiameter': obj.estimated_diameter.kilometers,
			'hazardous?': obj.is_potentially_hazardous_asteroid,
			'orbBody': obj.close_approach_data[0].orbiting_body,
			'relativeVelocity': obj.close_approach_data[0].relative_velocity.kilometers_per_hour,
			'missedDistance': obj.close_approach_data[0].miss_distance.kilometers
		}

		const createdPost = await NasaData.create({
			api: [imgUrlapi, nearEarthObjapi], 
			imgUrl: imgUrl, 
			cat: 'EARTH', 
			defaultInfo: true,
			myData: JSON.stringify(latestdata)
		})

		res.status(200).json({
			success: true,
			message:'success',
			data: createdPost
		})

		
	}catch(err){
		res.status(500).json({
			success: false,
			message: 'internal server error',
			error: err
		})
	}


})




module.exports = router;