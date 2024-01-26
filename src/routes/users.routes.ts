import { Request, Response, Router } from 'express'
import { registerController } from '~/controllers/users.controller'
import { registerMiddleware } from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/wrapRequestHandler'

const usersRouter = Router()

usersRouter.post('/register', registerMiddleware, wrapRequestHandler(registerController))

export default usersRouter
