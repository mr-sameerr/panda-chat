const express = require('express')
const router = express.Router()
const uploadFile = require('../config/uploadFile')
const { isLoggedIn } = require('../middlewares/Auth')
const groupController = require('../controllers/groupController')
const { requestValidate, storeGroupRules } = require('../validators/groupValidator')


router.get('/chat/groups', isLoggedIn, groupController.groupChat)
router.post('/send/group/message', groupController.sendMessage)
router.get('/settings/groups', isLoggedIn, groupController.renderGroupSetting)
router.post('/group/store',
    uploadFile.single("image"),
    storeGroupRules, requestValidate,
    groupController.groupStore
)

router.get('/join-group/:groupId', isLoggedIn, groupController.shareGroup)
router.post('/join-group', groupController.joinGroup)

module.exports = router