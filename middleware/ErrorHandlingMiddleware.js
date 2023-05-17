const ApiCodes = require('../error/ApiCodes')
const chalk = require('chalk')

module.exports = function (err, req, res, next) {
  console.log(chalk.red(err.status + " " + err.message + " info: \n" +
    req.path + "\n"))
  if (err instanceof ApiCodes) {
    return res.status(err.status).json({ message: err.message })
  }

  return res.status(500).json({ message: "unexpected error" })
}