const jwt = require('jsonwebtoken')
const chalk = require('chalk')

module.exports = function (role) {
  return function (req, res, next) {
    if (req.method === "OPTIONS") {
      next()
    }
    try {
      const token = req.header('Authorization').split(' ')[1] //начинается с Bearer

      if (!token) {
        console.log(chalk.bold.red("LOG : нет токена"))
        return res.status(401).json({ message: "Not authorized" })
      }


      const decoded = jwt.verify(token, process.env.SECRET_KEY)


      if (decoded.role != role && decoded.role != "TEACHER" && decoded.role != "ADMIN") {
        console.log(`${chalk.red("LOG : недопустимая роль")} 
        на вход - ${chalk.red(decoded.role)}
        нужна - ${chalk.green(role)}`)
        return res.status(403).json({ message: "Нет доступа" })
      }
      req.user = decoded
      next()
    } catch (e) {
      console.log(chalk.bold.red("LOG : необработанная ошибка"))
      return res.status(401).json({ message: "Not authorized" })
    }
  }
}