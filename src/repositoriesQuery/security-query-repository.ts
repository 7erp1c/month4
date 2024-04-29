import {connectMongoDb} from "../db/connect-mongo-db";
import {getSecuritySessions} from "../model/authType/authType";
import {getSessionsView} from "../model/authType/authSecurityView";
import {JwtService} from "../application/jwt-service";

export const SecurityQueryRepository = {
    //search all sessions by userId
    async findAllSessions(userId: string): Promise<getSecuritySessions[]> {
        const result = await connectMongoDb
            .getCollections().securityCollection.find({
                userId: userId
            }, {projection: {_id: 0}}).toArray()
        return result.map(getSessionsView)
    },
    async findSessionByDeviceId(deviceId:string){
    const result = await connectMongoDb
        .getCollections().securityCollection.findOne({deviceId:deviceId}, {projection: {_id: 0}})
    if(!result)return null
        return result
},
    async userSessionSearch(deviceId:string,token:string){
        const userId = await JwtService.decodeRefreshToken(token)
        const session =  await connectMongoDb
            .getCollections().securityCollection.findOne({deviceId:deviceId}, {projection: {_id: 0}})
        if(userId?.userId!==session?.userId){
            return null
        }
        return true
    }


}