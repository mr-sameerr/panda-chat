const { body, validationResult } = require('express-validator')
const bcrypt = require('bcrypt')
const User = require('../../models/userModel')

const loginRules = [
    body('username')
        .custom((email, { req }) => {
            if (!email && !req.body.password) {
                return Promise.reject('Email is required.')
            }
            // if (email) {
            //     const isEmail = req.check("email").isEmail()
            //         .withMessage("Please enter valid email address.")
            //     return isEmail
            // }
            return true
        })
        .bail()
        .isEmail().withMessage("Please enter valid email address.")
        .bail()
        .custom(async email => {
            return await User.findOne({ email }).then(
                user => {
                    if (!user) return Promise.reject("Invalid email address.")
                }
            )
        }),
    body('password')
        .notEmpty().withMessage('Password is required.')
        .custom(async (password, { req }) => {
            const email = req.body.username
            if (password && email) {
                const user = await User.findOne({ email })
                if (user) {
                    const isMatched = await bcrypt.compare(password, user.password)
                    if (!isMatched) {
                        return Promise.reject("Password is incorrect.")
                    }
                }
            }
            return true
        })
]

const loginValidate = (req, res, next) => {
    const error = validationResult(req)

    if (error.isEmpty()) {
        return next()
    }

    const errorCollection = error.array().map(error => ({
        [error.path]: error.msg
    }));

    return res.status(400).json(
        { success: false, errors: errorCollection }
    )
}

module.exports = { loginRules, loginValidate }