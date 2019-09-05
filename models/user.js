const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
	username: {type: String, required: true},
	password: {type: String, required: true},
	favoritedPostsId: [{
		type: mongoose.Schema.Types.ObjectId,  // ._id
	    ref: 'Post'
	}],
	havePlanet: false
})

const User = mongoose.model('User',userSchema)
module.exports = User