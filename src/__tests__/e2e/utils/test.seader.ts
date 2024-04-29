import {createUserAccAuth, UsersInputType} from "../../../model/usersType/inputModelTypeUsers";
import {ObjectId} from "mongodb";
import {v4 as uuidv4} from "uuid";
import {add} from "date-fns";
import {connectMongoDb} from "../../../db/connect-mongo-db";

type registerUserType = {
    login: string,
    password?: string,
    email: string,
    confirmationCode?: string,
    expirationDate?: string,
    isConfirmed?: boolean

}
export const testSeader = {
    createUserDto() {
        return {
            login: "_I147aKCJ",
            password: "qwerty123",
            email: "ul_tray@bk.ru"
        }
    },
    createUserDtos(count: number) {
        const user = []
        for (let i = 0; i <= count; i++) {
            user.push({
                login: "_I147aKCJ" + i,
                password: "qwerty123",
                email: `ul_tray${i}@bk.ru`
            })
        }
        return user
    },
    async registerUser({login, password, email,confirmationCode,expirationDate,isConfirmed}: registerUserType): Promise<createUserAccAuth> {
        const newUser: createUserAccAuth = {
            id: new ObjectId().toString(),
            accountData: {
                login: login,
                email: email,
                passwordHash: password,
                createdAt: new Date().toISOString()
            },
            emailConfirmation: {
                confirmationCode: uuidv4(),
                expirationDate: add(new Date(), {hours: 48}).toISOString(),//дата истечения срока
                isConfirmed: false
            }
        }
        console.log(newUser)

        const res = await connectMongoDb.getCollections().usersCollection.insertOne({...newUser})
        return {
            ...newUser
        }

    },

}