const bcrypt = require('bcrypt')
const moment = require('moment')
const promise = require('bluebird')
require('dotenv').config()
const User = require('../models/userModel')
const userUtils = require('../utils/userUtils')

const emailConfig = require('../config/brevoSmtp')
const authService = require('../services/authService')
const accountVerification = require('../models/accountVerificationModel')

class authController {

    async index(req, res) {
        
        res.render('home', {
            layout: false
        })
    }

    async renderRegister(req, res) {
        res.render('auth/registration', {
            layout: 'auth/layouts/main'
        })
    }

    async register(req, res) {
        const body = req.body
        return promise.resolve(authService.userRegistrationService(body))
            .then(data => {
                if (data) {
                    res.status(200).send({ success: true, message: "User has been registered." })
                } else {
                    res.status(400).send({ success: false, message: "Something went wrong.", data })
                }
            })
    }

    async login(req, res) {
        res.render('auth/login', {
            layout: 'auth/layouts/main'
        })
    }

    async logout(req, res) {
        res.clearCookie("user")
        req.session.destroy()
        res.redirect('/login')
    }

    async authentication(req, res) {
        let user = req.user
        res.cookie("user", JSON.stringify(user))
        res.status(200).send({ success: false, message: "User Login successful." })
    }

    async emailVerificationRender(req, res) {
        const authUser = req.user
        res.render('auth/email-verification', {
            layout: 'auth/layouts/main', authUser
        })
    }

    async verifyAccount(req, res) {
        const currentUser = req.user
        return promise.resolve(authService.accountVerificationInfoService(currentUser))
            .then(data => {
                if (data) {
                    res.status(200).send({ success: true, data })
                } else {
                    res.status(400).send({ success: false, data })
                }
            })
    }

    async emailVerification(req, res) {
        let token = req.params.userToken
        return promise.resolve(authService.emailVerificationService(token))
            .then(data => {
                res.render('auth/verification-success', {
                    layout: false, data
                })
            })

    }
}

module.exports = new authController