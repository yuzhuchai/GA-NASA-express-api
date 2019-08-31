const mongoose = require('mongoose')

const nasaDataSchema = new mongoose.Schema({
	cat: String,
	content: String,
	api: String,
	imgUrl: {
		type: String,
		default: null
	},
	date: {
		type: Date,
		default: Date.now,
	},
})

const NasaData = mongoose.model('NasaData',nasaDataSchema)
module.exports = NasaData
