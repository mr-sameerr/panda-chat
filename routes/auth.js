const express = require('express')
const router = express.Router()
const passport = require('passport')
const authMiddleware = require('../middlewares/Auth')
const { loginRules, registrationRules, requestValidate } = require('../validators/authValidator')

const authController = require('../controllers/authController')

router.get('/', authController.index)
router.get('/registration', authController.renderRegister)
router.post('/registration', registrationRules, requestValidate, authController.register)
router.get('/login', authController.login)
router.post('/authentication', loginRules, requestValidate,
    passport.authenticate("local"), authMiddleware.isLoggedIn, authController.authentication)
router.post('/logout', authController.logout)

router.get('/email-verification', authController.emailVerificationRender)
router.post('/share-verification-link', authController.verifyAccount)
router.get('/user-verification/:userToken', authController.emailVerification)

module.exports = router