// will post and get only, inside each post is get from nasa api 
// prefix is /api/v1/nasadata 
const express = require('express')
const router = express.Router();
const NasaData = require('../models/nasaData')
const superagent = require('superagent')

//for MARS: 

// this is the default and sample for mars cat post data: 
router.get('/mars', async (req,res,next)=>{
try{
	const num = Math.floor(Math.random()*5)
	const randomDate = (start, end) => {
    		return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
		}
	const date = randomDate(new Date(2016, 1, 1), new Date(2019,8,31))
	const qString = date.toISOString().split('T')[0]
	console.log(qString,'<----randomDate');

	const imgUrlapi = `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?earth_date=${qString}&api_key=${process.env.API_KEY}`
	const response = await superagent.get(imgUrlapi)
	const parsedResponse = await JSON.parse(response.text)	
	const photo = parsedResponse.photos[num]  //this is the photo url for the post 


	const weatherUrlapi = `https://api.nasa.gov/insight_weather/?&api_key=${process.env.API_KEY}&feedtype=json&ver=1.0`
	const weatherResponse = await superagent.get(weatherUrlapi)
	const parsedWeatherResponse = await JSON.parse(weatherResponse.text) 
	const randomnum = Math.floor(Math.random()*(parsedWeatherResponse.sol_keys.length))
	// console.log(parsedWeatherResponse.sol_keys, randomnum);
	 
	const solDate = parsedWeatherResponse.sol_keys[randomnum] //this get you the latest date
	const singleSetData = parsedWeatherResponse[solDate] //this get you the data of the latest date 
	const postToCreate = {
		cat: 'mars',
		imgUrl:photo.img_src,
		content: `This is a photo taken by curiosity rover on earth date: ${photo.earth_date} with her ${photo.camera.full_name}. And here we also have the data of Mars weather on solDate ${solDate} which is earth_date: ${singleSetData.First_UTC}. Mars is experience ${singleSetData.Season} right now, and her average atmospheric temperature on that day is ${singleSetData.AT.av}.`
	}


	res.status(200).json({
		success: true,
		code: 200,
		message: 'succes',
		data: postToCreate
	})

	}catch(err){
		next(err)
	} //end of catch
})


// you can pick date of the earth img, numbers of imgs, date of the near earth objs, number of objs.

// for Earth and Near Earth OBjs. 
router.get('/earth', async (req,res, next)=>{
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

		const postToCreate = {
			imgUrl: imgUrl,
			cat: 'earth',
			content: `This image of our beautiful mother earth that you are seeing is captioned: ${imgCaption}, it is taken on ${imgDate}. Well and here is one of the asteroid that you might be making a wish to todat. it's name is ${obj.name}, it's absolute magnitude is ${obj.absolute_magnitude_h}, it is ${obj.estimated_diameter.kilometers.estimated_diameter_max} km in diameter. it is orbiring around ${obj.close_approach_data[0].orbiting_body} with the velocity of ${obj.close_approach_data[0].relative_velocity.kilometers_per_hour} you wonder if it is hazarous? the answer is ${obj.is_potentially_hazardous_asteroid} because it missed Earth by ${obj.close_approach_data[0].miss_distance.kilometers} km.`
		}

		res.status(200).json({
			success: true,
			message:'success',
			data: postToCreate
		})

		
	}catch(err){
		next(err)
	} //end of catch 
})



// call for the SPACE WEATHER DATABASE: 
router.get('/spaceweather', async (req,res)=>{
	try{
		
		const notificationURL= `https://api.nasa.gov/DONKI/notifications?type=all&api_key=${process.env.API_KEY}`
		const notificationResponse = await superagent.get(notificationURL)
		const parsedNotification = await JSON.parse(notificationResponse.text)
		const num = await Math.floor(Math.random()*parsedNotification.length)
		const data = await parsedNotification[num]

		const postToCreate = {
			imgUrl: '',
			content: `this is the NASA space weather notification on ${data.messageIssueTime}, this notificaion is about ${data.messageType}: here is the message: ${data.messageBody}`,
			cat: 'spaceweather',
		}

		res.status(200).json({
			success: true,
			message:'success',
			data: postToCreate
		})

	}catch(err){
		res.status(500).json({
			success: false,
			message: 'internal server error',
			error: err
		})
	}

})



// api call to the nasa plantery to get all the planet with kepler flag up. display only three of them.
router.get('/planet', async (req,res,next)=>{
	try{

		// this is getting all the planet in the kepler field
		const planetUrl = `https://exoplanetarchive.ipac.caltech.edu/cgi-bin/nstedAPI/nph-nstedAPI?table=exoplanets&select=pl_hostname,st_age,pl_pelink,pl_mnum,pl_facility,st_teff,pl_orbper,pl_disc,pl_locale,pl_discmethod,pl_name,pl_masse&format=json&where=pl_kepflag=1 and pl_masse>0`
		const defaultPlanet = await superagent.agent().get(planetUrl)

		const parsedDefaultPlanet = JSON.parse(defaultPlanet.text)
		// console.log(parsedDefaultPlanet);
		// Rows are listed in ascending order by default, based on the values within the row

		let numArr = []
		let planetArr = []
		while (numArr.length < 3) {
			let num = Math.floor(Math.random()*parsedDefaultPlanet.length)
			if (numArr.indexOf(num) === -1) {		
				numArr.push(num)
				const planet = parsedDefaultPlanet[num] 
				const planetToCreate = {
					// apiUrl: [planetUrl,num],
					bio: `this baby planet is ${planet.pl_name}, she is discovered by ${planet.pl_facility} facility by ${planet.pl_discmethod} in ${planet.pl_locale},${planet.pl_disc}. Her host star is ${planet.pl_hostname}, it is ${planet.st_age} years old. The teemperature of the star as modeled by a black body emitting the same total amount of electromagnetic radiation is ${planet.st_teff} K. Her weight is ${planet.pl_masse} in Earth Mass, which means the anount of matter contained in her meadured in the units of masses of the Earth. It takes ${planet.pl_orbper} days for her to make a complete orbit around her star. And she has ${planet.pl_mnum} of moons in her system.`,
					name: planet.pl_name,
				} // planetToCreate
				planetArr.push(planetToCreate)
			} //if
		}	
		console.log(req.session,'<------session');
		// const createdPlanets = await Planet.create(planetArr)

		res.status(200).json({
			success: true,
			code: 200,
			message: 'success',
			data: planetArr
		})

	} catch(err) {
		next(err)
	}
})



// getting a planet that the user searched. 
router.post('/planet', async (req,res)=>{
	try{

		// this is getting all the planet in the kepler field
		const planetUrl = `https://exoplanetarchive.ipac.caltech.edu/cgi-bin/nstedAPI/nph-nstedAPI?table=exoplanets&select=pl_hostname,st_age,pl_pelink,pl_mnum,pl_facility,st_teff,pl_orbper,pl_disc,pl_locale,pl_discmethod,pl_name,pl_masse&format=json&where=pl_name like '${req.body.name}'`
		const defaultPlanet = await superagent.get(planetUrl)

		const parsedDefaultPlanet = JSON.parse(defaultPlanet.text)
		// console.log(parsedDefaultPlanet,'<-------parsed data');
		if (parsedDefaultPlanet.length){

			const planet = parsedDefaultPlanet[0]
			const planetToCreate = {
				// apiUrl: [planetUrl,num],
				bio: `this baby planet is ${planet.pl_name}, she is discovered by ${planet.pl_facility} facility by ${planet.pl_discmethod} in ${planet.pl_locale},${planet.pl_disc}. Her host star is ${planet.pl_hostname}, it is ${planet.st_age} years old. The teemperature of the star as modeled by a black body emitting the same total amount of electromagnetic radiation is ${planet.st_teff} K. Her weight is ${planet.pl_masse} in Earth Mass, which means the anount of matter contained in her meadured in the units of masses of the Earth. It takes ${planet.pl_orbper} days for her to make a complete orbit around her star. And she has ${planet.pl_mnum} of moons in her system.`,
				name: planet.pl_name,
			}//end of planet to create
			// console.log(req.session,'<=========posting a planet');
			res.status(200).json({
				success: true,
				code: 200,
				message: 'success',
				data: planetToCreate
			})

		} else {
			res.status(200).json({
				success: false,
				code: 500,
				message: 'no planet found',
			})
		}
	} catch(err) {
		res.status(500).json({
	        success: false,
	        message: "internal server error",
	        error: err
    	})
	}

})



// data from NASA apod aip APOD this route is for the picture of the day,(background of the app)
router.get('/load/apod', async (req,res,next)=>{
	try{
		const url = `https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`
		const apodRespond = await superagent.get(url)
		const parsedRespond = await JSON.parse(apodRespond.text)

		const data = {
			imgUrl: parsedRespond.url,
			imgCaption: parsedRespond.title,
			explnation: parsedRespond.explanation,
			mediaType: parsedRespond.media_type,
			date: parsedRespond.date
		}
		
		res.status(200).json({
			success: true,
			message: 'success',
			code: 200,
			data: data
		})
		
	}catch(err){
		next(err)
		
	}
})



// get a random post from nasa APOD api with a random date
router.get('/apod', async (req,res,next)=>{
	try{
		const randomDate = (start, end) => {
    		return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
		}
		const date = randomDate(new Date(2016, 1, 1), new Date())
		const qString = date.toISOString().split('T')[0]
		console.log(qString,'<----randomDate');

		const url = `https://api.nasa.gov/planetary/apod?date=${qString}&api_key=${process.env.API_KEY}`
		const apodRespond = await superagent.get(url)
		const parsedRespond = await JSON.parse(apodRespond.text)

		const postToCreate = {
			imgUrl: parsedRespond.url,
			content: `this photo is titled ${parsedRespond.title}, it is taken on ${parsedRespond.date} copyrighted by ${parsedRespond.copyright}. and here is a paragraph describing this photo: ${parsedRespond.explanation}`,
			cat: 'apod'
		}

		res.status(200).json({
			success: true,
			message: 'success',
			code: 200,
			data: postToCreate
		})
		
	}catch(err){
		next(err)
		
	}
})





module.exports = router;