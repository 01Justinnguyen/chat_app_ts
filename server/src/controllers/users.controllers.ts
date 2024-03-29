import { config } from 'dotenv'
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { CLIENT_MESSAGE } from '~/constants/messages'
import {
  ChangePasswordRequestBody,
  FollowUserRequestBody,
  ForgotPasswordRequestBody,
  GetUserInfoRequestParams,
  LoginRequestBody,
  LogoutRequestBody,
  RefreshTokenRequestBody,
  RegisterRequestBody,
  ResetPasswordRequestBody,
  TokenPayload,
  UnFollowUserRequestParams,
  UpdateMyProfileRequestBody,
  VerifyEmailRequestBody,
  VerifyForgotPasswordTokenRequestBody
} from '~/models/requests/User.requests'
import { User } from '~/models/schemas/User.schema'
import database from '~/services/database.services'
import userService from '~/services/users.services'
import { hashPassword } from '~/utils/crypto'
config()

export const registerController = async (req: Request<ParamsDictionary, any, RegisterRequestBody>, res: Response) => {
  const result = await userService.register(req.body)
  return res.json({
    message: CLIENT_MESSAGE.REGISTER_SUCCESS,
    result
  })
}

export const loginController = async (req: Request<ParamsDictionary, any, LoginRequestBody>, res: Response) => {
  const user = req.user as User
  const { verify } = user
  const user_id = user._id as ObjectId
  const result = await userService.login({ user_id: user_id.toString(), verify })

  return res.json({
    message: CLIENT_MESSAGE.LOGIN_SUCCESS,
    result
  })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutRequestBody>, res: Response) => {
  const { refresh_token } = req.body
  const result = await userService.logout(refresh_token)
  return res.json(result)
}

export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenRequestBody>,
  res: Response
) => {
  const { refresh_token } = req.body
  const { user_id, verify } = req.decoded_refresh_token as TokenPayload
  const result = await userService.refreshToken({ user_id, refresh_token, verify })

  return res.json({
    message: CLIENT_MESSAGE.REFRESH_TOKEN_SUCCESS,
    result
  })
}

export const verifyEmailTokenController = async (
  req: Request<ParamsDictionary, any, VerifyEmailRequestBody>,
  res: Response
) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload

  const user = await database.users.findOne({ _id: new ObjectId(user_id) })
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: CLIENT_MESSAGE.USER_NOT_FOUND
    })
  }
  if (user.email_verify_token === '' && user.verify === UserVerifyStatus.Verified) {
    return res.status(HTTP_STATUS.OK).json({
      message: CLIENT_MESSAGE.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }

  const result = await userService.verifyEmail(user_id)
  return res.json({
    message: CLIENT_MESSAGE.EMAIL_VERIFY_SUCCESS,
    result
  })
}

export const resendEmailVerifyController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await database.users.findOne({ _id: new ObjectId(user_id) })

  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: CLIENT_MESSAGE.USER_NOT_FOUND
    })
  }
  if (user.email_verify_token === '' && user.verify === UserVerifyStatus.Verified) {
    return res.status(HTTP_STATUS.OK).json({
      message: CLIENT_MESSAGE.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  const { _id } = user
  const result = await userService.resendEmailVerifyToken(_id.toString())
  return res.json(result)
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordRequestBody>,
  res: Response
) => {
  const { _id, verify } = req.user as User
  const result = await userService.forgotPassword({ user_id: _id.toString(), verify })
  return res.json(result)
}

export const verifyForgotPasswordTokenController = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordTokenRequestBody>,
  res: Response
) => {
  return res.json({
    message: CLIENT_MESSAGE.VERIFY_FORGOT_PASSWORD_SUCCESS
  })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordRequestBody>,
  res: Response
) => {
  const { password } = req.body
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const result = await userService.resetPassword(password, user_id)

  return res.json(result)
}

export const getProfileController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await userService.getProfile(user_id)
  return res.json(result)
}

export const updateMyProfileController = async (
  req: Request<ParamsDictionary, any, UpdateMyProfileRequestBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { body } = req
  const user = await userService.updateMyProfile(user_id, body)

  return res.json({
    message: CLIENT_MESSAGE.UPDATE_ME_SUCCESS,
    user
  })
}

export const getUserInfoController = async (req: Request<GetUserInfoRequestParams>, res: Response) => {
  const { username } = req.params
  const user = await userService.getUserInfo(username)
  return res.json(user)
}

export const followUserController = async (
  req: Request<ParamsDictionary, any, FollowUserRequestBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { follow_user_id } = req.body
  if (user_id === follow_user_id) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: CLIENT_MESSAGE.CANNOT_FOLLOW_YOURSELF
    })
  }
  const result = await userService.followUser(user_id, follow_user_id)
  return res.json(result)
}

export const unFollowUserController = async (req: Request<UnFollowUserRequestParams>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { user_id: followed_user_id } = req.params
  if (user_id === followed_user_id) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: CLIENT_MESSAGE.ID_CANNOT_OVERLAP
    })
  }
  const result = await userService.unFollowUser(user_id, followed_user_id)
  return res.json(result)
}

export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordRequestBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { password } = req.body
  const result = await userService.changePassword(user_id, password)
  return res.json(result)
}

export const loginOauthController = async (req: Request, res: Response) => {
  const { code } = req.query
  const result = await userService.loginOauth(code as string)
  const urlClientRedirect = `${process.env.GOOGLE_CLIENT_REDIRECT_URI}?access_token=${result.access_token}&refresh_token=${result.refresh_token}&newUser=${result.newUser}&verify=${result.verify}`
  return res.redirect(urlClientRedirect)
}
