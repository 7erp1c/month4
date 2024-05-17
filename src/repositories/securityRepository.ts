import {SessionsAddDB} from "../model/authType/authType";
import {ApiRequestModel, SecurityModel} from "../db/mongoose/models";
import {injectable} from "inversify";
import {JwtService} from "../domain/jwt-service";
@injectable()
export class SecurityRepository  {

    async saveRequestInformation(ip: string, url: string) {
        const result = await ApiRequestModel.create({
            IP: ip,
            URL: url,
            date: new Date()
        });
    }
    async countRequestByTime(ip: string, url: string, interval: number) {

        const timeCheck = (new Date(Date.now() - (1000 * interval)));

        const searchKey = {

            IP: ip,
            URL: url,
            date: {$gte: timeCheck}

        };
        return  ApiRequestModel.countDocuments(searchKey);
    }
    //закидываем сессию в db
    async createNewSession(newSession: SessionsAddDB) {
        await SecurityModel.create(newSession)
    }
    //удаляем все сессии User кроме актуальной, протуханим токены User, кроме актуального
    async deleteDevicesSessions(userId: string, deviceId: string) {
        // Получаем все сессии для данного пользователя
        const userDevices = await SecurityModel.find({userId}).lean();
        // Удаляем все сессии, кроме текущей
        for (const device of userDevices) {
            if (device.deviceId !== deviceId) {
                await SecurityModel.deleteMany({deviceId: deviceId});
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
    }
    //удаляем по deviceId
    async deleteDevicesSessionsById(id: string): Promise<boolean> {
        const result = await SecurityModel.deleteOne({deviceId: id})
        return result.deletedCount === 1
    }
    async updateDataToken({userId,deviceId,iat,exp}:{userId:string,deviceId:string,iat:string,exp:string}): Promise<boolean> {

        const result = await SecurityModel
            .updateOne({userId: userId, deviceId: deviceId}, {
                $set: {
                    lastActiveDate: iat,
                    "refreshToken.createdAt": iat,
                    "refreshToken.expiredAt": exp
                }
            })
        return result.matchedCount === 1
    }
    async findSessionByDeviceId(deviceId: string) {
        const result = await SecurityModel
            .findOne({deviceId: deviceId}, {projection: {_id: 0}})
        if (!result) return null
        return result
    }


}