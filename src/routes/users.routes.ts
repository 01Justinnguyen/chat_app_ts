import { Request, Response, Router } from 'express'
import {
  forgotPasswordController,
  getProfileController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  resendEmailVerifyController,
  resetPasswordController,
  updateMyProfileController,
  verifyEmailTokenController,
  verifyForgotPasswordTokenController
} from '~/controllers/users.controller'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  loginMiddleware,
  refreshTokenValidator,
  registerMiddleware,
  resetPasswordValidator,
  updateMyProfileValidator,
  verifyForgotPasswordTokenValidator,
  verifyUserValidator
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

/**
 * Description: Submit email to reset password, send email to user
 * Path: /forgot-password
 * Method: POST
 * Body: {email: string}
 */

usersRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))

/**
 * Description: Verify forgot password token when client click on link in email
 * Path: /verify-forgot-password-token
 * Method: POST
 * Body: {forgot_password_token: string}
 */

usersRouter.post(
  '/verify-forgot-password-token',
  verifyForgotPasswordTokenValidator,
  wrapRequestHandler(verifyForgotPasswordTokenController)
)

/**
 * Description: Reset password done
 * Path: /reset-password
 * Method: POST
 * Body: {forgot_password_token: string, password: string, confirm_password: string}
 */

usersRouter.post('/reset-password', resetPasswordValidator, wrapRequestHandler(resetPasswordController))

/**
 * Description: Get my profile
 * Path: /get-profile
 * Method: GET
 * Header: {Authorization: Bearer <token>}
 */

usersRouter.get('/get-profile', accessTokenValidator, wrapRequestHandler(getProfileController))

/**
 * Description: Update my profile
 * Path: /update-my-profile
 * Method: patch
 * Header: {Authorization: Bearer <token>}
 * Body: {user: User}
 */

usersRouter.patch(
  '/update-my-profile',
  accessTokenValidator,
  verifyUserValidator,
  updateMyProfileValidator,
  wrapRequestHandler(updateMyProfileController)
)

export default usersRouter
