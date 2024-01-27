import { config } from 'dotenv'
import jwt, { SignOptions } from 'jsonwebtoken'
config()
export const signToken = ({
  payload,
  privateKey = process.env.SECRET_JWT_KEY as string,
  options = { algorithm: 'HS256' }
}: {
  payload: string | Buffer | object
  privateKey?: string
  options?: SignOptions
}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (err, token) => {
      if (err) {
        throw reject(err)
      }
      resolve(token as string)
    })
  })
}
