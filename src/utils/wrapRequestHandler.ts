import { NextFunction, Request, Response } from 'express'

type funcType = (req: Request, res: Response, next: NextFunction) => Promise<any>
export const wrapRequestHandler = (func: funcType) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    await func(req, res, next)
  } catch (error) {
    next(error)
  }
}
