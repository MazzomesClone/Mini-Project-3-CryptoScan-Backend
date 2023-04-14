const express = require('express')
const router = express.Router()
const { userController } = require('../controllers')

router.get('/', userController.getUsers)    // User ID optional

router.post('/create', userController.createUser)

router.put('/update', userController.updateUser)    // Needs user ID - PROTECTED

router.delete('/delete', userController.deleteUser)    // Needs user ID - PROTECTED

module.exports = router