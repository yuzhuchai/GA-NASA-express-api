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
			console.log(req.session,"<--------req.session in the register route");
			res.status(200).json({
				success: true,
				message: `${createUser.username} registed success!`,
				data: createUser
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





router.post('/login', async (req,res)=>{
// req.session!!!!!!!!
	try{
		// found the user with the user name: 
		const foundUser = await User.findOne({username: req.body.username})
		if(foundUser){
			if(bcrypt.compareSync(req.body.password, foundUser.password)){
				req.session.userId = foundUser._id
				req.session.username = foundUser.username
				req.session.loggedIn = true
				console.log(req.session,"<--------req.session in the login route");

				res.status(200).json({
					success: true,
					message: `${foundUser.username} logged in`,
					code: 200
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
				message: 'username or password invalid',
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

router.get('/logout', (req,res)=>{
	req.session.destroy((err) => {
		if(err){
			res.status(500).json({
				success: false,
				message:'internal server error',
				error: err
			})
			console.log(req.session,"<------req.session in logout");
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


// update profile 
router.put('/:id', async (req,res)=>{

	try{
		const editUser = await User.findByIdAndUpdate(req.params.id, req.body, {new: true})

		res.status(200).json({
			success: true,
			code: 200,
			data: editUser
		})
	}catch(err){
		res.status(500).json({
			success: false,
			message: 'internal server error',
			error: err
		})
	}
	
})


router.get('/logout', (req,res)=>{
	
})

module.exports = router  
