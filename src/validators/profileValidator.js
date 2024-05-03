const { body, validationResult } = require('express-validator')

const validationRules = () => {
    return [
        body('first_name').isLength({ min: 3 }).withMessage('First name must be at least 3 characters long.'),
        body('last_name').isLength({ min: 3 }).withMessage('Last name must be at least 3 characters long.'),
    ]
}

const validate = (req, res, next) => {
    const errors = validationResult(req)
    
    if (errors.isEmpty()) {
        return next()
    }
    const errorCollection = []

    errors.array().map( (error) => errorCollection.push({ [error.path]: error.msg}))

    return res.json({ error: errorCollection })
}
module.exports = {validationRules, validate}