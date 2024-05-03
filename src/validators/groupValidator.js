const { body, validationResult } = require('express-validator')


const groupValidationRules = () => {
    return [
        body('name').notEmpty().isLength({ min: 5 }).withMessage('Group name must be at least 5 characters long.'),
        body('limit').notEmpty().withMessage('Limit is required.'),
    ]
}

const groupValidate = (req, res, next) => {
    const errors = validationResult(req)
    
    if (errors.isEmpty()) {
        return next()
    }
    const errorCollection = []
    errors.array().map( (error) => errorCollection.push({ [error.path]: error.msg}))

    return res.json({ error: errorCollection })
}
module.exports = {groupValidationRules, groupValidate}