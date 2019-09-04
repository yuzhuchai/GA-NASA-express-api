const express = require('express')
const router = express.Router()
const Post = require('../models/post')
const NasaData = require('../models/nasaData')

// save the post to the user. 

router.get('/save/:id', async (req,res)=>{
	// the id will be the id of the nasaData, not the actual post
	try{
		let content
		console.log(req.session,"<------req.session in the save post route ");
		const findData = await NasaData.findById(req.params.id)
		
		// the data insdie is undefined ???? why ????

		if (findData.cat === 'WEATHER'){
			const weatherdata = JSON.parse(findData.myData)
			content = `${weatherdata.messageBody}`
			console.log(content);
		} else if (findData.cat === 'MARS'){
			const marsdata = JSON.parse(findData.myData)
			content = `here is a photo of mars, taken by curosity, on ${marsdata.firstDate}, is mars solar date some thing ${marsdata.sol}. Mars's armospheric temperature is ${marsdata.atmosphericTemp}.`
		} else if (findData.cat === 'EARTH'){
			const earthData = JSON.parse(findData.myData)
			content = `${earthData.imgCaption} at ${earthData.imgDate}. On the same day, some astriods are traveling through the space. The got really close to the Earth. This little guy, named ${earthData.neoName} orbiting around ${earthData.orbBody} has an edtimated diameter of ........ not finished `
		}

		console.log(findData.myData, "<dhasodjasdj cat",findData.cat, "<00000" ,"<<<<<<<content", content);

		const createdPost = await Post.create({
			user: req.session.userId,
			data: req.params.id,
			content: content,
			img: findData.imgUrl
		})
		res.status(200).json({
			success: true,
			message: 'success',
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


// get all the post
router.get('/', async (req,res)=>{
	try{
		
		const findAllPost = await Post.find()
		res.status(200).json({
			message:'success',
			success: true,
			data: findAllPost
		})

	}catch(err){
		res.status(500).json({
			message:'internal server error',
			error: err,
			success: false 
		})
	}
})



// delete post 
// edit post 

// get a single post 









module.exports = router 