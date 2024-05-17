import {RefreshTokenPayloadType, SessionsAddDB} from "../model/authType/authType";
import {SecurityRepository} from "../repositories/securityRepository";
import {SecurityQueryRepository} from "../repositoriesQuery/security-query-repository";
import {RefreshTokenModel, SecurityModel} from "../db/mongoose/models";
import {inject, injectable} from "inversify";
import {JwtService} from "./jwt-service";
import jwt from "jsonwebtoken";
@injectable()
export class SecurityService  {
    constructor(
        @inject(SecurityRepository) protected securityRepository:SecurityRepository,
    ) {}
    async createAuthSession(refreshToken: string, deviceTitle: string, ip: string) {
        const decodedToken = await this._decodeRefreshToken(refreshToken);
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
        const decode = await this._decodeRefreshToken(token)
        const deviceId = decode!.deviceId as string
        await this.securityRepository.deleteDevicesSessions(userId, deviceId)
        return  SecurityModel.countDocuments()

    }
    async deleteDevicesSessionById(id: string): Promise<boolean> {
        return await this.securityRepository.deleteDevicesSessionsById(id)
    }
    //обновляем данные в db после обновления refresh token
    async updateDataRefreshTokenInSession(token: string) {
        const decode = await this._decodeRefreshToken(token)
        const decodeIat = Number(decode?.iat)
        const decodeExp = Number(decode?.exp)
        const iat = new Date(decodeIat * 1000).toISOString();
        const exp = new Date(decodeExp * 1000).toISOString();
        return await this.securityRepository.updateDataToken({
            userId: decode!.userId,
            deviceId:decode!.deviceId,
            iat,
            exp
        })
    }
    //поиск сессии
    async searchSession(token: string) {
        const decode = await this._decodeRefreshToken(token)
        if (!decode) {
            return null
        }
        const searchSession = await this.securityRepository.findSessionByDeviceId(decode.deviceId)
        if (!searchSession) {
            return null
        }
        return true
    }
    async clean(token: string) {
        const decode = await this._decodeRefreshToken(token)
        if (!decode)return null
        //удаляем сессию
        const delAllS = await this.deleteDevicesSessionById(decode?.deviceId)
        //удаляем токен из DB
        const delAllT =  await RefreshTokenModel.deleteMany({deviceId: decode?.deviceId})
        if(!delAllS||!delAllT){
            return null
        }
        return true
    }
    async _decodeRefreshToken(token: string): Promise<RefreshTokenPayloadType | null> {

        const decodedToken: any = await this.decode(token);
        if (!decodedToken) return null;
        return {
            userId: decodedToken.userId,
            deviceId: decodedToken.deviceId,
            iat: decodedToken.iat,
            exp: decodedToken.exp
        }
    }
    async decode(token: string) {
        return jwt.decode(token)
    }

}