require('dotenv').config()
const sequelize = require('./db')
const models = require('./models/models')
const express = require('express')
const cors = require('cors')

const PORT = process.env.PORT || 8000


const router = require('./routers/index.js')
const errorHandler = require('./middleware/ErrorHandlingMiddleware')



const app = express()
app.use(cors())
app.use(express.json())
//загрузка аватаров /avatar/:filename
app.use('/avatar', express.static('./avatars'))
app.use('/', router)

app.use(errorHandler)
const start = async () => {
  try {
    await sequelize.authenticate()
    await sequelize.sync({ force: true })
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`)
    })
  } catch (e) {
    console.log(e)
  }
}

start()
