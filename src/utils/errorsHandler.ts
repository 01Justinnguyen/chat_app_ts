import { Response, Request, NextFunction } from 'express'

export const errorsHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(500).send({ error: err.message })
}
