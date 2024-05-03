const socketIo = require('socket.io')
const userUtils = require('../utils/userUtils')
const User = require('../models/userModel')
const userChat = require('../models/userChatModel')
const groupChat = require('../models/groupChatModel')

const socketServices = server => {
    let io = socketIo(server)
    let serverIo = io.of('/users')

    serverIo.on('connection', async socket => {
        console.log("Socket is connected.")
        let currentUserId = socket.handshake.auth.token
        userUtils.updateUserById(currentUserId, { isOnline: true });

        //Broadcast an event for catching online state of user.
        socket.broadcast.emit("getOnlineStatus", { currentUserId })

        //Catch an event for showing user is typing message
        socket.on("chat:userTypingStatus", async data => {
            socket.broadcast.to("ramramsaryane").emit("chat:showTypingStatus",
                { isTyping: data.isTyping })
        })

        //Catch an event for fetching chat history.
        socket.on("user:chatHistory", async data => {
            let { receiver_id, sender_id } = data
            let chatHistory = await userChat.find({
                $or: [
                    { sender_id, receiver_id },
                    { sender_id: receiver_id, receiver_id: sender_id }
                ]
            }).populate('sender_id', 'avatar')

            let username = await userUtils.capitalizeUsername(receiver_id)

            //Through an event for showing chat history
            socket.emit("user:loadChatHistory", { username, chatHistory })
        })

        //Catch an event to get user information, who is typing.
        socket.on("notify:getUserTyping", async data => {
            let { sender_id, receiver_id } = data

            //Through an event to get user typing status
            socket.broadcast.emit("notify:showUserTyping", { sender_id, receiver_id })
        })

        //Catch an event for fetching user message
        socket.on("user:sendMessage", async data => {
            socket.broadcast.emit("user:showSendMessage", { data })
        })

        //*****************************************
        socket.on("group:chatHistory", async data => {
            let group_id = data.group_id
            // let chatHistory = await groupChat.find({ group_id })
            let chatHistory = await groupChat.find({ group_id })
                .populate("sender_id", "first_name last_name avatar")
            socket.emit("group:loadChatHistory", { chatHistory })
        })

        //Catch event to get new message
        socket.on("group:newMessage", data => {
            socket.broadcast.emit("group:showNewMessage", data)
        })

        socket.on('disconnect', async () => {
            console.log("Socket is disconnected.")

            // await User.findByIdAndUpdate(currentUserId, { isOnline: false })
            userUtils.updateUserById(currentUserId, { isOnline: false })
            //Broadcast an event for catching offline state of user.
            socket.broadcast.emit("getOfflineStatus", { currentUserId })
        })
    })
}

module.exports = socketServices