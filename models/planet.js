const mongoose = require('mongoose')

const planetSchema = new mongoose.Schema({
	apiUrl: Array,
	name: String,
	bio: String,
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref:'User'
	},
	data:String,
	status: {
		type: Number,
		default: 100
	}
})

const Planet = mongoose.model('Planet',planetSchema)
module.exports = Planet 