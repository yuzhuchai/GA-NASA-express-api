const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
	content: String,
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	post: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Post'
	},
	date: {
		type: Date,
		default: Date.now,
	}
})

const Comment = mongoose.model('Commnet', commentShema)
module.exports = Comment 