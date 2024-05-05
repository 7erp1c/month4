import request from "supertest";
import {UserModel} from "../../../db/mongoose/models";

export const CreateUserThroughRegistration = async (app:any)=>{

    const createUser = await request(app).post("/auth/registration")
        .send({
            "login": "_I147aKCJ",
            "password": "qwerty123",
            "email": "ul_tray@bk.ru"
        })
        .expect(204)
    return createUser.body
}
//генерим много юзеров
export const CreateUsersThroughRegistration = async (app:any,count:number)=>{
    const users = []
    for(let i = 1; i<=count;i++) {
        const createUser = await request(app).post("/auth/registration")
            .send({
                "login": "_I147aKCJ" + i,
                "password": "qwerty123",
                "email": `ul_tray${i}@bk.ru`
            })
            .expect(204)
            users.push(createUser.body)
    }
    return users
}
export const findRecoveryCode = async (email:string)=>{

    const findUser = await UserModel.findOne({"accountData.email":email})
       const code =  findUser?.recoveryPassword?.recoveryCode

    return code
}


export const user1 = {
    "login": "_I147aKCJ",
    "password": "123456",
    "email": "ul_tray@bk.ru"
}
export const dataSendLetter = {
    email: "ul_tray@bk.ru"
}
export const userEmail = "ul_tray@bk.ru"
export const oldPassword = "qwerty123"
export const newPassword = "qwerty1234"
