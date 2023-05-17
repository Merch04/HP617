const { NoAuthUser, User, Student } = require("../models/models")
const ApiCodes = require('../error/ApiCodes')
const crypto = require("crypto")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const generateJwtNonAuth = (id, role) => {
  return jwt.sign({ id, role },
    process.env.SECRET_KEY,
    { expiresIn: '196h' })

}
const generateJwt = (id, email, role) => {
  return jwt.sign({ id, email, role },
    process.env.SECRET_KEY,
    { expiresIn: '196h' })

}

class verifycationController {
  //Создать код для регистрации студента
  //Создает код за которым закреплены ФИО, студент регистрирующийся по 
  //  коду, автоматически становится закрепленым за преподом создавшим код
  //
  //В body передается 
  //        name            string
  //        surname         string
  //        middlename      string
  //
  //Возвращает уникальный код
  async createNoAuthStudent(req, res, next) {
    const { name, surname, middlename } = req.body
    if (!name || !surname) {
      console.log(name)
      return next(ApiCodes.badRequest)
    }
    const responsibleUser = req.user.id

    let code = crypto.randomBytes(4).toString('hex')

    await NoAuthUser.create({
      name, surname,
      middlename: middlename || null,
      responsibleUser, code
    })
    return res.status(201).json({ code })
  }

  //Авторизация по коду
  //Авторизация студента по выданному коду
  //
  //В params передается code который создал препод 
  //
  //Возврат ФИО, JWTтокен
  //Токен созданый здесь имеет доступ только к первоначальному изменению пользователю
  async loginToCodeStudent(req, res, next) {
    let { code } = req.params
    if (!code) { return next(ApiCodes.badRequest("incorrect code")) }

    const candidate = await NoAuthUser.findOne({ where: { code } })
    if (!candidate) { return next(ApiCodes.badRequest("incorrect code")) }

    const token = generateJwtNonAuth(candidate.id, "NOVERIF")
    const name = candidate.name
    const surname = candidate.surname
    const middlename = candidate.middlename
    return res.status(200).json({ name, surname, middlename, token })

  }

  //Регистрация пользователя(код)
  //Создание можели User + student, для студента залогиневшшегося по коду
  //
  //В body передается 
  //          name              string
  //          surname           string
  //          middlename        string
  //          email             string
  //          password          string
  //
  //Возвращает JWTтокен(общий)
  //
  async updatenewuser(req, res, next) {
    try {
      const { name, surname, middlename, email, password } = req.body
      if (!name || !surname) { return next(ApiCodes.badRequest("no name or surname")) }
      if (!email || !password) { return next(ApiCodes.badRequest("no mail or password")) }

      const condidate = await User.findOne({ where: { email } })
      if (condidate) { return next(ApiCodes.badRequest("email is busy")) }

      const hashPassword = await bcrypt.hash(password, 5)

      const user = await User.create({
        role: "STUDENT",
        email,
        password: hashPassword,
        name,
        surname,
        middlename
      })

      const noAuthUser = await NoAuthUser.findOne({ where: { id: req.user.id } })

      const student = await Student.create({
        teacherId: noAuthUser.responsibleUser
      })

      await user.update({
        studentId: student.id
      })
      await user.save()

      await noAuthUser.destroy()

      const token = generateJwt(user.id, user.email, user.role)
      return res.status(201).json({ token })
    } catch (e) {
      console.log(e)
      return next()
    }
  }

  //Получение всех созданных кодов
  //
  //Возвращает список всех созанных кодов + ФИО
  async getSlaveStudentsCodes(req, res, next) {
    const lines = await NoAuthUser.findAll({
      attributes: { exclude: ['responsibleUser', 'id'] },
      where: { responsibleUser: req.user.id }
    })
    return res.status(200).json(lines)
  }
}

module.exports = new verifycationController()