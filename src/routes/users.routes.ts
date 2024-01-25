import { Request, Response, Router } from 'express'
import { registerController } from '~/controllers/users.controller'
import { registerMiddleware } from '~/middlewares/users.middleware'

const usersRouter = Router()

usersRouter.post('/register', registerMiddleware, registerController)

export default usersRouter
