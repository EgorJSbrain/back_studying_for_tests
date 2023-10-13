import { NextFunction, Request, Response } from 'express'
import { HTTP_STATUSES } from '../constants/global'
import { JwtService } from '../applications/jwt-service'

export const authJWTMiddleware = async(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | undefined> => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(' ')[1]

    const userId = JwtService.getUserIdByToken(token)

    if (userId) {
      req.userId = userId

      next()
    }
  } else {
    return res.sendStatus(HTTP_STATUSES.NOT_AUTHORIZED_401)
  }
}