const mongoose = require('mongoose')

const nasaDataSchema = new mongoose.Schema({
	content: String,
	api: String,
	imgUrl: {
		type: String,
		default: null
	},
	date: Date,
	// this will be the stringified api call response from NASA
	callResponse: String, 
})

const NasaData = mongoose.model('NasaData',nasaDataSchema)
module.exports = NasaData
