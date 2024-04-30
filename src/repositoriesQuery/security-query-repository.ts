
import {getSecuritySessions} from "../model/authType/authType";
import {getSessionsView} from "../model/authType/authSecurityView";
import {JwtService} from "../application/jwt-service";
import {SecurityModel, UserModel} from "../db/mongoose/models";

export const SecurityQueryRepository = {
    //search all sessions by userId
    async findAllSessions(userId: string): Promise<getSecuritySessions[]> {
        const result = await SecurityModel
            .find({userId: userId}, {projection: {_id: 0}}).lean()
        return result.map(getSessionsView)
    },
    async findSessionByDeviceId(deviceId: string) {
        const result = await SecurityModel
            .findOne({deviceId: deviceId}, {projection: {_id: 0}})
        if (!result) return null
        return result
    },
    async userSessionSearch(deviceId: string, token: string) {
        const userId = await JwtService.decodeRefreshToken(token)
        const session = await SecurityModel
            .findOne({deviceId: deviceId}, {projection: {_id: 0}})
        if (userId?.userId !== session?.userId) {
            return null
        }
        return true
    }


}