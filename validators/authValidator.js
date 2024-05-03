const { body, validationResult } = require('express-validator')
const bcrypt = require('bcrypt')
const User = require('../models/userModel')

const loginRules = [
    body('username')
        .custom((email, { req }) => {
            if (!email && !req.body.password) {
                return Promise.reject('Email is required.')
            }
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

const registrationRules = [
    body('username').isLength({ min: 3 }).withMessage('First name must be at least 3 characters long.'),
    body('last_name').isLength({ min: 3 }).withMessage('Last name must be at least 3 characters long.'),
    body('email').isEmail().withMessage('Email is required.')
        .custom(async (email) => {
            const user = await User.findOne({ email })
            if (user) {
                throw new Error('Email already registered...')
            }
        }),
    body('password').isLength({ min: 6 }).withMessage('Password must be 6 characters long.')
]

const requestValidate = (req, res, next) => {
    const errors = validationResult(req)

    if (errors.isEmpty()) {
        return next()
    }

    const errorCollection = errors.array().map(error => ({
        [error.path]: error.msg
    }))

    return res.status(400).json({
        success: false, errors: errorCollection
    })
}

module.exports = { requestValidate, loginRules, registrationRules }
