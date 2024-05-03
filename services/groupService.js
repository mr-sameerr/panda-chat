const User = require('../models/userModel')
const Group = require('../models/groupModel')
const GroupChat = require('../models/groupChatModel')
const GroupMember = require('../models/groupMemberModel')

class groupService {

    //Create group
    async createGroupService(creater_id, body, file) {
        let { name, limit } = body
        let image = `/images/${file.filename}`

        let group = new Group({
            name, creater_id, limit, image
        })

        return group.save().then(data => {

            let groupMember = new GroupMember({
                user_id: creater_id,
                group_id: data._id,
                isAdmin: true
            })

            return groupMember.save()
        })
            .then(data => {
                return group
            })
            .catch(error => {
                return false
            })
    }

    //Fetch all groups which is joined by logged in user.
    async getUserGroupsService(user) {
        let groups = await GroupMember.aggregate([
            { $match: { user_id: user._id } },
            { $lookup: { from: "groups", localField: "group_id", foreignField: "_id", as: "groupInfo" } },
            { $unwind: "$groupInfo" },
            { $replaceRoot: { newRoot: "$groupInfo" } }
        ])

        if (groups.length > 0) {
            return groups
        } else {
            return groups
        }
    }

    //Send Group Message and show To other group members.
    async sendGroupMessageService(body, currentUser) {
        let { group_id, message, sharedBase64Image: image } = body
        let groupMsg = new GroupChat({
            sender_id: currentUser._id,
            group_id, message, image
        })

        return groupMsg.save().then(async message => {

            let senderInfo = await User.findOne({ _id: message.sender_id },
                { first_name: 1, avatar: 1 })
            return { groupMsg, senderInfo }
        })
    }

    //Show Groups created by LoggedIn User.
    async showAuthorGroupsService(author) {
        let groups = await Group.find({ creater_id: author._id })
        if (groups.length > 0) {
            return groups
        } else {
            return false
        }
    }

    async shareGroupService(groupId, currentUser) {
        let group = await Group.findOne({ _id: groupId });
        if (!group) {
            return false
        } else {
            
            let isJoined = await GroupMember.countDocuments({ group_id: group._id, user_id: currentUser._id })
            let memberCount = await GroupMember.countDocuments({ group_id: group._id })
            let remaningCount = group.limit - memberCount
            return { group, isJoined, memberCount, remaningCount }
        }
    }

    async joinGroupService(groupId, currentUser){
        let member = new GroupMember({
            user_id: currentUser._id, group_id: groupId, isAdmin: false
        })

        return member.save().then( member => {
            return member
        })
    }
}

module.exports = new groupService()