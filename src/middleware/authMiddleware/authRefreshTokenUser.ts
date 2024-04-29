import {NextFunction, Request, Response} from "express";
import {RefreshTokenRepository} from "../../repositories/old-token/refreshTokenRepository";
import {JwtService} from "../../application/jwt-service";
import {UsersQueryRepository} from "../../repositoriesQuery/user-query-repository";
import {ResultStatus} from "../../_util/enum";
import {SecurityService} from "../../domain/security/security-service";


export const authRefreshTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const {refreshToken} = req.cookies
    if(!refreshToken) {
        return res.status(404).send('Token not found')
    }
    //проверяем есть ли сессия
    const searchSession = await SecurityService.searchSession(refreshToken)
    if(!searchSession){
        return res.status(401).send('Session not found')
    }
    //Проверяем статус token in db
    const StatusToken = await RefreshTokenRepository.invalidateToken(refreshToken)
    if(!StatusToken){
        return res.status(401).send('The token status in DB is invalid')
    }
    //Проверяем токен протух, id и т.д.
    const userId = await JwtService.getIdFromToken(refreshToken)//проверяем токен

    if (!userId) {
         await RefreshTokenRepository.updateRefreshValid(refreshToken)
        return res.status(401).send('JWT refreshToken has expired');
    }

    //Обновляем статус валидности  refresh token
    const upTokenValid = await RefreshTokenRepository.updateRefreshValid(refreshToken)
    if(!upTokenValid){
        return res.status(401).send('the token not update valid')
    }

    //проверка Инвалидация предыдущего refresh token
    const refreshTokenStatusValid = await RefreshTokenRepository.invalidateToken(refreshToken)
    if(refreshTokenStatusValid){
        const upTokenValid = await RefreshTokenRepository.updateRefreshValid(refreshToken)
        return res.status(401).send('The token is no longer valid')
    }

    //Находим user по id из refreshToken:
    const user = await UsersQueryRepository.findUserById(userId);


    if (!user||!user.data) {
        return res.status(401).send('JWT refreshToken has expired,user not found');
    }

    if(user){
        req.userId = userId
        return  next()
    }

}