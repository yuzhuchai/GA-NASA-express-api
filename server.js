require ('dotenv').config()
const express        = require('express');
const app            = express();
const bodyParser     = require('body-parser');
const cors           = require('cors');
const session        = require('express-session')
const PORT    		 = process.env.PORT || 9000

require('./db/db')


app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false
}));

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

const corsOptions = {
	origin: process.env.ORIGIN,
	credentials: true,
	optionSuccessStatus: 200
}

app.use(cors(corsOptions));

app.post("/demo-postman",(req,res,next)=>{
	res.status(200).json({
		status: 200,
		message:"request received",
		dataRecieved: req.body
	})
})

const userController = require('./controllers/userController')
const nasadataController = require('./controllers/nasaController')
const planetController = require('./controllers/planetController')
const postController = require('./controllers/postController')
const commentController = require('./controllers/commentController')


app.use('/api/v1/user', userController)
app.use('/api/v1/nasadata', nasadataController)
app.use('/api/v1/planet', planetController)
app.use('/api/v1/post', postController)
app.use('/api/v1/comment', commentController)






app.listen(PORT, () => {
	console.log('listening on port '+process.env.PORT);
})