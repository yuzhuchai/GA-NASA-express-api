const mongoose = require('mongoose')

const nasaDataSchema = new mongoose.Schema({
	cat: String,
	myData: String,
	api: Array,
	imgUrl: {
		type: String,
		default: null
	},
	date: {
		type: Date,
		default: Date.now,
	},
	defaultInfo: Boolean
})

const NasaData = mongoose.model('NasaData', nasaDataSchema)
module.exports = NasaData
