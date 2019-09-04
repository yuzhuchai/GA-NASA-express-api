const express = require('express')
const router = express.Router();
const Planet = require('../models/planet')
const superagent = require('superagent')



// this is getting the random default planets ..... create a list of planets (3)
// this will run once every time the app is loaded. and then the planets are saved in the nasaDatabase, all the rest is to find the planet with the save :/id
router.get('/default', async (req,res)=>{
	try{

		// this is getting all the planet in the kepler field
		const planetUrl = `https://exoplanetarchive.ipac.caltech.edu/cgi-bin/nstedAPI/nph-nstedAPI?table=exoplanets&select=pl_hostname,st_age,pl_pelink,pl_mnum,pl_facility,st_teff,pl_orbper,pl_disc,pl_locale,pl_discmethod,pl_name,pl_masse&format=json&where=pl_kepflag=1 and pl_masse>0`
		const defaultPlanet = await superagent.get(planetUrl)

		const parsedDefaultPlanet = JSON.parse(defaultPlanet.text)
		console.log(parsedDefaultPlanet);
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
					bio: `your baby planet is ${planet.pl_name}, she is discovered by ${planet.pl_facility} facility by ${planet.pl_discmethod} in ${planet.pl_locale},${planet.pl_disc}. Her host star is ${planet.pl_hostname}, it is ${planet.st_age} years old. The teemperature of the star as modeled by a black body emitting the same total amount of electromagnetic radiation is ${planet.st_teff} K. Her weight is ${planet.pl_masse} in Earth Mass, which means the anount of matter contained in her meadured in the units of masses of the Earth. It takes ${planet.pl_orbper} days for her to make a complete orbit around her star. And she has ${planet.pl_mnum} of moons in her system.`,
					name: planet.pl_name,
					// user: null,
					// data: JSON.stringify({
					// 	hostName: planet.pl_hostname,
					// 	name: planet.pl_name,
					// 	discoveryMethod: planet.pl_discmethod,
					// 	EarthMass: planet.pl_masse,
					// 	orbitalPeriodAroundHostStarDay: planet.pl_orbper,
					// 	discoveryfacility: planet.pl_facility,
					// 	yearDiscovered: planet.pl_disc,
					// 	locationDiscovered: planet.pl_locale,
					// 	numberOFmoonsInSystem: planet.pl_mnum,
					// 	ageOfHostStar: planet.st_age,
					// 	linkToEncyclopaedia: planet.pl_pelink,
					// 	effectiveTemp: planet.st_teff,
					// })					
				} // planetToCreate
				planetArr.push(planetToCreate)
			} //if
		}	

		// const createdPlanets = await Planet.create(planetArr)

		res.status(200).json({
			success: true,
			code: 200,
			message: 'success',
			data: planetArr
		})

	} catch(err) {
		res.status(500).json({
	        success: false,
	        message: "internal server error",
	        error: err
    	})
	}
})







// create planet with req.body --- add this planet as this user's pet
router.post('/custom', async (req,res) => {
	try{
		planetUrl = `https://exoplanetarchive.ipac.caltech.edu/cgi-bin/nstedAPI/nph-nstedAPI?table=exoplanets&select=pl_hostname,st_age,pl_pelink,pl_mnum,pl_facility,st_teff,pl_orbper,pl_disc,pl_locale,pl_discmethod,pl_name,pl_masse&format=json&where=pl_name like 'Kepler-${req.body.number} ${req.body.abc}'`
		const customPlanet = await superagent.get(planetUrl) 
		const parsedResponse = JSON.parse(customPlanet.text)
		const planet = parsedResponse[0]
		const myData = {
			hostName: planet.pl_hostname,
			name: planet.pl_name,
			discoveryMethod: planet.pl_discmethod,
			EarthMass: planet.pl_masse,
			orbitalPeriodAroundHostStarDay: planet.pl_orbper,
			discoveryfacility: planet.pl_facility,
			yearDiscovered: planet.pl_disc,
			locationDiscovered: planet.pl_locale,
			numberOFmoonsInSystem: planet.pl_mnum,
			ageOfHostStar: planet.st_age,
			linkToEncyclopaedia: planet.pl_pelink,
			effectiveTemp: planet.st_teff,
		}

		// const bio = `your baby planet is ${planet.pl_name}, she is discovered by ${planet.pl_facility} facility by ${planet.pl_discmethod} in ${planet.pl_locale},${planet.pl_disc}. Her host star is ${planet.pl_hostname}, it is ${planet.st_age} years old. The teemperature of the star as modeled by a black body emitting the same total amount of electromagnetic radiation is ${planet.st_teff} K. Her weight is ${planet.pl_masse} in Earth Mass, which means the anount of matter contained in her meadured in the units of masses of the Earth. It takes ${planet.pl_orbper} days for her to make a complete orbit around her star. And she has ${planet.pl_mnum} of moons in her system.`


		const createdPlanet = await Planet.create({
			apiUrl: [planetUrl],
			bio: req.body.bio,
			name: planet.pl_name,
			user: req.session.userId,
			data: myData
		})

		res.status(200).json({
			success: true,
			code: 200,
			message: 'success',
			data: createdPlanet
		})

	}catch(err){
		res.status(500).json({
	        success: false,
	        message: "internal server error",
	        error: err
    	})
	}
})


// 5d6ea3318c15864730a2e929

// get the planet and store the user. 
// use put. because we have the id. ?????
// router.get('/save/:id', async (req,res)=>{
// 	// get the id of current user from the front end and update the user. or use session?????

// 	console.log(req.session)
// 	try {
//     const updateUserToPlanet = await Planet.findByIdAndUpdate(req.params.id, { user: req.session.userId }, {new: true});
//     res.status(200).json({
//         success: true, 
//         code: 200,
//         message: "resource updated successfully",
//         data: updateUserToPlanet
//     });
//   } catch(err){
//     res.status(500).json({
//       success: false,
//       message: "internal server error",
//       error: err
//     })
//   }
// })


// getting all the planets that have the user (that are saved)
router.get('/', async (req,res)=>{
	try{
		const findAllPlanet = await Planet.find({ user: { $ne: null } })
		res.status(200).json({
	        success:true,
	        code: 200,
	        message:  `found ${findAllPlanet.length} planets`, 
	        data: findAllPlanet
	      });


	}catch(err){
		res.status(500).json({
	      success: false,
	      message: "internal server error",
	      error: err
	    })
	}
})



// find one planet???????? do i need it? 
// router.get('/:id', async (req,res)=>{
// 	try{
// 		const findUserPlanet = await Planet.find
		
// 	}catch(err){
// 		res.status(500).json({
// 			success: false,
// 			message: 'internal server error',
// 			error: err
// 		})
// 	}
// })




// getting delete planet
router.delete('/:id', async (req,res)=>{
	try{
		const deletePlanet = await Planet.findByIdAndRemove(req.params.id)

		res.status(200).json({
			success: true,
			code: 200,
			message: `${deletePlanet.name} successfully deleted`,
		})
			
	}catch(err){
		res.status(500).json({
	      success: false,
	      message: "internal server error",
	      error: err
	    })
	}	
})


router.put('status/:id', async (req,res)=>{
	try{
		const updatePlanetStatus = await Planet.findByIdAndUpdate(req.params.id, {status: req.body.status}, {new: true})
		
		res.status(200).json({
			success: true,
			code: 200,
			message: 'resource updated successfully',
			data: updatedPlanetStatus 
		})
		
	}catch(err){
		res.status(500).json({
			success: false,
			message: 'internal server error',
			error: err
		})
	}
})



// edit planet
router.put('/:id', async (req,res)=>{
	// get the id of current user from the front end and update the user. or use session?????

	// req.session after the user controller
	try {
    const updateUserToPlanet = await Planet.findByIdAndUpdate(req.params.id, {bio: req.body.bio}, {new: true});
    res.status(200).json({
        success: true, 
        code: 200,
        message: "resource updated successfully",
        data: updateUserToPlanet
    });
  } catch(err){
	    res.status(500).json({
	      success: false,
	      message: "internal server error",
	      error: err
	    })
  }
})




module.exports = router;
