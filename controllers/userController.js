require('dotenv').config()
const promise = require('bluebird')
const userService = require('../services/userService')

class userController {

    async dashboard(req, res) {
        let currentUser = req.user
        return promise.resolve(userService.findOtherUsersService(currentUser))
            .then(data => {
                if (data) {
                    let users = data
                    res.render('dashboard/index', {
                        layout: 'layouts/main', users
                    })
                } else {
                    let users = data
                    res.render('dashboard/index', {
                        layout: 'layouts/main', users
                    })
                }
            })
    }

    async reorderUsers(req, res) {
        let currentUser = req.user
        return promise.resolve(userService.usersLastMsgs(currentUser))
            .then(data => {
                if (data) {
                    let users = data
                    // console.log(users)
                    res.send({ success: true, users })
                } else {
                    let users = data
                    res.send({ success: false, users })
                }
            })
    }

    async userChat(req, res) {
        let currentUser = req.user
        // let userData = await UserChat.aggregate([
        //     {
        //         $match:
        //         {
        //             $or: [
        //                 { sender_id: currentUser._id },
        //                 { receiver_id: currentUser._id }
        //             ]
        //         }
        //     },
        //     {
        //         $group:
        //         {
        //             _id: {
        //                 $cond: [
        //                     { $eq: ["$sender_id", currentUser._id] },
        //                     "$receiver_id",
        //                     "$sender_id"
        //                 ]
        //             },
        //             lastMsgTimestamp: { $max: "$createdAt" },
        //             message: { $last: "$$ROOT" }
        //         }
        //     },
        //     { $sort: { lastMsgTimestamp: -1 } },
        //     { $limit: 10 },
        // { $lookup:
        //     { from: "users", localField: "message.sender_id", foreignField: "_id", as: "userInfo" }
        // },
        //     {
        //         $lookup: {
        //             from: "users",
        //             let: { userId: "$_id" },
        //             pipeline: [
        //                 { $match: { $expr: { $eq: [ "$_id", "$$userId" ] } } },
        //                 { $project: { first_name: 1, last_name: 1, avatar: 1 } }
        //             ],
        //             as: "userInfo"
        //         }
        //     }
        // ])

        return promise.resolve(userService.usersLastMsgs(currentUser))
            .then(data => {
                if (data) {
                    let users = data
                    // console.log(users, 123)
                    res.render('chat/users', {
                        layout: 'layouts/main', users
                    })
                } else {
                    let users = data
                    res.render('chat/users', {
                        layout: 'layouts/main', users
                    })
                }
            })


        // Define email options
        // const mailOptions = {
        //     from: 'ys9486648@gmail.com', // Your email address with your domain
        //     to: 'esteladmello3@gmail.com', // Recipient's email address
        //     subject: 'Sample Email',
        //     html: compiledTemplate({ name: 'John' }) // Pass data to the template
        // };


        // Send email
        // brevoSmtp.sendMail(mailOptions, (error, info) => {
        //     if (error) {
        //         console.error('Error occurred:', error);
        //     } else {
        //         console.log('Email sent:', info.response);
        //     }
        // });
    }

    async sendMessage(req, res) {
        let body = req.body
        return promise.resolve(userService.sendMessageService(body))
            .then(data => {
                if (data) {
                    let userMsg = data
                    res.status(200).send({ success: true, message: "Message Sent.", userMsg })
                } else {
                    let userMsg = data
                    res.status(400).send({ success: false, message: "Message not sent.", userMsg })
                }
            })
    }

    async renderProfile(req, res) {
        let user = req.user
        res.render('settings/profile', {
            layout: 'layouts/main', user
        })
    }

    async profile(req, res) {
        const currentUser = req.user
        const body = req.body
        return promise.resolve(userService.updateProfileService(currentUser, body))
            .then(profile => {
                let error
                if (profile) {
                    res.send({ success: true, profile, error })
                } else {
                    res.send({ success: false, profile, error })
                }
            })
    }

    async searchUsers(req, res) {
        const query = req.body.query
        const currentUser = req.user
        return promise.resolve(userService.searchUsersService(query, currentUser))
            .then(data => {
                if (data.length > 0) {
                    res.send({ success: true, data })
                } else {
                    res.send({ success: false, data })
                }
            })
    }

    async users(req, res) {
        const currentUser = req.user
        return promise.resolve(userService.findOtherUsersService(currentUser))
            .then(data => {
                if(data) {
                    let users = data
                    res.send({ success: true, users })
                }else{
                    let users = data
                    res.send({ success: false, users })
                }
            })
    }
}

module.exports = new userController