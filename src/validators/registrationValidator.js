const { body, validationResult } = require('express-validator')
const User = require('../../models/userModel')

const validationRules = () => {
    return [
        body('username').isLength({ min: 3 }).withMessage('First name must be at least 3 characters long.'),
        body('last_name').isLength({ min: 3 }).withMessage('Last name must be at least 3 characters long.'),
        body('email').isEmail().withMessage('Email is required.')
        .custom(async email => {
            const user = await User.findOne({ email })
            if(user){
                throw new Error('Email already exist.')
            }
        }).withMessage('Email already exist.'),
        body('password').isLength({ min: 6 }).withMessage('Password must be 6 characters long.')
    ]
}

const validate = (req, res, next) => {
    const error = validationResult(req)

    if (error.isEmpty()) {
        return next()
    }

    const errorCollection = []

    error.array().map((error) => { errorCollection.push({ [error.path]: error.msg }) })

    return res.status(400).json({success: false, errors: errorCollection })
}

module.exports = { validationRules, validate }