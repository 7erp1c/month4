import {SessionsAddDB} from "../model/authType/authType";
import {SecurityRepository} from "../repositories/securityRepository";
import {SecurityQueryRepository} from "../repositoriesQuery/security-query-repository";
import { SecurityModel} from "../db/mongoose/models";
import {jwtService} from "../composition-root";

export class SecurityService  {
    constructor(
        protected securityRepository:SecurityRepository,
        protected securityQueryRepository:SecurityQueryRepository
    ) {}
    async createAuthSession(refreshToken: string, deviceTitle: string, ip: string) {
        const decodedToken = await jwtService.decodeRefreshToken(refreshToken);
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
        await this.securityRepository.createNewSession(newSession);
        //добавляем tokenRefresh в DB

        return newSession;
    }
    async deleteDevicesSessions(userId: string, token: string) {
        await this.securityRepository.deleteDevicesSessions(userId, token)
        return  SecurityModel.countDocuments()

    }
    async deleteDevicesSessionById(id: string): Promise<boolean> {
        return await this.securityRepository.deleteDevicesSessionsById(id)
    }
    //обновляем данные в db после обновления refresh token
    async updateDataRefreshTokenInSession(token: string) {
        return await this.securityRepository.updateDataToken(token)
    }
    //поиск сессии
    async searchSession(token: string) {
        const decode = await jwtService.decodeRefreshToken(token)
        if (!decode) {
            return null
        }
        const searchSession = await this.securityQueryRepository.findSessionByDeviceId(decode.deviceId)
        if (!searchSession) {
            return null
        }
        return true
    }
    async clean(token: string) {
        const decode = await jwtService.decodeRefreshToken(token)
        if (!decode)return null
        //удаляем сессию
        const delAllS = await this.deleteDevicesSessionById(decode?.deviceId)
        //удаляем токен из DB
        const delAllT = await jwtService.deleteByDeviseId( decode?.deviceId)
        if(!delAllS||!delAllT){
            return null
        }
        return true
    }
    async title(agent:string){

    }

}