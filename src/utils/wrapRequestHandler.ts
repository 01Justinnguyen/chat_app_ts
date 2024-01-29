import { NextFunction, Request, RequestHandler, Response } from 'express'

// type FuncType = (req: Request, res: Response, next: NextFunction) => Promise<any>

export const wrapRequestHandler = (func: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}
