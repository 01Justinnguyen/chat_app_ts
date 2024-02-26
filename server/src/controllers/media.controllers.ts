import { NextFunction, Request, Response } from 'express'
import { CLIENT_MESSAGE } from '~/constants/messages'
import mediaService from '~/services/media.services'

export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediaService.handleUploadSingleImage(req)

  return res.json({
    message: CLIENT_MESSAGE.UPLOAD_SUCCESS,
    result: url
  })
}
