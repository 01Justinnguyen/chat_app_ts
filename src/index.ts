import express from 'express'
import { config } from 'dotenv'
import cors from 'cors'
import usersRouter from './routes/users.routes'
import database from './services/database.services'
config()
database.connect()
const app = express()
const PORT = process.env.PORT || 8888

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
  cors({
    origin: process.env.API_ROOT,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  })
)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/users', usersRouter)

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})
