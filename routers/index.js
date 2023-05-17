const Router = require('express')
const router = new Router()

const authMiddleware = require('../middleware/authMiddleware')

const userRouter = require('./userRouter')
const dictRouter = require('./dictRouter')
const notfRouter = require('./notificationRouter')

router.use('/user', userRouter)
router.use('/dict', authMiddleware, dictRouter)
router.use('/notf', authMiddleware, notfRouter)

module.exports = router