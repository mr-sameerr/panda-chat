const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        // unique: true,
        required: true
    },
    company: {
        type: String,
        default: null
    },
    job: {
        type: String,
        default: null
    },
    country: {
        type: String,
        default: null
    },
    avatar: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: true
    },
    verifiedAt: {
        type: String,
        default: false
    },
    isOnline: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

userSchema.pre('save', async function (next) {
    try {
        const password = await bcrypt.hash(this.password, 10)
        this.password = password
        next()
    } catch(error){
        console.log('Error hashing password', error)
        next(error)
    }
})


module.exports = mongoose.model('users', userSchema)