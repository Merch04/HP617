const Router = require('express')
const router = new Router()

const dictController = require('../controllers/dictController')

const roleMiddleware = require('../middleware/checkRoleMiddleware')
const authMiddleware = require('../middleware/authMiddleware')


router.get('/vacancy', authMiddleware, roleMiddleware("STUDENT"), dictController.getVacancy)
router.post('/vacancy', authMiddleware, roleMiddleware("STUDENT"), dictController.addVacancy)
router.delete('/vacancy', dictController.deleteVacancy)

router.get('/company', authMiddleware, roleMiddleware("STUDENT"), dictController.getCompany)
router.post('/company', authMiddleware, roleMiddleware("STUDENT"), dictController.addCompany)
router.delete('/company', dictController.deleteCompany)
router.post('/company/office', authMiddleware, roleMiddleware("STUDENT"), dictController.addOffice)

router.get('/group', authMiddleware, roleMiddleware("STUDENT"), dictController.getGroup)
router.post('/group', authMiddleware, roleMiddleware("STUDENT"), dictController.addGroup)
router.delete('/group', dictController.deleteGroup)

router.get('/department', authMiddleware, roleMiddleware("STUDENT"), dictController.getDepartment)
router.post('/department', authMiddleware, roleMiddleware("STUDENT"), dictController.addDepartment)
router.delete('/department', dictController.deleteDepartment)

router.get('/rank', authMiddleware, roleMiddleware("TEACHER"), dictController.getRank)
router.post('/rank', authMiddleware, roleMiddleware("TEACHER"), dictController.addRank)
router.delete('/rank', dictController.deleteRank)

router.get('/degree', authMiddleware, roleMiddleware("TEACHER"), dictController.getDegree)
router.post('/degree', authMiddleware, roleMiddleware("TEACHER"), dictController.addDegree)
router.delete('/degree', dictController.deleteDegree)

router.get('/teacherdepartment', authMiddleware, roleMiddleware("TEACHER"), dictController.getTeacherDepartment)
router.post('/teacherdepartment', authMiddleware, roleMiddleware("TEACHER"), dictController.addTeacherDepartment)
router.delete('/teacherdepartment', dictController.deleteDepartment)

module.exports = router