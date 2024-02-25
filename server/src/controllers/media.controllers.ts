import { NextFunction, Request, Response } from 'express'
import formidable from 'formidable'
import path from 'path'
import { CLIENT_MESSAGE } from '~/constants/messages'

export const uploadSingleImageController = (req: Request, res: Response, next: NextFunction) => {
  const form = formidable({
    uploadDir: path.resolve('uploads'),
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 300 * 1024
  })

  form.parse(req, (err, fields, files) => {
    if (err) {
      throw err
    }
    res.json({ message: CLIENT_MESSAGE.UPLOAD_SUCCESS })
  })
}
