import { RegisterRequestBody } from '~/models/requests/User.requests'
import database from './database.services'
import { User } from '~/models/schemas/User.schema'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType } from '~/constants/enum'
import { config } from 'dotenv'
import { RefreshToken } from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import { CLIENT_MESSAGE } from '~/constants/messages'
config()

class UserService {
  private signAccessToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken },
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
    })
  }

  private signRefreshToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.RefreshToken },
      options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
    })
  }

  private signAccessAndRefreshToken(user_id: string) {
    return Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)])
  }
  async register(payload: RegisterRequestBody) {
    const result = await database.user.insertOne(
      new User({
        ...payload,
        password: hashPassword(payload.password),
        date_of_birth: new Date(payload.date_of_birth)
      })
    )
    const user_id = result.insertedId.toString()
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
    const result = await database.user.findOne({ email })
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
      message: CLIENT_MESSAGE.LOGIN_SUCCESS
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
}

const userService = new UserService()

export default userService
