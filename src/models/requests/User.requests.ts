import { JwtPayload } from 'jsonwebtoken'
import { TokenType, UserVerifyStatus } from '~/constants/enum'

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
