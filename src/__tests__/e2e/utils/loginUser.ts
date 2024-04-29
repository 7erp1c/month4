import request from "supertest";
import jwt from "jsonwebtoken";

export const loginUser = async (app:any)=>{
     let testRefreshToken ;
    const loginUser = await request(app).post("/auth/login")
        .send({
            "loginOrEmail": "ul_tray@bk.ru",
            "password": "qwerty123"
        })
        .expect(200)
    //проверяем есть ли в body access token:
    expect(loginUser.body).toMatchObject({
        accessToken: expect.any(String)
    });
    // Проверка, что refreshToken добавлен в куки
    const cookiesArray1 = loginUser.header["set-cookie"];
    console.log("___________" + cookiesArray1[0],cookiesArray1[1])

    // Поиск refreshToken в куках
    for (let cookie1 of cookiesArray1) {
        if (cookie1.includes("refreshToken")) {
            testRefreshToken = cookie1;
            break;
        }
    }
    const logUser = loginUser.body
    return {
        logUser,
        testRefreshToken
    }
}
 export const findIdDeviceSession = async (refresh:string)=>{
     let token: string = "";
     //проверка, чтобы избежать попытки обращения к методам undefined объектов(а то тесты валятся)
     if (refresh && typeof refresh === "string") {
         const parts = refresh.split("=");
         if (parts.length > 1) {
             token = parts[1].split(";")[0];
         }
     }
     const tokenPayload = jwt.decode(token) as jwt.JwtPayload

     //Найдем id session
     const deviceId = tokenPayload?.deviceId
     const userId = tokenPayload?.userId
     return{
         deviceId,
         userId
     }
}