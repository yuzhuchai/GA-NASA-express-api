const express = require('express')
const router = express.Router()
const User = require('../models/user')
const bcrypt  = require('bcrypt');



router.post('/register', async (req,res)=>{
	// req.session!!!!!!!!
	try{
		// check if the user name is taken 
		// if not taken, hash the password. 
		const findExistinUser = await User.findOne({username: req.body.username})
		if (!findExistinUser) {

			const hashPW = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))
			const createUser = await User.create({
				username: req.body.username,
				password: hashPW
			})

			req.session.userId = createUser._id
			req.session.username = createUser.username
			req.session.loggedIn = true;

			res.status(200).json({
				success: true,
				message: `${createUser.username} registed success!`
			})
			
		} else {
			res.status(200).json({
				success: false,
				messgae: 'username already exists'
			})
		}
	}catch(err){
		res.status(500).json({
			success: false,
			message: 'internal server error',
			error: err
		})
	}
})


router.post('/login', (req,res)=>{
	
// req.session!!!!!!!!
})


// delete user
router.delete('/:id', (req,res)=>{
	
})


// update profile 
router.put('/:id',(req,res)=>{
	
})


router.get('/logout', (req,res)=>{
	
})

module.exports = router  
