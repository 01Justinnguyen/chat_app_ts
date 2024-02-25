import { Request } from 'express'
import formidable, { File } from 'formidable'
import fs from 'fs'
import path from 'path'
import { directory } from '~/constants/dir'
import { CLIENT_MESSAGE } from '~/constants/messages'

export const initFolderUploads = () => {
  if (!fs.existsSync(path.resolve(directory.UPLOAD_TEMP_DIR))) {
    fs.mkdirSync(path.resolve(directory.UPLOAD_TEMP_DIR), {
      // Mục đích để tạo folder nested
      recursive: true
    })
  }
}

export const handleUploadSingleImage = async (req: Request) => {
  const form = formidable({
    uploadDir: path.resolve(directory.UPLOAD_TEMP_DIR),
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

  return new Promise<File>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      // eslint-disable-next-line no-extra-boolean-cast
      if (Object.entries(files).length === 0 && !Boolean(files.image)) {
        return reject(new Error(CLIENT_MESSAGE.FILE_IS_EMPTY))
      }
      resolve((files.image as File[])[0])
    })
  })
}

export const getNameFromFullName = (fullname: string) => {
  const nameArr = fullname.split('.')
  nameArr.pop()
  return nameArr.join('')
}
