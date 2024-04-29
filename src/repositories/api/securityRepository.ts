import {connectMongoDb} from "../../db/connect-mongo-db";
import {SessionsAddDB} from "../../model/authType/authType";
import {JwtService} from "../../application/jwt-service";

export const securityRepository = {

    async saveRequestInformation(ip: string, url: string) {
        const result = await connectMongoDb.getCollections().apiLogCollection.insertOne({
            IP: ip,
            URL: url,
            date: new Date()
        });
    },
    async countRequestByTime(ip: string, url: string, interval: number) {

        const timeCheck = (new Date(Date.now() - (1000 * interval)));

        const searchKey = {

            IP: ip,
            URL: url,
            date: {$gte: timeCheck}

        };
        return await connectMongoDb.getCollections().apiLogCollection.countDocuments(searchKey);
    },
    //закидываем сессию в db
    async createNewSession(newSession: SessionsAddDB) {
        await connectMongoDb.getCollections().securityCollection.insertOne(newSession)
    },
    //удаляем все сессии User кроме актуальной, протуханим токены User, кроме актуального
    async deleteDevicesSessions(userId: string, token: string) {
        const decode = await JwtService.decodeRefreshToken(token)
        const deviceId = decode?.deviceId
        // Получаем все сессии для данного пользователя
        const userDevices = await connectMongoDb.getCollections().securityCollection.find({userId}).toArray();
        // Удаляем все сессии, кроме текущей
        for (const device of userDevices) {
            if (device.deviceId !== deviceId) {
                await connectMongoDb.getCollections().securityCollection.deleteMany({deviceId: device.deviceId});
            }
        }
        // Получаем все токены для данного пользователя
        const userToken = await connectMongoDb.getCollections().refreshTokenCollection.find({userId}).toArray();
        console.log("Array Token"+userToken)
        // Протуханим все  токены , кроме текущего
        for (const status of userToken) {
            if (status.deviceId !== deviceId) {
                await connectMongoDb.getCollections().refreshTokenCollection
                    .updateMany({userId, deviceId: status.deviceId}, {$set: {isValid: false}});
            }
        }
    },
    //удаляем по deviceId
    async deleteDevicesSessionsById(id: string): Promise<boolean> {
        const result = await connectMongoDb.getCollections().securityCollection.deleteOne({deviceId: id})
        return result.deletedCount === 1
    },
    async updateDataToken(token: string): Promise<boolean> {
        const decode = await JwtService.decodeRefreshToken(token)
        const decodeIat = Number(decode?.iat)
        const decodeExp = Number(decode?.exp)
        const iatIsoString = new Date(decodeIat * 1000).toISOString();
        const expIsoString = new Date(decodeExp * 1000).toISOString();
        const result = await connectMongoDb.getCollections().securityCollection
            .updateOne({userId: decode?.userId, deviceId: decode?.deviceId}, {
                $set: {
                    lastActiveDate: iatIsoString,
                    "refreshToken.createdAt": iatIsoString,
                    "refreshToken.expiredAt": expIsoString
                }
            })
        return result.matchedCount === 1
    },


}