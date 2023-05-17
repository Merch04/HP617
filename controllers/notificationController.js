const { NotificationsToTeacher, User, Student, Teacher } = require('../models/models')
const ApiCodes = require('../error/ApiCodes');


class notificationController {
  //Запрос на добавление к преподу
  //Создает уведомление на добавление для преподавателя
  //     
  //На вход в params idTeacher 
  //
  //Возвращает запись с id запрашивающего и id получателя
  async createRequestToTeacher(req, res, next) {
    try {
      const { idTeacher } = req.params

      if (!idTeacher) {
        return next(ApiCodes.badRequest())
      }
      const candidateTeacher = await User.findOne({ where: { id: idTeacher } })
      if (!candidateTeacher.teacherId) {
        return next(ApiCodes.badRequest("not a teacher"))
      }

      const candidateNotification = await NotificationsToTeacher.findOne({
        where: { senderUserId: req.user.id }
      })
      if (candidateNotification) { await candidateNotification.destroy() }

      const notf = await NotificationsToTeacher.create({
        senderUserId: req.user.id,
        destUserId: idTeacher
      })

      return res.status(200).json(notf)

    } catch {
      return next(ApiCodes)
    }

  }

  //Проверка уведомлений
  //Возвращает список уведомлений если у запрашивающего есть уведомления
  //
  //Возвращает список уведомлений для учителя в виде idNotf + User
  async checkNotificationForTeacher(req, res, next) {
    try {
      const notification = await NotificationsToTeacher.findAll({
        include: {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'surname', 'middlename']
        },
        attributes: ['id'],
        where: {
          destUserId: req.user.id
        }
      })
      if (!notification) { return res.json("no notification") }

      return res.status(200).json(notification)

    } catch {
      return next(ApiCodes)
    }
  }

  //Ответ на запрос студенту
  //Либо добавляет студенту teacherId, либо игнорирует запрос
  //
  //В params передается:
  //       notfid              uuid 
  //       response            'accept' or 'reject' 
  //
  //Ничего не возвращает
  async responseToRequestFromStudent(req, res, next) {
    const { notfid, response } = req.params

    if (!response || !notfid) { return next(ApiCodes.badRequest()) }

    try {
      const notification = await NotificationsToTeacher.findOne({
        where: {
          id: notfid
        }
      })
      if (!notification) { return next(ApiCodes.badRequest()) }
      const user = await User.findOne({
        include: Student,
        where: {
          id: notification.senderUserId
        }

      })
      if (!user) { return next(ApiCodes.badRequest()) }
      if (response == 'accept') {
        await user.student.update({
          teacherId: req.user.id
        })
        await user.save()

      }
      await notification.destroy()

      return res.status(200).json()

    } catch {
      return next(ApiCodes)
    }
  }
}
module.exports = new notificationController()