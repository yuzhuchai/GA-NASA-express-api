const express = require('express')
const router = express.Router();
const Planet = require('../models/planet')
const superagent = require('superagent')



// make the api call to NASA aip with the req.body of the planet name as query string
router.post('/adopt', async (req,res) => {
	try{
		planetUrl = `https://exoplanetarchive.ipac.caltech.edu/cgi-bin/nstedAPI/nph-nstedAPI?table=exoplanets&select=pl_hostname,st_age,pl_pelink,pl_mnum,pl_facility,st_teff,pl_orbper,pl_disc,pl_locale,pl_discmethod,pl_name,pl_masse&format=json&where=pl_name like '${req.body.name}'`
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

		const createdPlanet = await Planet.create({
			apiUrl: [planetUrl],
			bio: req.body.bio,
			name: planet.pl_name,
			user: req.session.userId,
			data: JSON.stringify(myData)
		})

		res.status(200).json({
			success: true,
			code: 200,
			message: 'success',
			data: createdPlanet
		})
		console.log(req.session ,'<-----req.session in adopting a planet');
	}catch(err){
		res.status(500).json({
	        success: false,
	        message: "internal server error",
	        error: err
    	})
	}
})


// getting all the planets that have the user (that are saved)
router.get('/:id', async (req, res) => {
	// console.log("hitting");
	try {
		const findAllPlanet = await Planet.find({ user: req.params.id })
		res.status(200).json({
	        success:true,
	        code: 200,
	        message:  `found ${findAllPlanet.length} planets`, 
	        data: findAllPlanet
	    });


	} catch(err) {
		res.status(500).json({
		    success: false,
		    message: "internal server error",
		    error: err
	    })
	}
})



// delete planet
router.delete('/:id', async (req, res) => {
	try {
		const deletePlanet = await Planet.findByIdAndRemove(req.params.id)

		res.status(200).json({
			success: true,
			code: 200,
			message: `${deletePlanet.name} successfully deleted`,
		})
			
	} catch(err) {
		res.status(500).json({
	      	success: false,
	      	message: "internal server error",
	      	error: err
	    })
	}	
})



// update planet happiness route
router.put('/status/:id', async (req,res, next)=>{
	try{
		console.log(`hitting this route`);
		const updatePlanetStatus = await Planet.findByIdAndUpdate(req.params.id, {status: req.body.status}, {new: true})
		
		res.status(200).json({
			success: true,
			code: 200,
			message: 'resource updated successfully',
			data: updatePlanetStatus 
		})
		
	}catch(err){
		next(err)
	}
})



// edit planet
router.put('/:id', async (req,res)=>{
	try {
    const updateUserToPlanet = await Planet.findByIdAndUpdate(req.params.id, {name: req.body.name, bio: req.body.bio}, {new: true});
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
