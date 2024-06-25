const promise = require('bluebird')
const Group = require('../models/groupModel')
const groupService = require('../services/groupService')
const GroupMember = require('../models/groupMemberModel')

class groupController {
    async groupStore(req, res) {

        let creater_id = req.user._id
        let body = req.body
        let file = req.file
        return promise.resolve(groupService.createGroupService(creater_id, body, file))
            .then(data => {
                let group = data
                if (data) {
                    res.send({ success: true, message: "Group has been created.", group })
                } else {
                    res.send({ success: false, message: "Something went wrong." })
                }
            })
    }

    async groupChat(req, res) {
        let currentUser = req.user
        return promise.resolve(groupService.getUserGroupsService(currentUser))
            .then(data => {
                if (data) {
                    let groups = data
                    res.render('chat/groups', {
                        layout: 'layouts/main', groups
                    })
                }
            })
        // let userInfo = await User.aggregate([
        //     { $match: { _id: new ObjectId(currentUser._id) } },
        //     {
        //         $lookup: { from: "group_members", localField: "_id", foreignField: "user_id", as: "userMembers" }
        //     },
        //     {
        //         $lookup: { from: "groups", localField: "userMembers.group_id", foreignField: "_id", as: "joinedGroups" }
        //     },
        //     { $project: { userMembers: 0 } }
        // ])
    }

    async sendMessage(req, res) {
        let body = req.body
        let currentUser = req.user
        return promise.resolve(groupService.sendGroupMessageService(body, currentUser))
            .then(data => {
                if (data) {
                    let groupMsg = data.groupMsg
                    let senderInfo = data.senderInfo
                    res.status(200).send({
                        success: true, message: "Message Sent.",
                        groupMsg, senderInfo
                    })
                } else {
                    let groupMsg = {}
                    let senderInfo = {}
                    res.status(200).send({
                        success: false, message: "Something went wrong.",
                        groupMsg, senderInfo
                    })
                }
            })

    }

    async renderGroupSetting(req, res) {
        let currentUser = req.user
        return promise.resolve(groupService.showAuthorGroupsService(currentUser))
            .then(data => {
                if (data) {
                    let groups = data
                    res.render('settings/groups/index', {
                        layout: './layouts/main', groups
                    })
                } else {
                    let groups = {}
                    res.render('settings/groups/index', {
                        layout: './layouts/main', groups
                    })
                }
            })
    }

    //Render Page to join group.
    async shareGroup(req, res) {
        let groupId = req.params.groupId
        let currentUser = req.user
        return promise.resolve(groupService.shareGroupService(groupId, currentUser))
            .then(groupInfo => {
                if (groupInfo) {
                    let group = groupInfo.group
                    let memberCount = groupInfo.memberCount
                    let remaningCount = groupInfo.remaningCount
                    let isJoined = groupInfo.isJoined
                    res.render('settings/groups/group-join',
                        { layout: false, group, memberCount, remaningCount, isJoined })
                } else {
                    res.render("pages/404", { layout: false })
                }
            })
    }

    async joinGroup(req, res) {
        let group_id = req.body.groupId
        if (req.user == undefined) {
            res.send({ success: false, message: "You need to login." })
        } else {
            let currentUser = req.user
            return promise.resolve(groupService.joinGroupService(group_id, currentUser))
                .then(data => {
                    res.status(200).send(
                        { success: true, message: "Group Joined", data })
                })
        }
    }

    //Show all joined group by loggedIn user.
    async groups(req, res) {
        const currentUser = req.user
        return promise.resolve(groupService.getUserGroupsService(currentUser))
            .then( groups => {
                res.status(200).send(
                    { success: true, groups }
                )
            })
    }
}

module.exports = new groupController