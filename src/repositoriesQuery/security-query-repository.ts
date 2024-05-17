
import {getSecuritySessions} from "../model/authType/authType";
import {getSessionsView} from "../model/authType/authSecurityView";
import {SecurityModel, UserModel} from "../db/mongoose/models";
import {inject, injectable} from "inversify";
import {JwtService} from "../domain/jwt-service";
import {SecurityService} from "../domain/security-service";
@injectable()
export class SecurityQueryRepository  {
    constructor(
        @inject(JwtService) protected jwtService:JwtService,
        @inject(SecurityService) protected securityService:SecurityService
    ) {
    }
    //search all sessions by userId
    async findAllSessions(userId: string): Promise<getSecuritySessions[]> {
        const result = await SecurityModel
            .find({userId: userId}, {projection: {_id: 0}}).lean()
        return result.map(getSessionsView)
    }
    // async findSessionByDeviceId(deviceId: string) {
    //     const result = await SecurityModel
    //         .findOne({deviceId: deviceId}, {projection: {_id: 0}})
    //     if (!result) return null
    //     return result
    // }
    async userSessionSearch(deviceId: string, token: string) {
        const userId = await this.jwtService.decodeRefreshToken(token)
        const session = await SecurityModel
            .findOne({deviceId: deviceId}, {projection: {_id: 0}})
        if (userId?.userId !== session?.userId) {
            return null
        }
        return true
    }


}