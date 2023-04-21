const router = require('express').Router()

const UserController = require('../controllers/Usercontroller')

router.post('/login', UserController.login)

module.exports = router