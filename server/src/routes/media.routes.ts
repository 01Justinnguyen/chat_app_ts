import { Router } from 'express'
import { uploadSingleImageController } from '~/controllers/media.controllers'
import { wrapRequestHandler } from '~/utils/wrapRequestHandler'

const mediaRoutes = Router()

mediaRoutes.post('/upload-image', wrapRequestHandler(uploadSingleImageController))

export default mediaRoutes
