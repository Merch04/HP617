const Router = require('express')
const router = new Router()
const notificationController = require('../controllers/notificationController')

const roleMiddleware = require('../middleware/checkRoleMiddleware')
const authMiddleware = require('../middleware/authMiddleware')



router.post('/requestteacher/:idTeacher', authMiddleware, roleMiddleware("STUDENT"), notificationController.createRequestToTeacher)

router.get('/check', authMiddleware, roleMiddleware("TEACHER"), notificationController.checkNotificationForTeacher)

router.post('/response/:notfid/:response', authMiddleware, roleMiddleware("TEACHER"), notificationController.responseToRequestFromStudent)
module.exports = router