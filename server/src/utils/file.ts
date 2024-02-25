import { Request } from 'express'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import { CLIENT_MESSAGE } from '~/constants/messages'

export const initFolderUploads = () => {
  if (!fs.existsSync(path.resolve('uploads'))) {
    fs.mkdirSync(path.resolve('uploads'), {
      // Mục đích để tạo folder nested
      recursive: true
    })
  }
}

export const handleUploadSingleImage = async (req: Request) => {
  const form = formidable({
    uploadDir: path.resolve('uploads'),
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 300 * 1024,
    filter: function ({ name, originalFilename, mimetype }) {
      // name là key mà client truyền lên
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }
      return valid
    }
  })

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      // eslint-disable-next-line no-extra-boolean-cast
      if (Object.entries(files).length === 0 && !Boolean(files.image)) {
        return reject(new Error(CLIENT_MESSAGE.FILE_IS_EMPTY))
      }
      resolve(files)
    })
  })
}
