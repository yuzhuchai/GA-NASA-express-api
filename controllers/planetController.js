const express = require('express')
const router = express.Router();
const Planet = require('../models/planet')
const superagent = require('superagent')



// this is getting the random default planets 
router.get('/default', async (req,res)=>{
	try{

		// this is getting all the planet in the kepler field
		const planetUrl = `https://exoplanetarchive.ipac.caltech.edu/cgi-bin/nstedAPI/nph-nstedAPI?table=exoplanets&select=pl_hostname,st_age,pl_pelink,pl_mnum,pl_facility,st_teff,pl_orbper,pl_disc,pl_locale,pl_discmethod,pl_name,pl_masse&format=json&where=pl_kepflag=1 and pl_masse>0`
		const defaultPlanet = await superagent.get(planetUrl)
		const parsedDefaultPlanet = await JSON.parse(defaultPlanet.text)
		const num = Math.floor(Math.random()*parsedDefaultPlanet.length-2)
		// Rows are listed in ascending order by default, based on the values within the row

		const planet = parsedDefaultPlanet[num]

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

		const bio = `your baby planet is ${planet.pl_name}, she is discovered by ${planet.pl_facility} facility by ${planet.pl_discmethod} in ${planet.pl_locale},${planet.pl_disc}. Her host star is ${planet.pl_hostname}, it is ${planet.st_age} years old. The teemperature of the star as modeled by a black body emitting the same total amount of electromagnetic radiation is ${planet.st_teff} K. Her weight is ${planet.pl_masse} in Earth Mass, which means the anount of matter contained in her meadured in the units of masses of the Earth. It takes ${planet.pl_orbper} days for her to make a complete orbit around her star. And she has ${planet.pl_mnum} of moons in her system.`


		const createdPlanet = await Planet.create({
			apiUrl: [planetUrl,num],
			bio: bio,
			name: planet.pl_name,
			user: null,
			data: JSON.stringify(myData)
		})

		res.status(200).json({
			success: true,
			code: 200,
			message: 'succes',
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


// create planet with req.body 
router.post('/custom', async (req,res)=>{
	try{
		planetUrl = `https://exoplanetarchive.ipac.caltech.edu/cgi-bin/nstedAPI/nph-nstedAPI?table=exoplanets&select=pl_hostname,st_age,pl_pelink,pl_mnum,pl_facility,st_teff,pl_orbper,pl_disc,pl_locale,pl_discmethod,pl_name,pl_masse&format=json&where=pl_name like 'Kepler-${req.body.number} ${req.body.abc}'`
		const customPlanet = await superagent.get(planetUrl) 
		const parsedResponse = await JSON.parse(customPlanet.text)
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

		const bio = `your baby planet is ${planet.pl_name}, she is discovered by ${planet.pl_facility} facility by ${planet.pl_discmethod} in ${planet.pl_locale},${planet.pl_disc}. Her host star is ${planet.pl_hostname}, it is ${planet.st_age} years old. The teemperature of the star as modeled by a black body emitting the same total amount of electromagnetic radiation is ${planet.st_teff} K. Her weight is ${planet.pl_masse} in Earth Mass, which means the anount of matter contained in her meadured in the units of masses of the Earth. It takes ${planet.pl_orbper} days for her to make a complete orbit around her star. And she has ${planet.pl_mnum} of moons in her system.`


		const createdPlanet = await Planet.create({
			apiUrl: [planetUrl],
			bio: bio,
			name: planet.pl_name,
			user: null,
			data: JSON.stringify(myData)
		})

		res.status(200).json({
			success: true,
			code: 200,
			message: 'succes',
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
router.get('/save/:id', async (req,res)=>{
	// get the id of current user from the front end and update the user. or use session?????

	console.log(req.session)
	try {
    const updateUserToPlanet = await Planet.findByIdAndUpdate(req.params.id, { user: req.session.userId }, {new: true});
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


// getting all the planets 
router.get('/', async (req,res)=>{
	try{
		const findAllPlanet = await Planet.find()
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


// getting individual planet 




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
