
import {createUserAccAuth} from "../model/usersType/inputModelTypeUsers";
import {connectMongoDb} from "../db/connect-mongo-db";


export const UsersRepository = {
//post(/)
    async createUser(newUser: createUserAccAuth): Promise<createUserAccAuth> {
        await connectMongoDb.getCollections().usersCollection.insertOne(newUser)
        console.log(newUser)
        return newUser
    },

    async findByLoginOrEmail(loginOrEmail: string) {
        return await connectMongoDb.getCollections().usersCollection
            .findOne({$or: [{"accountData.email": loginOrEmail}, {"accountData.login": loginOrEmail}]})

    },
    async findUserByCode(code: string) {
        return await connectMongoDb.getCollections().usersCollection.findOne({"emailConfirmation.confirmationCode": code})
    },
    async findUserByLogin(login: string) {
        return await connectMongoDb.getCollections().usersCollection.findOne({"accountData.login": login})
    },
    //delete(/id)
    async deleteUser(id: string): Promise<boolean> {
        const result = await connectMongoDb.getCollections().usersCollection.deleteOne({id: id})
        return result.deletedCount === 1
    },

    async updateConfirmation(id: string) {
        let result = await connectMongoDb.getCollections().usersCollection
            .updateOne({id}, {$set: {'emailConfirmation.isConfirmed': true}})
        return result.modifiedCount === 1
    },
    async updateUserEmailConfirmationCode(email: string, code: string,data:string) {
        console.log("updateUserEmailConfirmationCode: " + email + " " + code)

        // try {
        const isUpdated = await connectMongoDb.getCollections().usersCollection.updateOne({"accountData.email": email}, {$set: {"emailConfirmation.confirmationCode": code,"emailConfirmation.expirationDate":data}});
        return isUpdated.matchedCount === 1;
        // }catch (err){
        //     return new Error("Not update confirmationCode")
        // }
    }


}