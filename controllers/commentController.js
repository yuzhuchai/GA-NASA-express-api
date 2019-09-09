const express = require('express')
const router = express.Router()
const Comment = require('../models/comment')
const Post = require('../models/post')


router.post('/:postId', async (req,res,next)=>{
	try{
		// this id is the post id 
		console.log(req.session, "<------session in create comment");

		let createdComment = await Comment.create({
			content: req.body.content,
			user: req.session.userId,
			post: req.params.postId
		})

		createdComment = await createdComment.populate('user').execPopulate()
		// console.log(createdComment,'<-----createdComment');

		const updatePosts = await Post.findByIdAndUpdate(req.params.postId, 
			{ "$push": { "comments": createdComment._id } },
    		{ "new": true, "upsert": true })
		res.status(200).json({
			message: 'success',
			code: 200, 
			data: createdComment
		})

	}catch(err){
		next(err)
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
		const findCommnets = await Comment.find({post: req.params.id}).populate('user')
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


// edit comment  
router.put('/:id', async (req,res)=>{
	try{
		const editComment = await Comment.findByIdAndUpdate(req.params.id, {'content': req.body.content}, {new: true})
		res.status(200).json({
			message: 'success',
			code: 200,
			data: editComment
		})
		
	}catch(err){
		res.status(500).json({
			message: 'internal server error',
			success: false,
			error: err
		})
	}
})


// delete comment: 
router.delete('/:id', async (req,res)=>{
	try{
		const deleteComment = await Comment.findByIdAndRemove(req.params.id)
		res.status(200).json({
			message: `${deleteComment.id} deleted successfully`,
			code: 200
		})
		
	}catch(err){
		res.status(500).json({
			message: 'internal server error',
			success: false,
			error: err
		})
	}
})

module.exports = router 

