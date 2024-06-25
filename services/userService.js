const User = require('../models/userModel')
const UserChat = require('../models/userChatModel')
const awsS3Upload = require('../config/awsConfig')

class userService {
    async findOtherUsersService(user) {
        let users = await User.find({ _id: { $ne: user._id } }).sort({ first_name: 1 })
        if (users.length > 0) {
            return users
        } else {
            return false
        }
    }

    //Shows user's sequence on user list on the bases of last message received.
    async usersLastMsgs(currentUser) {
        let userData = await UserChat.aggregate([
            {
                $match:
                {
                    $or: [
                        { sender_id: currentUser._id },
                        { receiver_id: currentUser._id }
                    ]
                }
            },
            {
                $group:
                {
                    _id: {
                        $cond: [
                            { $eq: ["$sender_id", currentUser._id] },
                            "$receiver_id",
                            "$sender_id"
                        ]
                    },
                    lastMsgTimestamp: { $max: "$createdAt" },
                    message: { $last: "$$ROOT" }
                }
            },
            { $sort: { lastMsgTimestamp: -1 } },
            // { $limit: 2 },
            {
                $lookup: {
                    from: "users",
                    let: { userId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                        { $project: { first_name: 1, last_name: 1, avatar: 1, isOnline: 1 } }
                    ],
                    as: "userInfo"
                }
            },
            { $unwind: "$userInfo" }
        ])
        return userData
    }

    async sendMessageService(body) {
        let { senderId, message, receiver_id, sharedBase64Image } = body
        let userMessage = new UserChat({
            sender_id: senderId,
            receiver_id, message, image: sharedBase64Image
        })
        return userMessage.save().then(async msg => {
            if (msg) {
                let senderInfo = await User.findById(senderId).select('avatar')
                let messageInfo = { msg, senderInfo }
                return messageInfo
            } else {
                return false
            }
        })
    }

    async updateProfileService(user, body) {
        let { first_name, last_name, avatar, company,
            job, country, avatar_extension, avatar_name } = body

        if (avatar.length > 0) {
            let avatarBase64 = avatar.split(";base64,").pop()
            let buffer = Buffer.from(avatarBase64, "base64")

            let name = `/avatar/${Date.now()}-${avatar_name}`
            var upload = await awsS3Upload.presignedUrlUploads(name, buffer, `image/${avatar_extension}`)
        }

        const data = { first_name, last_name, company, job, country }
        if (avatar.length > 0) {
            data.avatar = upload
        }
        return await User.findByIdAndUpdate(user._id, data, { new: true })
    }

    async searchUsersService(query, currentUser) {
        if (query != "") {
            const users = await UserChat.aggregate([
                {
                    $match: {
                        $or: [
                            { sender_id: currentUser._id },
                            { receiver_id: currentUser._id }
                        ]
                    }
                },
                {
                    $group: {
                        _id: {
                            $cond: [
                                { $eq: ["$receiver_id", currentUser._id] },
                                "$sender_id",
                                "$receiver_id"
                            ]
                        },
                        lastMsgTimestamp: { $max: "$createdAt" },
                        message: { $last: "$$ROOT" }
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        let: { userId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ["$_id", "$$userId"] }
                                }
                            },
                            {
                                $match: {
                                    $or: [
                                        { first_name: { $regex: query, $options: "i" } },
                                        { last_name: { $regex: query, $options: "i" } },
                                        {
                                            $expr: {
                                                $regexMatch: {
                                                    input: { $concat: ["$first_name", ' ', "$last_name"] },
                                                    regex: query,
                                                    options: "i"
                                                }
                                            }
                                        }
                                    ]
                                }
                            },
                            { $project: { first_name: 1, last_name: 1, avatar: 1, isOnline: 1 } }
                        ],
                        as: "userInfo"
                    }
                },
                { $unwind: "$userInfo" },
                {
                    $match: {
                        "userInfo._id": { $exists: true } // Ensure userInfo exists
                    }
                }
            ])
            return users
            
        } else {
            const users = await this.usersLastMsgs(currentUser)
            return users
        }
    }
}

module.exports = new userService()