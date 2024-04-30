import {SessionsAddDB} from "../../model/authType/authType";
import {JwtService} from "../../application/jwt-service";
import {ApiRequestModel, SecurityModel} from "../../db/mongoose/models";

export const securityRepository = {

    async saveRequestInformation(ip: string, url: string) {
        const result = await ApiRequestModel.create({
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
        return  ApiRequestModel.countDocuments(searchKey);
    },
    //закидываем сессию в db
    async createNewSession(newSession: SessionsAddDB) {
        await SecurityModel.create(newSession)
    },
    //удаляем все сессии User кроме актуальной, протуханим токены User, кроме актуального
    async deleteDevicesSessions(userId: string, token: string) {
        const decode = await JwtService.decodeRefreshToken(token)
        const deviceId = decode?.deviceId
        // Получаем все сессии для данного пользователя
        const userDevices = await SecurityModel.find({userId}).lean();
        // Удаляем все сессии, кроме текущей
        for (const device of userDevices) {
            if (device.deviceId !== deviceId) {
                await SecurityModel.deleteMany({deviceId: device.deviceId});
            }
        }
        // Получаем все токены для данного пользователя
        const userToken = await SecurityModel.find({userId}).lean();
        console.log("Array Token"+userToken)
        // Протуханим все  токены , кроме текущего
        for (const status of userToken) {
            if (status.deviceId !== deviceId) {
                await SecurityModel
                    .updateMany({userId, deviceId: status.deviceId}, {$set: {isValid: false}});
            }
        }
    },
    //удаляем по deviceId
    async deleteDevicesSessionsById(id: string): Promise<boolean> {
        const result = await SecurityModel.deleteOne({deviceId: id})
        return result.deletedCount === 1
    },
    async updateDataToken(token: string): Promise<boolean> {
        const decode = await JwtService.decodeRefreshToken(token)
        const decodeIat = Number(decode?.iat)
        const decodeExp = Number(decode?.exp)
        const iatIsoString = new Date(decodeIat * 1000).toISOString();
        const expIsoString = new Date(decodeExp * 1000).toISOString();
        const result = await SecurityModel
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