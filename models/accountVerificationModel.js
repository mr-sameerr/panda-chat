const mongoose = require('mongoose')

const accountVerificationSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    token: {
        type: String,
        required: true
    },
    expiredAt: {
        type: String,
        required: true
    },
    remarks: {
        type: String,
        required: false
    }
}, { timestamps: true })

module.exports = mongoose.model("account_verification", accountVerificationSchema)