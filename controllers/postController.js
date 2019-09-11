const express = require('express')
const router = express.Router()
const Post = require('../models/post')
const NasaData = require('../models/nasaData')
const Planet = require('../models/planet')
const User = require('../models/user')
const Comment = require('../models/comment')


// save the post to the user. 

router.post('/', async (req,res,next)=>{
	try{
		const createdPost = await Post.create({
			user: req.session.userId,
			content: req.body.content,
			cat: req.body.cat,
			img: req.body.imgUrl 
		})

		res.status(200).json({
			success: true,
			message:'success',
			data:createdPost 
		})
		console.log(req.session,'<------req.session.userId in the post');

	}catch(err){
		next(err)
	}
})


// get post of the user 
router.get('/user/:id', async (req,res,next)=>{
	try{
		const findPost = await Post.find({user: req.params.id}).populate('user').populate('favoritedBy').populate({path: 'comments',populate: {path:'user'}})
		res.status(200).json({
			message:'success',
			success: true,
			data: findPost
		})
		console.log(req.session,'<-=====req.session in getting all the post of the user');
	}catch(err){
		next(err)
	}
})

// get all the post
router.get('/', async (req,res)=>{
	try{
		
		const findAllPost = await Post.find().populate('user').populate('favoritedBy').populate({path: 'comments',populate: {path:'user'}}).populate({path:'user',populate:{path: 'favoritedPostsId'}})
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
		const findPost = await Post.findById(req.params.id).populate('user').populate('favoritedBy').populate({path: 'comments',populate: {path:'user'}})
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
		let editPost = await Post.findByIdAndUpdate(req.params.id,  
			{ "$push": { "favoritedBy": req.session.userId } },
    		{ "new": true, "upsert": true })

		editPost = await editPost.populate('user').execPopulate()

		let editUser = await User.findByIdAndUpdate(req.session.userId,
			{'$push':{'favoritedPostsId': req.params.id}},
			{'new': true, 'upsert': true })
		 editUser = await editUser.populate('favoritedPostsId')

		const data = {
			editUser,
			editPost
		}

		res.status(200).json({
			message: 'success',
			code: 200,
			data: data
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
			data: editPost.populate('user').populate('favoritedBy').populate({path: 'comments',populate: {path:'user'}})
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