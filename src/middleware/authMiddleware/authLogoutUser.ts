import {NextFunction, Request, Response} from "express";
import {JwtService} from "../../application/jwt-service";
import {RefreshTokenRepository} from "../../repositories/old-token/refreshTokenRepository";
import {connectMongoDb} from "../../db/connect-mongo-db";
import {SecurityService} from "../../domain/security/security-service";


export const authTokenLogoutMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const {refreshToken} = req.cookies
    if (!refreshToken) {
        return res.status(401).send('JWT refreshToken is missing');
    }
    const findRefreshToken = await RefreshTokenRepository.checkToken(refreshToken)
    if (!findRefreshToken) {//если  token не найден в DB
        return res.status(401).send('JWT refreshToken is missing 2');
    }
    //проверяем есть ли сессия
    const searchSession = await SecurityService.searchSession(refreshToken)
    if(!searchSession){
        return res.status(401).send('Session not found')
    }
    //проверяем токен протух, id и т.д.
    const userId = await JwtService.getIdFromToken(refreshToken)//проверяем токен
    if (!userId) {
        const upTokenValid = await RefreshTokenRepository.updateRefreshValid(refreshToken)
        return res.status(401).send('Unauthorized 1');
    }
    //проверяем статус в DB
    const refreshTokenStatusValid = await RefreshTokenRepository.invalidateToken(refreshToken)
    if (!refreshTokenStatusValid) {
        return res.status(401).send('the token is invalid')
    }

    const cleanDb = await SecurityService.clean(refreshToken)
    if(!cleanDb){
        return res.status(401).send('the token is invalid 2')
    }

    if (refreshTokenStatusValid) {
        return next()
    }

}
