import { Request, Response, Router } from 'express'

const usersRouter = Router()

usersRouter.get('/', (req: Request, res: Response) => {
  return res.json({
    message: 'This is user'
  })
})

export default usersRouter
