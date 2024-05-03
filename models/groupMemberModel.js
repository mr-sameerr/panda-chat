const mongoose = require('mongoose')

const groupMemberSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    group_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

module.exports = mongoose.model("group_members", groupMemberSchema)