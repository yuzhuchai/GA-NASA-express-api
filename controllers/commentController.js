const express = require('express')
const router = express.Router()
const Comment = require('../models/comment')


router.post('/:postId', async (req,res)=>{
	try{
		// this id is the post id 
		console.log(req.session, "<------session in create comment");
		const createdComment = await Comment.create({
			content: req.body.content,
			user: req.session.userId,
			post: req.params.postId
		})
		res.status(200).json({
			message: 'success',
			code: 200, 
			data: createdComment
		})

	}catch(err){
		res.status(500).json({
			message: 'internal server error',
			error: err,
			success:false 
		})
	}
})

// 5d6ed6806e94435a37dba203 this is the test post id 


router.get('/', async (req,res)=>{
	try{
		const findAllComments = await Comment.find()
		res.status(200).json({
			message: 'success',
			code: 200,
			data: findAllComments
		})

	}catch(err){
		res.status(500).json({
			message: 'internal server error',
			error: err,
			success: false 
		})
	}
})


// get all the commet from one Post
router.get('/post/:id', async (req,res)=>{
	try{
		const findCommnets = await Comment.find({post: req.params.id})
		res.status(200).json({
			message: 'success',
			code: 200,
			data: findCommnets
		})
		
	}catch(err){
		res.status(500).json({
			message: 'internal server error',
			error: err,
			success: false 
		})
	}
}) 


// get one commet  
router.get('/:id', async (req,res)=>{
	try{
		const findOneComment = await Comment.findById(req.params.id)
		res.status(200).json({
			message: 'success',
			code: 200,
			data: findOneComment
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

