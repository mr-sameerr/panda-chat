const express = require('express')
const app = express()

const PORT = process.env.PORT || 4000

const ejs = require('ejs')
require('dotenv').config()
require('./config/database')

const fs = require('fs')
const path = require('path')
const multer = require('multer')
const passport = require('passport')
const bodyParser = require('body-parser')
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/users')
const cookieParser = require('cookie-parser')
const groupRoutes = require('./routes/groups')
const expressSession = require('express-session')
const expressLayouts = require('express-ejs-layouts')   
const { userData } = require('./middlewares/UserData')
const passportInitialize = require('./config/passport')
const AuthMiddleware = require('./middlewares/Auth')
const socketServices = require('./services/socketServices')

const moment = require('moment')
const upload = multer()
app.use(upload.none());

app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }))
app.use(bodyParser.json({ limit: '10mb' }))


//For Session
app.use(expressSession({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 5000 }
}))

//Passport initialization
app.use(passport.initialize())
app.use(passport.session())
passportInitialize(passport)

app.use(cookieParser())
app.use(userData)
app.use(AuthMiddleware.currentUrl)

const publicDirectory = path.join(__dirname, './public')
const uploadDirectory = path.join(__dirname, './uploads')
const viewDirectory = path.join(__dirname, './views')


app.set("view engine", "ejs")
// app.engine('ejs', require('ejs').__express);

//Node Modules
const emojiPicker = "node_modules/emoji-picker-element"
const cropperJS = "node_modules/cropperjs"


app.use('/cropperjs', express.static(cropperJS)) //cropper Js 
app.use('/emoji-picker', express.static(emojiPicker)) //Emoji picker element
app.use(express.static(publicDirectory))    //Public directory for files
app.use(express.static(uploadDirectory))    //Upload directory for user uploads
app.use(express.static(viewDirectory))
app.use(expressLayouts)                     //Create dynamic templates

app.use(authRoutes)
app.use(userRoutes)
app.use(groupRoutes)

//Variables to use in views
app.locals.moment = moment

const server = app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`)
})

//----- Socket Services -----//
socketServices(server)
//--- Socket Services End ---//
