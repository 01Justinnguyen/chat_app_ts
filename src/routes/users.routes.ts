import { Request, Response, Router } from 'express'
import {
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  resendEmailVerifyController,
  verifyEmailTokenController
} from '~/controllers/users.controller'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  loginMiddleware,
  refreshTokenValidator,
  registerMiddleware
} from '~/middlewares/users.middleware'
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

/**
 * Description: Logout
 * Path: /logout
 * Method: POST
 * Header: {Authorization: Bearer <token>}
 * Body: {refresh_token: string}
 */
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))

/**
 * Description: Refresh token
 * Path: /refresh-token
 * Method: POST
 * Body: {refresh_token: string}
 */
usersRouter.post('/refresh-token', refreshTokenValidator, wrapRequestHandler(refreshTokenController))

/**
 * Description: Verify email when user click on link in email
 * Path: /verify-email
 * Method: POST
 * Body: {email_verify_token: string}
 */
usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(verifyEmailTokenController))

/**
 * Description: Resend email verify when user click button resend
 * Path: /resend-verify-email
 * Method: POST
 * Header: {Authorization: Bearer <token>}
 * Body: {}
 */

usersRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendEmailVerifyController))

export default usersRouter
