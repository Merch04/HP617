const Router = require('express')
const router = new Router()
const mediaController = require('../controllers/mediaController')
const userController = require('../controllers/userController')
const verifyController = require('../controllers/verificationController')

const roleMiddleware = require('../middleware/checkRoleMiddleware')
const authMiddleware = require('../middleware/authMiddleware')




router.post('/createinvalidstudent', authMiddleware, roleMiddleware("TEACHER"), verifyController.createNoAuthStudent)
router.get('/getcodes', authMiddleware, roleMiddleware("TEACHER"), verifyController.getSlaveStudentsCodes)
router.get('/logincodestudent/:code', verifyController.loginToCodeStudent)
router.put('/updateuserwithcode', authMiddleware, roleMiddleware("NOVERIF"), verifyController.updatenewuser)

router.post('/registration', userController.registration)
router.post('/login', userController.login)
router.get('/auth', authMiddleware, roleMiddleware("STUDENT"), userController.updateJWT)

router.get('/getuser/', authMiddleware, roleMiddleware("STUDENT"), userController.getUser)

router.get('/getusers/', authMiddleware, roleMiddleware("STUDENT"), userController.getUsers)

router.put('/updateuser', authMiddleware, roleMiddleware("STUDENT"), userController.changeUser)
router.post('/uploadavatar', authMiddleware, roleMiddleware("STUDENT"), mediaController, userController.linkAvatar)

router.delete('/deleteuser', authMiddleware, roleMiddleware("STUDENT"), userController.deleteUser)


router.get('/teacher/', authMiddleware, roleMiddleware("STUDENT"), userController.getTeacherForStudent)

router.get('/students/', authMiddleware, roleMiddleware("TEACHER"), userController.getStudentsForTeacher)

router.post('/changenote', authMiddleware, roleMiddleware('TEACHER'), userController.changeNote)

module.exports = router