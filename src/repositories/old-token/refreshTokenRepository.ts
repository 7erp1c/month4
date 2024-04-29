import {OldTokenDB} from "../../model/authType/authType";
import {connectMongoDb} from "../../db/connect-mongo-db";


export const RefreshTokenRepository =  {

     async addToken(createToken:OldTokenDB){
        const isSuccess = await connectMongoDb.getCollections().refreshTokenCollection
            .insertOne(createToken);
        return !!isSuccess;//!! - converts boolean
    },
    async updateRefreshValid(token:string){
            const result = await connectMongoDb.getCollections().refreshTokenCollection
                .updateOne({oldToken:token},{$set:{isValid:false}})
            return result.matchedCount === 1
    },

     async checkToken(token:string){
        const isExist = await connectMongoDb.getCollections().refreshTokenCollection
            .findOne({oldToken:token});
        return !!isExist
    },
    async invalidateToken(token:string){
         const checkToken = await connectMongoDb.getCollections().refreshTokenCollection.findOne({ oldToken:token})
        return checkToken?.isValid
    }
}