const express = require('express')
const router = express.Router()
const Post = require('../models/post')
const NasaData = require('../models/nasaData')
const Planet = require('../models/planet')
const User = require('../models/user')
const Comment = require('../models/comment')
// save the post to the user. 
// of the apis 
router.get('/save/:id', async (req,res)=>{
	// the id will be the id of the nasaData, not the actual post
	try{
		let content
		console.log(req.session,"<------req.session in the save post route ");
		const findData = await NasaData.findById(req.params.id)
		
		// content will be req.body, because they can change the text before saving or posting into their account. 

		// if (findData.cat === 'WEATHER'){
		// 	const weatherdata = JSON.parse(findData.myData)

		// 	content = `${weatherdata.messageBody}`


		// 	console.log(content);
		// } else if (findData.cat === 'MARS'){
		// 	const marsdata = JSON.parse(findData.myData)

		// 	content = `here is a photo of mars, taken by curosity, on ${marsdata.firstDate}, is mars solar date some thing ${marsdata.sol}. Mars's armospheric temperature is ${marsdata.atmosphericTemp}.`


		// } else if (findData.cat === 'EARTH'){
		// 	const earthData = JSON.parse(findData.myData)

		// 	content = `${earthData.imgCaption} at ${earthData.imgDate}. On the same day, some astriods are traveling through the space. The got really close to the Earth. This little guy, named ${earthData.neoName} orbiting around ${earthData.orbBody} has an edtimated diameter of ........ not finished `
		// }

		const createdPost = await Post.create({
			user: req.session.userId,
			data: req.params.id,
			content: req.body.content,
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

// create a post of the planet have not tested yet......
router.post('/planet', async (req,res)=>{
	try{

// right here in the front end, content will be the info of the planet
		const createdPost = await Post.create({
			user: req.session.userId,
			data: req.params.id,
			content: req.body.content,
		})
		res.status(200).json({
			success: true,
			message: 'success',
			data: createdPost
		})

		
	}catch(err){
		res.status(500).json({
			message :'internal server error',
			success: false,
			error: err
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


// get a single post 
router.get('/:id', async (req,res)=>{
	try{
		const findPost = await Post.findById(req.params.id)
		res.status(200).json({
			message:'success',
			success: true,
			data: findPost
		})
	}catch(err){
		res.status(500).json({
			message: 'internal server error',
			error: err,
			success: false 
		})
	}
}) 

// delete post >>>>>> should also delete comment? 
router.delete('/:id', async (req,res)=>{
	try{
		const deletePost = await Post.findByIdAndRemove(req.params.id)
		const deleteComment = await Comment.deleteMany({'post': req.params.id})
		res.status(200).json({
			message: `${deletePost._id} successfully deleted`,
			success: true,
		})

	}catch(err){
		res.status(500).json({
			message: 'internal server error',
			error: err,
			success: false 
		})
	}
})



// button to favorite/save the post: 
router.put('/like/:id', async (req,res)=>{
	try{
		const editPost = await Post.findByIdAndUpdate(req.params.id,  
			{ "$push": { "favoritedBy": req.session.userId } },
    		{ "new": true, "upsert": true })

		const editUser = await User.findByIdAndUpdate(req.session.userId,
			{'$push':{'favoritedPostsId': req.params.id}},
			{'new': true, 'upsert': true })

		res.status(200).json({
			message: 'success',
			code: 200,
			data: editPost, editUser
		})

	}catch(err){
		res.status(500).json({
			message:'internal server error',
			error: err,
			success: false 
		})
	}
})


// edit post 
router.put('/:id', async (req,res)=>{
	try{

		const editPost = await Post.findByIdAndUpdate(req.params.id, {'content': req.body.content}, {new: true})
		res.status(200).json({
			message: 'success',
			code: 200,
			data: editPost 
		})
		
	}catch(err){
		res.status(500).json({
			message: 'internal server error',
			error: err,
			success: false 
		})
	}
})



module.exports = router 