
const ApiCodes = require("../error/ApiCodes")
const { Company, Vacancy, Group, Department, Rank, Degree, TeacherDepartment } = require("../models/models")

class dictController {

  //VACANCY
  async getVacancy(req, res, next) { // фулл список 
    let lines = await Vacancy.findAll()
    return res.json(lines)
  }
  async addVacancy(req, res, next) {
    let { name } = req.body
    let condidate = await Vacancy.findOne({ where: { name } })
    if (condidate) {
      return next(ApiCodes.badRequest("such a record exists"))
    }
    await Vacancy.create({ name })
    return next(ApiCodes.created())
  }
  async deleteVacancy(req, res, next) {
    let { name } = req.body
    let condidate = await Vacancy.findOne({ where: { name } })
    if (condidate) {
      await condidate.destroy()
      return next(ApiCodes.ok())
    }
    return next(ApiCodes.badRequest("no such entry exists"))
  }

  // COMPANIES
  async getCompany(req, res, next) { // фулл список 
    let lines = await Company.findAll({
      attributes: ["name"]
    })
    return res.json(lines)
  }
  async addCompany(req, res, next) {
    let { name, website } = req.body
    let condidate = await Company.findOne({ where: { name } })
    if (condidate) {
      return next(ApiCodes.badRequest("such a record exists"))
    }
    await Company.create({ name, website })
    return next(ApiCodes.created())
  }
  async deleteCompany(req, res, next) {
    let { name } = req.body
    let condidate = await Company.findOne({ where: { name } })
    if (condidate) {
      await condidate.destroy()
      return next(ApiCodes.ok())
    }
    return next(ApiCodes.badRequest("no such entry exists"))
  }
  async addOffice(req, res, next) {
    let { companyId, officeAddress } = req.body
    let company = await Company.findOne({ where: { id: companyId } })
    if (!company) {
      return next(ApiCodes.badRequest("no such company exists"))
    }
    let arrOffice = company.office
    if (arrOffice.find(officeAddress) == -1) {
      arrOffice.push(officeAddress)
    } else {
      return next(ApiCodes.badRequest("such a record exists"))
    }
    await company.update({ office: arrOffice })
    await company.save()
    return res.json(company)
  }

  //GROUP
  async getGroup(req, res, next) { // фулл список 
    const lines = await Group.findAll({ attributes: ['name', 'year_add'] })
    return res.json(lines)
  }
  async addGroup(req, res, next) {
    const { name, year_add } = req.query

    let condidate = await Group.findOne({ where: { name } })
    if (condidate) {
      return next(ApiCodes.badRequest("such a record exists"))
    }
    await Group.create({ name, year_add })
    return res.status(200).json()
  }
  async deleteGroup(req, res, next) {
    const { name } = req.query
    const condidate = await Group.findOne({ where: { name } })
    if (condidate) {
      await condidate.destroy()
      return res.status(200).json()
    }
    return next(ApiCodes.badRequest("no such entry exists"))
  }

  //DEPARTMENT
  async getDepartment(req, res, next) { // фулл список 
    let lines = await Department.findAll()
    return res.json(lines)
  }
  async addDepartment(req, res, next) {
    let { name } = req.query
    let condidate = await Department.findOne({ where: { name } })
    if (condidate) {
      return next(ApiCodes.badRequest("such a record exists"))
    }
    await Department.create({ name })
    return next(ApiCodes.created())
  }
  async deleteDepartment(req, res, next) {
    let { name } = req.query
    let condidate = await Department.findOne({ where: { name } })
    if (condidate) {
      await condidate.destroy()
      return next(ApiCodes.ok())
    }
    return next(ApiCodes.badRequest("no such entry exists"))
  }

  //RANK
  async getRank(req, res, next) { // фулл список 
    let lines = await Rank.findAll()
    return res.json(lines)
  }
  async addRank(req, res, next) {
    let { name } = req.query
    let condidate = await Rank.findOne({ where: { name } })
    if (condidate) {
      return next(ApiCodes.badRequest("such a record exists"))
    }
    await Rank.create({ name })
    return res.status(200).json()
  }
  async deleteRank(req, res, next) {
    let { name } = req.query
    let condidate = await Rank.findOne({ where: { name } })
    if (condidate) {
      await condidate.destroy()
      return next(ApiCodes.ok())
    }
    return next(ApiCodes.badRequest("no such entry exists"))
  }

  //DEGREE
  async getDegree(req, res, next) { // фулл список 
    let lines = await Degree.findAll()
    return res.json(lines)
  }
  async addDegree(req, res, next) {
    let { name, shortName } = req.query
    let condidate = await Degree.findOne({ where: { name } }) // проверка по shortName?
    if (condidate) {
      return next(ApiCodes.badRequest("such a record exists"))
    }
    await Degree.create({ name, shortName })
    return next(ApiCodes.created())
  }
  async deleteDegree(req, res, next) {
    let { name } = req.query
    let condidate = await Degree.findOne({ where: { name } })
    if (condidate) {
      await condidate.destroy()
      return next(ApiCodes.ok())
    }
    return next(ApiCodes.badRequest("no such entry exists"))
  }

  //TEACHER_DEPARTMENTS
  async getTeacherDepartment(req, res, next) { // фулл список 
    let { id } = req.query
    let lines = await TeacherDepartment.findAll({ where: { teacherId: id } })
    return res.json(lines)
  }
  async addTeacherDepartment(req, res, next) {
    let { teacherId, departmentId } = req.query
    let condidate = await TeacherDepartment.findOne({ where: { teacherId, departmentId } })
    if (condidate) {
      return next(ApiCodes.badRequest("such a record exists"))
    }
    await TeacherDepartment.create({ teacherId, departmentId })
    return next(ApiCodes.created())
  }
  async deleteTeacherDepartment(req, res, next) {
    let { teacherId, departmentId } = req.query
    let condidate = await TeacherDepartment.findOne({ where: { teacherId, departmentId } })
    if (condidate) {
      await condidate.destroy()
      return next(ApiCodes.ok())
    }
    return next(ApiCodes.badRequest("no such entry exists"))
  }
}
module.exports = new dictController()