const mongoose = require('mongoose')

const groupChatSchema = mongoose.Schema({
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    group_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "groups"
    },
    message: {
        type: String,
        default: null
    },
    image: {
        type: String,
        requried: false
    },
    file: {
        type: String,
        required: false
    }
}, { timestamps: true })

module.exports = mongoose.model('groupChat', groupChatSchema)