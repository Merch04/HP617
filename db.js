const { Sequelize } = require('sequelize')

module.exports = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    dialect: 'postgres',
    host: process.env.DB_HOST,
    prot: process.env.DB_PORT,
    logging: (process.env.DB_LOGGING == "false") ? false : true
  }

)