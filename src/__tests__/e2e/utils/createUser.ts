import request from "supertest";
export const user1 = {
    "login": "_I147aKCJ",
    "password": "123456",
    "email": "ul_tray@bk.ru"
}
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
