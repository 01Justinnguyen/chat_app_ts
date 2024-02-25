import { Request } from 'express'
import { getNameFromFullName, handleUploadSingleImage } from '~/utils/file'
import sharp from 'sharp'
import { directory } from '~/constants/dir'
import path from 'path'
import fs from 'fs'

class MediaService {
  async handleUploadSingleImage(req: Request) {
    const file = await handleUploadSingleImage(req)
    const newName = getNameFromFullName(file.newFilename)
    const newPath = path.resolve(directory.UPLOAD_DIR, `${newName}.jpg`)
    sharp.cache(false)
    await sharp(file.filepath).jpeg({}).toFile(newPath)
    fs.unlinkSync(file.filepath)
    return `http://localhost:4000/uploads/${newName}.jpg`
  }
}

const mediaService = new MediaService()

export default mediaService
