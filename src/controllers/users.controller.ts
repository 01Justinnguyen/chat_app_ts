import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { CLIENT_MESSAGE } from '~/constants/messages'
import { RegisterRequestBody } from '~/models/requests/User.requests'
import userService from '~/services/users.services'

export const registerController = async (req: Request<ParamsDictionary, any, RegisterRequestBody>, res: Response) => {
  try {
    const result = await userService.register(req.body)
    return res.json({
      message: CLIENT_MESSAGE.REGISTER_SUCCESS,
      result
    })
  } catch (error) {
    return res.json(error)
  }
}
