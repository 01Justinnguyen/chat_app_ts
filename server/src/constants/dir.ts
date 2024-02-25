import path from 'path'

export const directory = {
  UPLOAD_TEMP_DIR: path.resolve('uploads/temp'),
  UPLOAD_DIR: path.resolve('uploads')
} as const
