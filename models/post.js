const mongoose = requrie('mongoose')

const postSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	date: {
	    type: Date,
	    default: Date.now,
	},
	content: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'NasaData'
	},
	favoritedBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	post: String,
})

const Post = mongoose.model('Post',postSchema)
module.exports = Post