const express = require('express')
const router = express.Router()
const User = require('../models/user')
const bcrypt  = require('bcrypt');



// user register route.
router.post('/register', async (req,res)=>{
	try{
		// check if the user name is taken 
		// if not taken, hash the password. 
		const findExistinUser = await User.findOne({username: req.body.username})
		if (!findExistinUser) {

			const hashPW = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))
			let createUser = await User.create({
				username: req.body.username,
				password: hashPW
			})

			createUser = await createUser.populate({path: 'favoritedPostsId',populate: {path:'user'}}).populate({path: 'favoritedPostsId',populate: {path:'comments'}}).populate({path: 'favoritedPostsId', populate:{path:'user', populate:{path:'favoritedPostsId'}}})

			req.session.userId = createUser._id
			req.session.username = createUser.username
			req.session.loggedIn = true;
			res.status(200).json({
				success: true,
				message: `${createUser.username} registed success!`,
				data: createUser
			})
			
		} else {
			res.status(200).json({
				success: false,
				message: 'username already exists'
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




// user login route 
router.post('/login', async (req,res,next)=>{
	try{
		// found the user with the user name: 
		const foundUser = await User.findOne({username: req.body.username}).populate({path: 'favoritedPostsId',populate: {path:'user'}}).populate({path: 'favoritedPostsId',populate: {path:'comments'}}).populate({path: 'favoritedPostsId', populate:{path:'user', populate:{path:'favoritedPostsId'}}})
		if(foundUser){
			if(bcrypt.compareSync(req.body.password, foundUser.password)){
				req.session.userId = foundUser._id
				req.session.username = foundUser.username
				req.session.loggedIn = true

				res.status(200).json({
					success: true,
					message: `${foundUser.username} logged in`,
					code: 200,
					data: foundUser
				})
			}else {
				res.status(200).json({
					success: false,
					code: 200,
					message:'username or password invalid',
				})
			} //end of else if user not found and passowrd not correct 
		} else {
			res.status(200).json({
					success: false,
					code: 200,
					message:'username or password invalid',
				})
		}//end of else if usernot found

	}catch(err){
		res.status(500).json({
			success: false,
			message: 'internal server error',
			error: err
		})
	}

})



// Logout route 
router.get('/logout', (req,res)=>{
	console.log(req.session,"<------req.session in logout");
	req.session.destroy((err) => {
		if(err){
			res.status(500).json({
				success: false,
				message:'internal server error',
				error: err
			})
		} else {
			res.status(200).json({
				success: true,
				message: 'user logged out'
			})
		}
	})
})


// delete user
router.delete('/:id', async (req,res)=>{
	try{
		const deleteUser = await User.findByIdAndRemove(req.params.id)

		res.status(200).json({
			success: true,
			message: `${deleteUser.username} successfully deleted`
		})
	 	
	 }catch(err){
	 	res.status(500).json({
	 		success: false,
	 		message: 'internal server error',
	 		error: err
	 	})
	 } 
	
})





module.exports = router  
