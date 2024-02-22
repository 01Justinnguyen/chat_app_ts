import express, { NextFunction, Request, Response } from 'express'
import { config } from 'dotenv'
import cors from 'cors'
import usersRouter from './routes/users.routes'
import database from './services/database.services'
import { defaultErrorsHandler } from './middlewares/errors.middleware'
config()
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

database.connect()

app.use('/users', usersRouter)

app.use(defaultErrorsHandler)

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})
