import { Request, Response, Router } from 'express'
import { loginController, registerController } from '~/controllers/users.controller'
import { loginMiddleware, registerMiddleware } from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/wrapRequestHandler'

const usersRouter = Router()

/**
 * Description: Login a user
 * Path: /users/login
 * Method: POST
 * Body: {user_id: string}
 */
usersRouter.post('/login', loginMiddleware, wrapRequestHandler(loginController))

/**
 * Description: Register an account
 * Path: /users/register
 * Method: POST
 * Body: {name: string, email: string, password: string, confirm_password: string, date_of_birth: ISO8601}
 */
usersRouter.post('/register', registerMiddleware, wrapRequestHandler(registerController))

export default usersRouter
