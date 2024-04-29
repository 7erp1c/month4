import {JwtService} from "../../application/jwt-service";
import {SessionsAddDB} from "../../model/authType/authType";
import {securityRepository} from "../../repositories/api/securityRepository";
import {connectMongoDb} from "../../db/connect-mongo-db";
import {SecurityQueryRepository} from "../../repositoriesQuery/security-query-repository";

export const SecurityService = {
    async createAuthSession(refreshToken: string, deviceTitle: string, ip: string) {
        const decodedToken = await JwtService.decodeRefreshToken(refreshToken);
        if (!decodedToken) return null;
        // Преобразование iat и exp в строки формата ISO 8601
        const decodeIat = Number(decodedToken.iat)
        const decodeExp = Number(decodedToken.exp)
        const iatIsoString = new Date(decodeIat * 1000).toISOString();
        const expIsoString = new Date(decodeExp * 1000).toISOString();
        const newSession: SessionsAddDB = {
            userId: decodedToken.userId,
            deviceId: decodedToken.deviceId,
            deviceTitle: deviceTitle,
            ip: ip,
            lastActiveDate: iatIsoString,
            refreshToken: {
                createdAt: iatIsoString,
                expiredAt: expIsoString,
            }
        };
        console.log([newSession])
        await securityRepository.createNewSession(newSession);
        //добавляем tokenRefresh в DB

        return newSession;
    },
    async deleteDevicesSessions(userId: string, token: string) {
        await securityRepository.deleteDevicesSessions(userId, token)
        return await connectMongoDb.getCollections().securityCollection.countDocuments()

    },
    async deleteDevicesSessionById(id: string): Promise<boolean> {
        return await securityRepository.deleteDevicesSessionsById(id)
    },
    //обновляем данные в db после обновления refresh token
    async updateDataRefreshTokenInSession(token: string) {
        return await securityRepository.updateDataToken(token)
    },
    //поиск сессии
    async searchSession(token: string) {
        const decode = await JwtService.decodeRefreshToken(token)
        if (!decode) {
            return null
        }
        const searchSession = await SecurityQueryRepository.findSessionByDeviceId(decode.deviceId)
        if (!searchSession) {
            return null
        }
        return true
    },
    async clean(token: string) {
        const decode = await JwtService.decodeRefreshToken(token)
        if (!decode)return null
        //удаляем сессию
        const delAllS = await SecurityService.deleteDevicesSessionById(decode?.deviceId)
        //удаляем токен из DB
        const delAllT = await connectMongoDb.getCollections().refreshTokenCollection.deleteMany({deviceId: decode?.deviceId})
        if(!delAllS||!delAllT){
            return null
        }
        return true
    },
    async title(agent:string){

    }

}