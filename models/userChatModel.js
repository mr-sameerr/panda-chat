const mongoose = require('mongoose')

const userChatSchema = mongoose.Schema({
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    receiver_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    message: {
        type: String,
        required: false
    },
    image: {
        type: String,
        required: false
    },
    file: {
        type: String,
        requried: false
    }
}, { timestamps: true })

module.exports = mongoose.model("userchats", userChatSchema)