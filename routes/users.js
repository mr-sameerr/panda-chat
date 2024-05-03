const express = require('express')
const router = express.Router()
const uploadFile = require('../config/uploadFile')
const authMiddleware = require('../middlewares/Auth');
const userController = require('../controllers/userController')
const {validationRules, validate} = require('../src/validators/profileValidator')

router.get('/dashboard', authMiddleware.isLoggedIn, userController.dashboard)
router.get('/chat/users', authMiddleware.isLoggedIn, userController.userChat)
router.post('/send/message', uploadFile.single("shareImage"), userController.sendMessage)
router.get('/profile', authMiddleware.isLoggedIn, userController.renderProfile)
router.post('/profile', validationRules(), validate, uploadFile.single("avatar"), userController.profile)
router.post('/search-users', userController.searchUsers)
router.post('/reorder/user-list', userController.reorderUsers)
module.exports = router