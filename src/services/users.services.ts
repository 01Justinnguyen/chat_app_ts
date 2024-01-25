import { RegisterRequestBody } from '~/models/requests/User.requests'
import database from './database.services'
import { User } from '~/models/schemas/Users.schema'

class UserService {
  async register(payload: RegisterRequestBody) {
    const result = await database.user.insertOne(
      new User({
        ...payload,
        date_of_birth: new Date(payload.date_of_birth)
      })
    )

    return result
  }

  async checkEmailExists(email: string) {
    const result = await database.user.findOne({ email })
    return Boolean(result)
  }
}

const userService = new UserService()

export default userService
