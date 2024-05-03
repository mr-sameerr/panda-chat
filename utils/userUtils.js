const uuid = require('uuid')
const moment = require('moment')
const User = require('../models/userModel');

class UserUtils {

    async capitalizeUsername(userId) {
        const user = await User.findById(userId, 'first_name last_name')
        const f_name = user.first_name[0].toUpperCase() + user.first_name.slice(1)
        const l_name = user.last_name ? user.last_name[0].toUpperCase() + user.last_name.slice(1) : ''
        const username = `${f_name} ${l_name}`
        return username
    }

    async capitalizeOtherUsernames(user) {
        let users = await User.aggregate([
            { $match: { _id: { $ne: user._id } } },
            { $project: 
                { avatar: 1, fullname: 
                    {
                        $concat: [
                            { $toUpper: { $substrCP: [ "$first_name", 0, 1 ] } },
                            { $substrCP: [ "$first_name", 1, { $strLenCP: "$first_name" } ] },
                            " ",
                            { $toUpper: { $substrCP: ["$last_name", 0, 1] } },
                            { $substrCP: [ "$last_name", 1, { $strLenCP: "$last_name" } ] }
                        ]
                    }
                }
            }
        ])

        if(users.length > 0){
            return users
        }else{
            return false
        }
    }

    async updateUserById(userId, data = {}) {
        const user = await User.findByIdAndUpdate(userId, data, { new: true });
        return user;
    }

    generateRandomString(time = []) {
        const data = {}
        data.token = uuid.v4().replace(/-/g, "")
        data.expiredAt = moment().add(time[0], time[1]).toDate().toISOString()
        return data
    }
}

// Export the class
module.exports = new UserUtils();
