import { NextFunction, Request, Response } from 'express'
import formidable from 'formidable'
import path from 'path'
import { CLIENT_MESSAGE } from '~/constants/messages'
import { handleUploadSingleImage } from '~/utils/file'

export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await handleUploadSingleImage(req)

  return res.json(result)
}
