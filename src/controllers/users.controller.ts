import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { CLIENT_MESSAGE } from '~/constants/messages'
import { LoginRequestBody, RegisterRequestBody } from '~/models/requests/User.requests'
import { User } from '~/models/schemas/User.schema'
import userService from '~/services/users.services'

export const registerController = async (req: Request<ParamsDictionary, any, RegisterRequestBody>, res: Response) => {
  const result = await userService.register(req.body)
  return res.json({
    message: CLIENT_MESSAGE.REGISTER_SUCCESS,
    result
  })
}

export const loginController = async (req: Request<ParamsDictionary, any, LoginRequestBody>, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId
  console.log('🐻 ~ loginController ~ user:', user)
  const result = await userService.login(user_id.toString())

  return res.json({
    message: CLIENT_MESSAGE.LOGIN_SUCCESS,
    result
  })
}
