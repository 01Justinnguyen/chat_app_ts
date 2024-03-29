import { JwtPayload } from 'jsonwebtoken'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import { ParamsDictionary } from 'express-serve-static-core'

export interface RegisterRequestBody {
  email: string
  name: string
  password: string
  date_of_birth: string
}

export interface LoginRequestBody {
  email: string
  password: string
}

export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
  verify: UserVerifyStatus
}

export interface LogoutRequestBody {
  refresh_token: string
}

export interface RefreshTokenRequestBody {
  refresh_token: string
}

export interface VerifyEmailRequestBody {
  email_verify_token: string
}

export interface ForgotPasswordRequestBody {
  email: string
}

export interface VerifyForgotPasswordTokenRequestBody {
  forgot_password_token: string
}

export interface ResetPasswordRequestBody extends VerifyForgotPasswordTokenRequestBody {
  password: string
  confirm_password: string
}

export interface UpdateMyProfileRequestBody {
  name?: string
  date_of_birth?: string
  bio?: string
  location?: string
  website?: string
  username?: string
  avatar?: string
  cover_photo?: string
}

export interface FollowUserRequestBody {
  follow_user_id: string
}

export interface ChangePasswordRequestBody {
  old_password: string
  password: string
  confirm_password: string
}

export interface UnFollowUserRequestParams extends ParamsDictionary {
  user_id: string
}

export interface GetUserInfoRequestParams extends ParamsDictionary {
  username: string
}
