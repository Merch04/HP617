const jwt = require('jsonwebtoken')
const chalk = require('chalk')
module.exports = function (req, res, next) {
  if (req.method === "OPTIONS") {

    next()
  }
  try {
    const token = req.header('Authorization').split(' ')[1] //начинается с Bearer
    if (!token) {
      console.log(chalk.red(`LOG: auth - нет токена`))
      return res.status(401).json({ message: "Не авторизован" })
    }
    const decoded = jwt.verify(token, process.env.SECRET_KEY)
    req.user = decoded

    next()
  } catch (e) {
    return res.status(401).json({ message: "Не авторизован" })
  }
}