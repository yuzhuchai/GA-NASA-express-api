const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	date: {
	    type: Date,
	    default: Date.now,
	},
	data: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'NasaData'
	},
	favoritedBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	content: String,
	img: {
		type: String,
		default: null
	}
})

const Post = mongoose.model('Post',postSchema)
module.exports = Post