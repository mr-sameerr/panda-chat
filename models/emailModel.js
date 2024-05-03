const mongoose = require('mongoose')

const emailSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    name: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    expiration:{
        type: String,
        required: true
    }

}, { timestamps: true })

module.exports = mongoose.model('emails', emailSchema)