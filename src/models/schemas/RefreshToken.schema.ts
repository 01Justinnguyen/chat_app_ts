import { ObjectId } from 'mongodb'

interface RefreshTokenType {
  _id?: ObjectId
  user_id: ObjectId
  token: string
  created_at?: Date
}

export class RefreshToken {
  _id?: ObjectId
  user_id: ObjectId
  token: string
  created_at: Date
  constructor(refreshToken: RefreshTokenType) {
    this._id = refreshToken._id
    this.user_id = refreshToken.user_id
    this.token = refreshToken.token
    this.created_at = refreshToken.created_at || new Date()
  }
}
