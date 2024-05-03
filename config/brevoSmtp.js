require('dotenv').config()
const ejs = require('ejs')
const path = require('path')
const nodemailer = require('nodemailer')

class emailConfig {

    async brevoTransporter() {
        return nodemailer.createTransport({
            host: process.env.SMTP_SERVER,
            port: process.env.PORT,
            secure: false,
            auth: {
                user: process.env.BREVO_USER,
                pass: process.env.PASSWORD
            }
        })
    }

    async renderTemplate(template, data) {
        return ejs.renderFile(
                path.join(__dirname, '../views/templates', `${template}.ejs`),
            data)
    }
}

module.exports = new emailConfig
