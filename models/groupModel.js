const mongoose = require('mongoose')

const groupSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    creater_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    limit: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

module.exports = mongoose.model('groups', groupSchema)