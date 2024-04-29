import {connectMongoDb} from "../db/connect-mongo-db";


export const AuthUsersRepository = {

    async deleteUser(id: string): Promise<boolean> {
        const result = await connectMongoDb.getCollections().usersCollection.deleteOne({id: id})
        return result.deletedCount === 1
    },
}