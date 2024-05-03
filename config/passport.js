const bcrypt = require('bcrypt')
const User = require('../models/userModel')
const localStrategy = require('passport-local').Strategy

const passportInitialize = passport => {
    passport.use(
        new localStrategy ( async (username, password, done) => {
            try {
                //Convert email into lowercase
                let emailAddr = username.toLowerCase() 
                let user = await User.findOne({ email: emailAddr })
                if(!user) return done({success: false, message: "Invalid Email ID."}, false)
                let isMatched = await bcrypt.compare(password, user.password)
                if(!isMatched) return done(null, false)

                return done(null, user)
            } catch(error) {
                return done(1111, false)
            }
        })
    )

    passport.serializeUser((user, done) => {
        done(null, user.id)
    })

    passport.deserializeUser( async (id, done) => {
        try {
            const user = await User.findById(id)
            done(null, user)
        }catch (error){
            return done(222, false)
        }
    })
}

module.exports = passportInitialize