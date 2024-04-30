
import {createUserAccAuth} from "../model/usersType/inputModelTypeUsers";
//import {connectMongoDb} from "../db/mongo-memory-server/connect-mongo-db";
import {UserModel} from "../db/mongoose/models";


export const UsersRepository = {
//post(/)
    async createUser(newUser: createUserAccAuth): Promise<createUserAccAuth> {
        await UserModel.create(newUser)
        console.log(newUser)
        return newUser
    },

    async findByLoginOrEmail(loginOrEmail: string) {
        return UserModel
            .findOne({$or: [{"accountData.email": loginOrEmail}, {"accountData.login": loginOrEmail}]}).lean()

    },
    async findUserByCode(code: string) {
        return UserModel.findOne({"emailConfirmation.confirmationCode": code}).lean()
    },
    async findUserByLogin(login: string) {
        return UserModel.findOne({"accountData.login": login}).lean()
    },
    //delete(/id)
    async deleteUser(id: string): Promise<boolean> {
        const result = await UserModel.deleteOne({id: id})
        return result.deletedCount === 1
    },

    async updateConfirmation(id: string) {
        let result = await UserModel
            .updateOne({id}, {$set: {'emailConfirmation.isConfirmed': true}})
        return result.modifiedCount === 1
    },
    async updateUserEmailConfirmationCode(email: string, code: string,data:string) {
        // try {
        const isUpdated = await UserModel
            .updateOne({"accountData.email": email}, {$set: {"emailConfirmation.confirmationCode": code,"emailConfirmation.expirationDate":data}});
        return isUpdated.matchedCount === 1;
        // }catch (err){
        //     return new Error("Not update confirmationCode")
        // }
    },
    async updatePassword(id:string,password:string){
        const isUpdated = await UserModel
            .updateOne({id}, {$set: {passwordHash: password}});
        return isUpdated.matchedCount === 1;
    }


}