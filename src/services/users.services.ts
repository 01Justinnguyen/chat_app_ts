import { RegisterRequestBody } from '~/models/requests/User.requests'
import database from './database.services'
import { User } from '~/models/schemas/User.schema'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import { config } from 'dotenv'
import { RefreshToken } from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import { CLIENT_MESSAGE } from '~/constants/messages'
config()

class UserService {
  private signAccessToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken },
      privateKey: process.env.SECRET_JWT_ACCESS_TOKEN_KEY as string,
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
    })
  }

  private signRefreshToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.RefreshToken },
      privateKey: process.env.SECRET_JWT_REFRESH_TOKEN_KEY as string,
      options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
    })
  }

  private signEmailVerifyToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.EmailVerificationToken },
      privateKey: process.env.SECRET_JWT_EMAIL_VERIFY_TOKEN_KEY as string,
      options: { expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN }
    })
  }

  private signForgotPasswordToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.ForgotPasswordToken },
      privateKey: process.env.SECRET_JWT_FORGOT_PASSWORD_TOKEN_KEY as string,
      options: { expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN }
    })
  }
  private signAccessAndRefreshToken(user_id: string) {
    return Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)])
  }

  async register(payload: RegisterRequestBody) {
    const user_id = new ObjectId().toString()
    const email_verify_token = await this.signEmailVerifyToken(user_id)
    await database.users.insertOne(
      new User({
        ...payload,
        _id: new ObjectId(user_id),
        email_verify_token: email_verify_token,
        password: hashPassword(payload.password),
        date_of_birth: new Date(payload.date_of_birth)
      })
    )
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id)

    await database.refreshToken.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: refresh_token
      })
    )

    return {
      access_token,
      refresh_token
    }
  }

  async checkEmailExists(email: string) {
    const result = await database.users.findOne({ email })
    return Boolean(result)
  }

  async login(user_id: string) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id)

    await database.refreshToken.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: refresh_token
      })
    )

    return {
      access_token,
      refresh_token
    }
  }

  async logout(refresh_token: string) {
    await database.refreshToken.deleteOne({ token: refresh_token })
    return {
      message: CLIENT_MESSAGE.LOGOUT_SUCCESS
    }
  }

  async refreshToken({ user_id, refresh_token }: { user_id: string; refresh_token: string }) {
    const [new_access_token, new_refresh_token] = await Promise.all([
      this.signAccessToken(user_id),
      this.signRefreshToken(user_id),
      database.refreshToken.deleteOne({ token: refresh_token })
    ])
    await database.refreshToken.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: new_refresh_token
      })
    )

    return {
      new_access_token,
      new_refresh_token
    }
  }

  async verifyEmail(user_id: string) {
    const [token] = await Promise.all([
      this.signAccessAndRefreshToken(user_id),
      database.users.updateOne(
        {
          _id: new ObjectId(user_id)
        },
        [
          {
            $set: {
              email_verify_token: '',
              verify: UserVerifyStatus.Verified,
              updated_at: '$$NOW'
            }
          }
        ]
      )
    ])

    const [access_token, refresh_token] = token

    return {
      access_token,
      refresh_token
    }
  }

  async resendEmailVerifyToken(user_id: string) {
    const email_verify_token = await this.signEmailVerifyToken(user_id)
    console.log('🐻 ~ UserService ~ resendEmailVerifyToken ~ email_verify_token:', email_verify_token)
    await database.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          email_verify_token: email_verify_token,
          updated_at: '$$NOW'
        }
      }
    ])

    return {
      email_verify_token,
      message: CLIENT_MESSAGE.RESEND_VERIFY_EMAIL_SUCCESS
    }
  }

  async forgotPassword({ user_id }: { user_id: string }) {
    const forgot_password_token = await this.signForgotPasswordToken(user_id)
    await database.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          forgot_password_token: forgot_password_token,
          updated_at: '$$NOW'
        }
      }
    ])
    // gửi email kèm đường link đến email người dùng
    console.log('🐻 ~ UserService ~ forgotPassword ~ forgot_password_token:', forgot_password_token)

    return {
      message: CLIENT_MESSAGE.CHECK_EMAIL_TO_RESET_PASSWORD
    }
  }

  async resetPassword(password: string, user_id: string) {
    await database.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          forgot_password_token: '',
          password: hashPassword(password)
        },
        $currentDate: {
          updated_at: true
        }
      }
    )

    return {
      message: CLIENT_MESSAGE.RESET_PASSWORD_SUCCESS
    }
  }
}

const userService = new UserService()

export default userService
