const { User, Teacher, Student, Notes, Group, Department, Rank, Degree, Company, Vacancy } = require("../models/models")
const { Op } = require("sequelize")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const ApiCodes = require('../error/ApiCodes');


const generateJwt = (id, email, role) => {
  return jwt.sign({ id, email, role },
    process.env.SECRET_KEY,
    { expiresIn: '196h' })

}

class userController {
  //Регистрация пользователя
  //
  //На вход в body:
  //      email           string
  //      password        string  
  //      name            string
  //      surname         string
  //      middlename      string
  //      role            string        'TEACHER' or 'STUDENT'
  //
  //Возвращает JWT токен
  async registration(req, res, next) {
    let { email, password, name, surname, middlename, role } = req.body
    email = email.toLowerCase()
    if (role != "STUDENT" && role != "TEACHER") {
      return next(ApiCodes.badRequest("incorrect role"))
    }
    if (!email || !password || !name || !surname) {
      return next(ApiCodes.badRequest("absent base data"))
    }

    const candidate = await User.findOne({ where: { email } })
    if (candidate) { return next(ApiCodes.badRequest("email is busy")) }

    const hashPassword = await bcrypt.hash(password, 5)
    const user = await User.create({ email, password: hashPassword, name, surname, middlename, role })
    switch (role) {
      case "TEACHER":
        const teacher = await Teacher.create()
        await user.update({
          teacherId: teacher.id
        })

        break
      case "STUDENT":
        const student = await Student.create()
        await user.update({
          studentId: student.id
        })

        break
    }
    await user.save()
    const token = generateJwt(user.id, user.email, user.role)
    return res.status(201).json({ token })
  }

  //Логин пользователя
  //
  //На вход в body:
  //      email           string
  //      password        string  
  //
  //Возвращает JWT токен для логина
  async login(req, res, next) {
    let { email, password } = req.body

    if (!email || !password) {
      return next(ApiCodes.badRequest())
    }
    email = email.toLowerCase()
    const user = await User.findOne({ where: { email } })

    if (!user) {
      return next(ApiCodes.badRequest("user is not found"))
    }

    const comparePassword = await bcrypt.compare(password, user.password)

    if (!comparePassword) {
      return next(ApiCodes.badRequest("incorrect password"))
    }

    const token = generateJwt(user.id, user.email, user.role)
    return res.status(200).json({ token })
  }

  //Обновление JWT токена
  //
  //Возвращает JWT токен для логина
  async updateJWT(req, res) {
    const token = generateJwt(req.user.id, req.user.email, req.user.role)
    return res.status(200).json({ token })
  }

  //Смена пароля пользователя
  //На вход в body:
  //      newPassword        string
  //      oldPassword        string
  //
  //Возвращает JWT токен для логина
  async changePassword(req, res, next) {
    const { newPassword, oldPassword } = req.body
    if (!newPassword || !oldPassword) {
      return next(ApiCodes.badRequest())
    }


    try {
      const user = await User.findOne({ where: { id: req.user.id } })
      if (!user) {
        return next(ApiCodes.badRequest("user is not found"))
      }
      const comparePassword = await bcrypt.compare(oldPassword, user.password)
      if (!comparePassword) {
        return next(ApiCodes.badRequest("incorrect password"))
      }
      const hashPassword = await bcrypt.hash(newPassword, 5)
      await user.update({ password: hashPassword })
      return res.status(200).json()
    } catch {
      return next(ApiCodes.badRequest())
    }
  }


  //Получение пользователя
  //Получить либо своего пользователя либо по ID
  //
  //На вход в query может податься targetId - пользователь для изменения
  //     TEACHER может получить любого, STUDENT только себя и своего преподователя
  //
  //Возвращается модель user с инклудами student / teacher 
  //     если запрашивающий TEACHER, добавляются так же заметки
  async getUser(req, res, next) {
    try {
      const targetId = ((req.query.targetId == null) ? req.user.id : req.query.targetId)

      let roleFind
      if (req.user.role == "STUDENT") {
        const requestingUser = await User.findOne({
          include: {
            model: Student,
          },
          where: {
            id: req.user.id
          }
        })

        if (targetId == req.user.id) { roleFind = ["STUDENT"] }
        else if (requestingUser.student.teacherId == targetId) { roleFind = ["TEACHER"] }
        else if (requestingUser.student.teacherId == null) { roleFind = ["TEACHER"] }
      }
      else if (req.user.role == "TEACHER") { roleFind = ["STUDENT", "TEACHER"] }



      const user = await User.findOne({
        include: [
          {
            model: Teacher,
            attributes: { exclude: ['rankName', 'degreeName'] },
            include: [{ model: Degree },
            { model: Rank },]
          },
          {
            model: Student,
            attributes: { exclude: ['groupName', 'departmentName'] },
            include: [{ model: Group },
            { model: Department },]
          },
          { model: Company },
          { model: Vacancy }],
        attributes: { exclude: ['studentId', 'teacherId', 'vacancyId', 'companyId', 'password', 'createdAt', 'updatedAt'] },
        where: {
          id: targetId,
          role: {
            [Op.in]: roleFind
          }
        }
      })
      if (!user) {
        return next(ApiCodes.badRequest("user does not exist"))
      }

      let note
      if (req.user.role == 'TEACHER') {
        note = await Notes.findOne({
          where: {
            studentUserId: targetId,
            teacherUserId: req.user.id
          },
          attributes: ['content']
        })
        user['note'] = note

      }

      return res.status(200).json(user)
    } catch (e) {
      console.log(e)
      return next(ApiCodes)
    }

  }


  //Получение пользователей
  //Получить полный список пользователей или по ФИО
  //
  //На вход в body:
  //      name            string
  //      surname         string
  //      middlename      string
  //
  //Возвращается список с моделями вида id, ФИО, role 
  //    если STUDENT, то поиск будет идти только по преподам
  async getUsers(req, res, next) {
    let { s1, s2, s3 } = req.query
    let roleFind = ['TEACHER']
    if (req.user.role == 'TEACHER') { roleFind.push('STUDENT') }

    let arrStrings = [s1, s2, s3]
    let foundUsers = []
    for (let iteration = 0; iteration < 6; iteration++) {
      let users = await User.findAll({
        attributes: ['id', 'name', 'surname', 'middlename', 'role'],
        where: {
          name: {
            [Op.like]: (arrStrings[0] == null) ?
              '%' : arrStrings[0].charAt(0).toUpperCase() + arrStrings[0].slice(1) + '%'
          },
          surname: {
            [Op.like]: (arrStrings[1] == null) ?
              '%' : arrStrings[1].charAt(0).toUpperCase() + arrStrings[1].slice(1) + '%'
          },
          middlename: {
            [Op.like]: (arrStrings[2] == null) ?
              '%' : arrStrings[2].charAt(0).toUpperCase() + arrStrings[2].slice(1) + '%'
          },
          role: {
            [Op.in]: roleFind
          }
        },
        raw: true
      },)
      if (iteration == 2) {
        [arrStrings[1], arrStrings[2]] = [arrStrings[2], arrStrings[1]]
      }
      else {
        [arrStrings[0], arrStrings[2]] = [arrStrings[2], arrStrings[0]]
        [arrStrings[1], arrStrings[0]] = [arrStrings[0], arrStrings[1]]
      }
      const onlyUnique = (value, index, array) => {
        return array.indexOf(value) === index;
      }

      if (users.length != 0) {
        users.concat(foundUsers)
        foundUsers = users.filter(onlyUnique);
      }

    }

    if (foundUsers.length == 0) {
      return res.status(204).json()
    }

    return res.status(200).json(foundUsers)
  }

  //Изменение данных пользователя
  //Изменение данных пользователя и прикрепленных к нему моделей student / teacher
  //
  //На вход в body {user, student, teacher}
  //  каждый из которых тоже объект вида:
  //  user :{ name: "Testname"}
  //
  //user :    middlename          string
  //          description         string
  //          phones              json            {'work' : int, 'private' : int}
  //          adress              string
  //          socialNetworks      json            {'tg': str, 'vk':str , ...}
  //student:  group               string
  //          department          string
  //          diplomTheme         string
  //teacher:  degree              string  
  //          rank                string
  //          department          string
  //
  //На вход в query может податься targetId - пользователь для изменения
  //  если роль запрашивающего ниже TEACHER, выдаст ошибку
  //
  //Возвращается измененая модель user с инклудами student / teacher
  //
  //PS  : socialNetworks, надо будет подумать какие соцсети юзать
  //DEV : Возможно переписать весь update в один запрос, вместо 3 
  //        и без findOne
  async changeUser(req, res, next) {
    const { user, student, teacher } = req.body
    const { targetId } = req.query

    let changingAnotherUser = false
    if (targetId) {
      if ((targetId && req.user.role != 'TEACHER') || targetId != req.user.id) {
        return next(ApiCodes.badRequest('no access'))
      }
      else { changingAnotherUser = true }

    }

    try {
      const condidate = await User.findOne({
        include: [
          { model: Student },
          { model: Teacher }],
        attributes: { exclude: ['password'] },
        where: { id: (changingAnotherUser) ? targetId : req.user.id }
      })
      if (!condidate) {
        throw Error("user does not exist")
      }

      if (user) {
        let newPhones
        if (user.phones) {
          newPhones = { ...condidate.phones, ...user.phones }
        }

        let newSocialNetworks
        if (user.socialNetworks) {
          newSocialNetworks = { ...condidate.socialNetworks, ...user.socialNetworks }
        }
        await condidate.update({
          middlename: (!user.middlename) ?
            condidate.middlename : user.middlename,
          description: (!user.description) ?
            condidate.description : user.description,

          phones: newPhones,
          socialNetworks: newSocialNetworks,
          adress: (!user.adress) ?
            condidate.adress : user.adress

        })
      }
      if (student) {
        if (student.group) await Group.findOrCreate({ where: { name: student.group } })
        if (student.department) await Department.findOrCreate({ where: { name: student.department } })

        await condidate.student.update({
          groupName: (!student.group) ?
            condidate.student.groupName : student.group,
          diplomTheme: (!student.diplomTheme) ?
            condidate.student.diplomTheme : student.diplomTheme,
          departmentName: (!student.department) ?
            condidate.student.departmentName : student.department,
        })
      }
      if (teacher) {
        if (teacher.rank) await Rank.findOrCreate({ where: { name: teacher.rank } })
        if (teacher.degree) await Degree.findOrCreate({ where: { name: teacher.degree } })
        if (teacher.department) {
          await Department.findOrCreate({ where: { name: teacher.department } })
          await TeacherDepartment.findOrCreate({
            where: {
              departmentName: teacher.department,
              teacherId: targetId
            }
          })
        }
        await condidate.teacher.update({
          degreeName: (!teacher.degree) ?
            condidate.teacher.degreeName : teacher.degree,
          rankName: (!teacher.rank) ?
            condidate.teacher.rankName : teacher.rank,
        })
      }
      await condidate.save()

      return res.status(200).json(condidate)
    } catch (e) { return next(ApiCodes.badRequest(e)) }

  }

  //Загрузка аватара для пользователя 
  //
  //В поле avatar прикрепляется файл
  //
  //Возвращает название файла
  async linkAvatar(req, res, next) {
    try {
      await User.update({
        avatar: req.file.filename
      }, { where: { id: req.user.id } })
      return res.status(200).json(req.file.filename)
    } catch (e) { return next(ApiCodes.badRequest(e)) }

  }

  //Удаление пользователя
  //Полностью удаляет user и его student/teacher из БД
  //
  //На вход в query может податься targetId - пользователь для удаления
  //
  //Ничего не возвращает
  async deleteUser(req, res, next) {
    const { targetId } = req.query

    let deleteAnotherUser = false
    if (targetId) {
      if ((targetId && req.user.role != 'TEACHER') || targetId != req.user.id) {
        return next(ApiCodes.badRequest('no access'))
      }
      else { deleteAnotherUser = true }

    }

    let user = await User.findOne({ where: { id: (deleteAnotherUser) ? targetId : req.user.id } })
    if (!user) {
      return next(ApiCodes.badRequest({ message: "user does not exist" }))
    }
    let teacher = await Teacher.findOne({ where: { id: user.teacherId } })
    try {
      await teacher.destroy()
    } catch { }
    let student = await Student.findOne({ where: { id: user.studentId } })
    try {
      await student.destroy()
    } catch { }

    await user.destroy()
    return res.status(200).json()
  }

  //Получение студентов
  //Получения списка студентов связанных с преподавателем
  //
  //Возвращает список моделей вида id,ФИО 
  async getStudentsForTeacher(req, res, next) {
    const requestingUser = await User.findOne({
      where: { id: req.user.id }
    })
    const students = await User.findAll({
      include: {
        model: Student,
        where: {
          teacherId: requestingUser.id
        }
      },
      attributes: ['id', 'name', 'surname', 'middlename']
    }
    )
    return res.status(200).json(students)
  }
  //Получение преподавателя
  //Получение преподавателя для студента
  //
  //Возвращает модель user + teacher преподавателя
  // 
  //PS : работает только если у студента есть преподаватель 
  async getTeacherForStudent(req, res, next) {
    const requestingUser = await User.findOne({
      where: { id: req.user.id }, include: Student
    })
    const teacher = await User.findOne({
      include: Teacher,
      attributes: {
        exclude: ['password', 'createdAt', 'updatedAt']
      },
      where: {
        id: requestingUser.student.teacherId
      }
    })
    return res.status(200).json(teacher)
  }

  //Изменение заметок
  //Меняет или создает заметки преподавателя 
  //
  //
  //На вход в body:
  //      content         string
  //      
  //На вход в query подается studentId
  //
  //Возвращается content
  async changeNote(req, res, next) {
    const { studentId } = req.query
    const { content } = req.body
    if (!studentId) { return next(ApiCodes.badRequest('incorrect request')) }

    try {
      await User.findOne({
        include: Student,
        where: { id: studentId }
      })
    } catch {
      return next(ApiCodes.badRequest("user does not exist"))
    }

    try {
      await Notes.update(
        {
          content: content
        }, {
        where: {
          studentUserId: studentId,
          teacherUserId: req.user.id
        }
      }
      )
    } catch {
      await Notes.create({
        studentUserId: studentId,
        teacherUserId: req.user.id,
        content: content
      })
    }

    return res.status(202).json({ content })

  }
}
module.exports = new userController()