import {NextFunction, Request, Response} from "express";
import {JwtService} from "../../domain/jwt-service";
import {RefreshTokenRepository} from "../../repositories/refreshTokenRepository";

import {SecurityService} from "../../domain/security-service";
import {jwtService, refreshTokenRepository, securityService} from "../../composition-root";


export const authTokenLogoutMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const {refreshToken} = req.cookies
    if (!refreshToken) {
        return res.status(401).send('JWT refreshToken is missing');
    }
    const findRefreshToken = await refreshTokenRepository.checkToken(refreshToken)
    if (!findRefreshToken) {//если  token не найден в DB
        return res.status(401).send('JWT refreshToken is missing 2');
    }
    //проверяем есть ли сессия
    const searchSession = await securityService.searchSession(refreshToken)
    if(!searchSession){
        return res.status(401).send('Session not found')
    }
    //проверяем токен протух, id и т.д.
    const userId = await jwtService.getIdFromToken(refreshToken)//проверяем токен
    if (!userId) {
        const upTokenValid = await refreshTokenRepository.updateRefreshValid(refreshToken)
        return res.status(401).send('Unauthorized 1');
    }
    //проверяем статус в DB
    const refreshTokenStatusValid = await refreshTokenRepository.invalidateToken(refreshToken)
    if (!refreshTokenStatusValid) {
        return res.status(401).send('the token is invalid')
    }

    const cleanDb = await securityService.clean(refreshToken)
    if(!cleanDb){
        return res.status(401).send('the token is invalid 2')
    }


        return next()


}
