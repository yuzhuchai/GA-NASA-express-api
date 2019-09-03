const mongoose = require('mongoose')

let connectionString 

if(process.env.NODE_ENV === "production"){
	connectionString = process.env.DB_URL
} else {
	connectionString = 'mongodb://localhost/nasadata'
}

mongoose.connect(connectionString,{
	useNewUrlParser: true,
	useCreateIndex: true,
	useFindAndModify: false 
})

mongoose.connection.on('connected',() => {
	console.log('Mongoose is connected');
})

mongoose.connection.on('err', (err) => {
	console.log('mongoose error: ',err );
})

mongoose.connection.on('disconnected', () => {
	console.log('mongoose is disconnected');
})