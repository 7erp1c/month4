import {Request, Response, NextFunction} from "express";
import {JwtService} from "../../domain/jwt-service";
import {container} from "../../composition-root";

const jwtService = container.get<JwtService>(JwtService)

export const authRefreshTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const {refreshToken} = req.cookies
    if (!refreshToken) {
        res.sendStatus(401)
        return
    }

    const userId = await jwtService.getIdFromToken(refreshToken)
    // console.log("userId: "+ userId)
    if (userId) {
        req.userId = userId
        //req.user = await UsersService.findUserById(userId)
        // console.log("user: "+ req.user)
      return  next()
    }
  return  res.send(401)

}

