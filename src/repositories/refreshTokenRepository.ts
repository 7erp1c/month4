import {OldTokenDB} from "../model/authType/authType";
//import {connectMongoDb} from "../../db/mongo-memory-server/connect-mongo-db";
import {RefreshTokenModel} from "../db/mongoose/models";


export class RefreshTokenRepository   {

     async addToken(createToken:OldTokenDB){
        const isSuccess = await RefreshTokenModel
            .create(createToken);
        return !!isSuccess;//!! - converts boolean
    }
    async updateRefreshValid(token:string){
            const result = await RefreshTokenModel
                .updateOne({oldToken:token},{$set:{isValid:false}})
            return result.matchedCount === 1
    }

     async checkToken(token:string){
         return RefreshTokenModel.findOne({oldToken:token}).lean()
    }
    async invalidateToken(token:string){
         const checkToken = await RefreshTokenModel.findOne({ oldToken:token})
        return checkToken?.isValid
    }
    async deleteByDeviseId(deviceId:string){
        const result = await RefreshTokenModel.deleteMany({deviceId: deviceId})
        return result.deletedCount === 1
    }

}