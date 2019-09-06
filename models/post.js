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
	cat: String,

	favoritedBy: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}],
	comments: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Comment'
	}],
	content: String,
	img: {
		type: String,
		default: null
	}
})

const Post = mongoose.model('Post',postSchema)
module.exports = Post