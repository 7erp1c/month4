import jwt from 'jsonwebtoken';
import {expiresIn, settings} from "../setting";
import {ObjectId} from "mongodb";
import {RefreshTokenRepository} from "../repositories/refreshTokenRepository";
import {v4 as uuidv4} from "uuid";
import {RefreshTokenPayloadType, twoTokenType} from "../model/authType/authType";
import {SecurityService} from "./security-service";
import {Result} from "../_util/result.type";
import {ResultStatus} from "../_util/enum";
import {RefreshTokenModel} from "../db/mongoose/models";
import {refreshTokenRepository} from "../composition-root";


export class JwtService  {
    constructor(
        protected refreshTokenRepository:RefreshTokenRepository,
        protected securityService:SecurityService
    ) {}
    async addTokenInDB(token: string) {
         const decode = await this.decodeRefreshToken(token)
        const createToken = {
            oldToken: token,
            userId:decode?.userId,
            deviceId: decode?.deviceId,
            isValid: true,
        }
        const oldToken = await this.refreshTokenRepository.addToken(createToken)
        if (!oldToken) return null
        return true
    }
    async twoToken(id:string,deviceTitle:string,ip:string):Promise<Result<twoTokenType| null>>{
      const access = await this.createJWT(id)
        const refresh = await this.createJWTRefresh(id)

        if(!access||!refresh) return {
            status: ResultStatus.Unauthorized,
            extensions: [{ field: 'twoToken', message: "The token has not been created" }] ,
            data: null,
        }
        const createSessions = await this.securityService.createAuthSession(refresh, deviceTitle, ip)
        if(!createSessions) return {
            status: ResultStatus.Unauthorized,
            extensions: [{ field: 'twoToken', message: "The token has not been created" }] ,
            data: null,
        }
        await this.addTokenInDB(refresh)
        return {
            status: ResultStatus.Success,
            data: {
                access,
                refresh
            }
        }
    }
    async tokenUpdate(id:string,token:string):Promise<Result<twoTokenType| null>>{
        const access = await this.createJWT(id)
        const refresh = await this.updateJWTRefresh(token)

        if(!access||!refresh) return {
            status: ResultStatus.Unauthorized,
            extensions: [{ field: 'twoToken', message: "The token has not been created" }] ,
            data: null,
        }
        await this.addTokenInDB(refresh)
        return {
            status: ResultStatus.Success,
            data: {
                access,
                refresh
            }
        }
    }
    //создание access токена
    async createJWT(id: string) {
        return jwt
            .sign({userId: id}, settings.JWT_SECRET, {expiresIn: expiresIn.accessTime})
    }
    //создание refresh токена
    async createJWTRefresh(id: string) {
        const deviceId = uuidv4()
        return jwt
            .sign({userId: id, deviceId: deviceId}, settings.JWT_SECRET, {expiresIn: expiresIn.refreshTime})
    }
    //обновление refresh токена
    async updateJWTRefresh(token: string) {
        const decode = await this.decodeRefreshToken(token)
        const newToken = jwt.sign({
            userId: decode?.userId,
            deviceId: decode?.deviceId
        }, settings.JWT_SECRET, {expiresIn: expiresIn.refreshTime})
        const updateDataRefreshToken = await this.securityService.updateDataRefreshTokenInSession(newToken)

        if (!newToken) return null
        return newToken
    }
    //userId in global variable
    async getIdFromToken(token: string) {
        console.log("getIdFromToken(token:string)______" + token)
        try { //достаём из token userId
            const result: any = jwt.verify(token, settings.JWT_SECRET)
            return (new ObjectId((result.userId))).toString()
        } catch (error) {
            return null
        }
    }
    async updateDBJWT(token:string) {
        await this.refreshTokenRepository.updateRefreshValid(token)
    }
    async decode(token: string) {
        return jwt.decode(token)
    }
    async decodeRefreshToken(token: string): Promise<RefreshTokenPayloadType | null> {

        const decodedToken: any = await this.decode(token);
        if (!decodedToken) return null;
        return {
            userId: decodedToken.userId,
            deviceId: decodedToken.deviceId,
            iat: decodedToken.iat,
            exp: decodedToken.exp
        }
    }
    async checkToken(token:string){
        return await refreshTokenRepository.checkToken(token)

    }
    async updateRefreshValid(token:string) {
        await this.refreshTokenRepository.updateRefreshValid(token)
    }
    async deleteByDeviseId(deviseId:string) {
        return await this.refreshTokenRepository.deleteByDeviseId(deviseId)
    }


}