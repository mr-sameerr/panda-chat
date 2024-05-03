require('dotenv').config()
const moment = require('moment')
const { default: mongoose } = require('mongoose')
const User = require('../models/userModel')
const emailConfig = require('../helpers/email')
const userUtils = require('../utils/userUtils')
const accountVerification = require('../models/accountVerificationModel')
class authService {

    async findUser(user) {

    }
    async userRegistrationService(value) {
        const { username: first_name, last_name, email, password } = value
        const avatar = process.env.USER_AVATAR
        const user = new User({
            first_name, last_name, email, password, avatar
        })

        return user.save().then(data => {
            return data
        })
            .catch(error => {
                return error
            })
    }

    async accountVerificationInfoService(user) {
        const expiration = [24, "hours"]
        try {
            const { token, expiredAt } = userUtils.generateRandomString(expiration)
            const link = `${process.env.BASE_DOMAIN}/user-verification/${token}`;

            const verificationCodes = await accountVerification.find({ user_id: user._id })
            if (verificationCodes.length > 0) {
                await accountVerification.deleteMany({ user_id: user._id })
            }
            let verificationLink = new accountVerification({
                user_id: user._id, token, expiredAt,
                remarks: "user account verification token."
            })
            await verificationLink.save()
            console.log(" added.")
            const transporter = await emailConfig.brevoTransporter()
            const template = await emailConfig.renderTemplate('index', { link })
            const info = await transporter.sendMail({
                from: "sam@gmail.com",
                to: user.email,
                subject: "Account verification Mail.",
                html: template
            })
            return info
        } catch (error) {
            return false
        }
    }

    async emailVerificationService(token) {
        const tokenInfo = await accountVerification.findOne({ token })

        if (!tokenInfo) {
            return { success: false, message: "Verification token not found." }
        }
        const expirationMoment = moment(tokenInfo.expiredAt);

        let user = await User.findOne({ _id: tokenInfo.user_id })
        if (!user) {
            return { success: false, message: "Invalid user." }
        }

        if (user.verifiedAt) {
            return { success: false, message: "User already verified." }
        }

        // console.log(expirationMoment.isSameOrAfter(moment().toISOString()), 222)
        if (expirationMoment.isSameOrAfter(moment().toISOString())) {
            await User.findByIdAndUpdate(
                tokenInfo.user_id, { $set: { verifiedAt: moment().toISOString() } }
            )
            return { success: true, message: "User has been verified." }
        } else {
            return { success: false, message: "Token has been expired." }
        }
    }


}

module.exports = new authService()