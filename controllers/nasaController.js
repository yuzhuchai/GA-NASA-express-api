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


// you can pick date of the earth img, numbers of imgs, date of the near earth objs, number of objs.

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
	} //end of catch 
})



// call for the SPACE WEATHER DATABASE: 
router.get('/weather', async (req,res)=>{
	try{
		// 	this is the call for A coronal mass ejection (CME) is a significant release of plasma and accompanying magnetic field from the solar corona. 
		//this is not returning any data back 
// 		const cmeurl = `https://api.nasa.gov/DONKI/CME?api_key=${process.env.API_KEY}`
// 		// default date is the newest date with data. 
// 		const cmeResponse = await superagent.get(cmeurl)
// 		const parsedCMEResponse = await JSON.parse(cmeResponse.text)
// 		const latestdata = parsedCMEResponse[parsedCMEResponse.length-1]
// 		const cmeAnalysis = latestdata.cmeAnalyses.filter(data => data.note)


// 		// interplanetary shock 
// 		const ipsUrl = `https://api.nasa.gov/DONKI/IPS?startDate=2016-01-01&endDate=2016-01-30&api_key=${process.env.API_KEY}`
// 		const ipsResponse = await superagent.get(ipsUrl)
// 		const parsedIPSResponse = await JSON.parse(ipsResponse.text)



// those are notifications: maybe useful for some other purposes?????? 
		const notificationURL= `https://api.nasa.gov/DONKI/notifications?type=all&api_key=${process.env.API_KEY}`
		const notificationResponse = await superagent.get(notificationURL)
		const parsedNotification = await JSON.parse(notificationResponse.text)
		const num = await Math.floor(Math.random()*parsedNotification.length-2)
		const data = await parsedNotification[num]
// 		const myData = {
// 			CME: {
// 				instruments: latestdata.instruments[0].displayName,
// 				time: cmeAnalysis[0].time21_5,
// 				latitude: cmeAnalysis[0].latitude,
// 				longitude: cmeAnalysis[0].longitude,
// 				speed: cmeAnalysis[0].speed,
// 				type: cmeAnalysis[0].type,
// 				nodes: cmeAnalysis[0].note
// 			},
// 			IPS: {

// 			}
// 		}
		const createdPost = await NasaData.create({
			api: [notificationURL], 
			cat: 'WEATHER', 
			defaultInfo: true,
			myData: JSON.stringify(data)
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

// this route is used for testing 
// router.get('/', async (req,res)=>{
// 	try{
// 		const findAllPost = await NasaData.find()
// 		res.status(200).json({
// 			success: true,
// 			message: 'success',
// 			code: 200,
// 			data: findAllPost
// 		})
		
// 	}catch(err){
// 		res.status(500).json({
// 			message:'internal server error',
// 			error: err,
// 			success: false 
// 		})
// 	}
// })


// APOD 
router.get('/apod', async (req,res)=>{
	try{
		const url = `https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`
		const apodRespond = await superagent.get(url)
		const parsedRespond = await JSON.parse(apodRespond.text)

		const data = {
			imgCaption: parsedRespond.title,
			explnation: parsedRespond.explanation,
			mediaType: parsedRespond.media_type,
			date: parsedRespond.date
		}


		const createdPost = await NasaData.create({
			api: [url], 
			imgUrl: parsedRespond.url,
			cat: 'APOD', 
			defaultInfo: true,
			myData: JSON.stringify(data)
		})

		res.status(200).json({
			success: true,
			message: 'success',
			code: 200,
			data: createdPost
		})
		
	}catch(err){
		res.status(500).json({
			message: 'internal server error',
			error: err,
			success: false 
		})
		
	}
})


module.exports = router;