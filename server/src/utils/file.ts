import fs from 'fs'
import path from 'path'

export const initFolderUploads = () => {
  if (!fs.existsSync(path.resolve('uploads'))) {
    fs.mkdirSync(path.resolve('uploads'), {
      // Mục đích để tạo folder nested
      recursive: true
    })
  }
}
