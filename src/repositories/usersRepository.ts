
import {createUserAccAuth} from "../model/usersType/inputModelTypeUsers";
//import {connectMongoDb} from "../db/mongo-memory-server/connect-mongo-db";
import {UserModel} from "../db/mongoose/models";


export class UsersRepository  {

//post(/)
    async createUser(newUser: createUserAccAuth): Promise<createUserAccAuth> {
        await UserModel.create(newUser)
        console.log(newUser)
        return newUser
    }
    async findByLoginOrEmail(loginOrEmail: string) {
        try {
            const user = await UserModel.findOne({
                $or: [
                    { "accountData.email": loginOrEmail },
                    { "accountData.login": loginOrEmail }
                ]
            }).lean()

            return user;
        } catch (err) {
            return null

        }

    }
    async findUserByCode(code: string) {
        return UserModel.findOne({"recoveryPassword.recoveryCode": code})
    }
    async findUserByLogin(login: string) {
        return UserModel.findOne({"accountData.login": login})
    }
    async findUserById(id: string) {
        return await UserModel.findOne({id:id}).lean()
    }
    //delete(/id)
    async deleteUser(id: string): Promise<boolean> {
        const result = await UserModel.deleteOne({id: id})
        return result.deletedCount === 1
    }
    async updateConfirmation(id: string) {
        let result = await UserModel
            .updateOne({id}, {$set: {'emailConfirmation.isConfirmed': true}})
        return result.modifiedCount === 1
    }
    async UpdateRecoveryCode(email: string, code: string, data:string) {
        // try {
        const isUpdated = await UserModel
            .updateOne({"accountData.email": email},
                {$set: {"recoveryPassword.recoveryCode": code,"recoveryPassword.expirationDate":data,"recoveryPassword.isUsed":false}});
        console.log("isUpdated.matchedCount", isUpdated.matchedCount)
        return isUpdated.matchedCount === 1;
        // }catch (err){
        //     return new Error("Not update confirmationCode")
        // }
    }
    async updatePassword(id:string,password:string,passwordSalt:string){
        console.log("ID переданный для обновления:", id);
        const isUpdated = await UserModel
            .updateOne({id:id}, {$set: {"accountData.passwordHash": password,"accountData.passwordSalt":passwordSalt,"recoveryPassword.isUsed":true}});
        return isUpdated.matchedCount === 1;
    }
}