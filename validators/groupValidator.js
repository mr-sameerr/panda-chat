const { body, validationResult } = require('express-validator')
const Group = require('../models/groupModel')

const storeGroupRules = [
    body('name').notEmpty().withMessage("Group name is required.")
        .bail()
        .isLength({ min: 3 }).withMessage("Group name should be at least 3 characters long.")
        .bail()
        .custom(async name => {
            const group = await Group.findOne({ name })
            if (group) {
                throw new Error("Group name is already taken.")
            }
        })
]

const requestValidate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }

    const errorCollection = errors.array().map(error => ({
        [error.path]: error.msg
    }))

    return res.status(400).json({
        success: false, errors: errorCollection
    })
}

module.exports = { requestValidate, storeGroupRules }