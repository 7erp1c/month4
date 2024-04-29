//в тесте используется таймер т.к. токены генерятся одинаковые
import request from "supertest"

import {app} from "../../app";
import {UsersQueryRepository} from "../../repositoriesQuery/user-query-repository";
import {delay} from "./utils/timer";
import {CreateUserThroughRegistration} from "./utils/createUser";
import {MongoMemoryServer} from "mongodb-memory-server";
import {connectMongoDb} from "../../db/connect-mongo-db";


const routerName = '/auth/'

describe("AuthTest", () => {
    beforeAll(async () => {
        const mongoServer = await MongoMemoryServer.create()
        await connectMongoDb.run(mongoServer.getUri())
        //await client.connect();
       // await request(app).delete("/testing/all-data")
        // const mongoServer = await MongoMemoryServer.create() //использование локальной базы данных без демона
        // await connectMongoDb.run(mongoServer.getUri()) // поднимет базу данных
    })
    afterAll(async () => {
        await connectMongoDb.drop();
        //await client.close();
        // await connectMongoDb.stop(); если заюзали MongoMemoryServer
    })
    beforeAll(async () => {
        await request(app).delete("/testing/all-data");
    })


//POST
    describe('create user', () => {
        it("There is no registered user", async () => {
            await request(app).post(routerName + "login")
                .send({
                    loginOrEmail: "ul_tray@bk.ru",
                    password: "string"
                })
                .expect(401)
        })
        it("POST incorrect date", async () => {
            await request(app).post(routerName + "login")
                .send({
                    loginOrEmail: "",
                    password: ""
                })
                .expect(400, {
                    errorsMessages: [
                        {message: "Bad request", field: "loginOrEmail"},
                        {message: "Bad request", field: "password"},
                    ]
                })
        })
    })
    describe('registration', () => {
        let firstCode: string | undefined;
        let firstCode2: string | undefined;
        let secondCode: string | undefined;

        it("registration - email ", async () => {
            // Регистрация и создание user
            const registration = await CreateUserThroughRegistration(app)
            console.log(registration.body)

            const user = (await connectMongoDb.getCollections().usersCollection.find({}).toArray())[0]
            firstCode = user.emailConfirmation?.confirmationCode
            console.log("FIRST CODE " + firstCode)

        })
        //Регистрация второго User
        it("registration - email ", async () => {
            // Регистрация и создание user
            const registration = await request(app).post(routerName + "registration")
                .send({
                    "login": "47aKCJ",
                    "password": "qwerty123",
                    "email": "ul_tray2@bk.ru"
                }).expect(204)
            console.log(registration.body)
            const email = "ul_tray2@bk.ru"

            const user = (await UsersQueryRepository.findUserByEmail(email))
            firstCode2 = user?.emailConfirmation?.confirmationCode
            console.log("FIRST CODE " + firstCode2)

        })
        //повторная отправка повторного кода в письме на 1ого User
        it("resending an email", async () => {
            await request(app)
                .post("/auth/registration-email-resending")
                .send({
                    "email": "ul_tray@bk.ru"
                })
                .expect(204)
            const userAfterResend = (await connectMongoDb.getCollections().usersCollection.find({}).toArray())[0]
            secondCode = userAfterResend.emailConfirmation?.confirmationCode
            expect(firstCode).not.toEqual(secondCode)

        })
        //подтверждение второго user
        it("Resending the code", async () => {
            await request(app)
                .post("/auth/registration-confirmation")
                .send({code: firstCode2})
                .expect(204)


        })
        //повторная отправка  кода в письме на 2ого User, он уже подтвержден
        it("resending an email should return an error, the user2 is confirmed", async () => {
            await request(app)
                .post("/auth/registration-email-resending")
                .send({
                    "email": "ul_tray2@bk.ru"
                })
                .expect(400)

        })
        //повторное подтверждение второго юзера
        it("repeated confirmation of the second user should return an error", async () => {
            await request(app)
                .post("/auth/registration-confirmation")
                .send({code: firstCode2})
                .expect(400)


        })
        //проверяем что приложуха не упала
        it("POST creating a user with the help of an admin", async () => {
            await request(app)
                .post("/auth/login")
                .send({
                    loginOrEmail: "ul_tray@bk.ru",
                    password: "qwerty123"
                })
                .expect(200)
        })

    })

//по 08 домашке
    describe('Endpoint: auth -registration,login, refresh-token, logout,', () => {
        let testAccessToken1: string;
        let testRefreshToken1: string;
        let testAccessToken2: string;
        let testRefreshToken2: string;

        it("Must register", async () => {
            // Очистка данных
            await request(app).delete("/testing/all-data")
            // Регистрация и создание user
            await request(app)
                .post("/auth/registration")
                .send({
                    "login": "_I147aKCJ",
                    "password": "123456",
                    "email": "ul_tray@bk.ru"
                }).expect(204)
        })
        it("There must be an authentication", async () => {
            // Аутентификация пользователя и ожидание 200 статуса и возврата объекта с accessToken
            const authLogin = await request(app)
                .post("/auth/login")
                .send({
                    "loginOrEmail": "ul_tray@bk.ru",
                    "password": "123456"
                })
                .expect(200)
            expect(authLogin.body).toMatchObject({
                accessToken: expect.any(String)
            });
            testAccessToken1 = authLogin.body.accessToken;
            // Проверка, что accessToken присутствует в ответе
            expect(testAccessToken1).toBeDefined();
            console.log("__ACCESSTOKEN: " + testAccessToken1)
            // Проверка, что refreshToken добавлен в куки
            const cookiesArray1 = authLogin.header["set-cookie"];
            console.log("___________" + cookiesArray1[0],cookiesArray1[1])

            // Поиск refreshToken в куках
            for (let cookie1 of cookiesArray1) {
                if (cookie1.includes("refreshToken")) {
                    testRefreshToken1 = cookie1;
                    break;
                }
            }
            console.log("__test refreshToken: " + testRefreshToken1)
            expect(testRefreshToken1).toBeDefined();
        })
        it("Must receive two pairs of tokens", async () => {
            //обновляем пару accessToken и refreshToken, используем "testRefreshToken1"://____//
            await delay(600)
            const authRefreshToken = await request(app)
                .post("/auth/refresh-token")
                .set("Cookie", testRefreshToken1)
                .expect(200)
            testAccessToken2 = authRefreshToken.body.accessToken;
            // Проверка, что accessToken присутствует в ответе
            expect(testAccessToken2).toBeDefined();
            console.log("__ACCESSTOKEN: " + testAccessToken2)
            // Проверка, что refreshToken добавлен в куки

            const cookiesArray2 = authRefreshToken.header["set-cookie"]
            //Поиск refreshToken в куках
            for (let cookie2 of cookiesArray2) {
                if (cookie2.includes("refreshToken")) {
                    testRefreshToken2 = cookie2;
                    break;
                }
            }
            console.log("__test refreshToken2: " + testRefreshToken2)
            expect(testRefreshToken1).not.toEqual(testRefreshToken2)
            expect(testRefreshToken2).toBeDefined();
        })
        it("Should not logout on the first rotten token", async () => {
            await request(app)
                .post("/auth/logout")
                .set("Cookie", testRefreshToken1)
                .expect(401)
        })
        it("Should not refresh token on the first rotten token", async () => {
            await request(app)
                .post("/auth/refresh-token")
                .set("Cookie", testRefreshToken1)
                .expect(401)
        })
        it("Must get user information using access token", async () => {
            //получаем информацию о пользователе endpoint: auth/me:
            const authMe = await request(app)
                .get("/auth/me")
                .set("Authorization", `Bearer ${testAccessToken2}`)//
                .expect(200)

            expect(authMe.body).toMatchObject({
                email: expect.any(String),
                login: expect.any(String),
                userId: expect.any(String)
            });
        })
        it("Using refresh token, you must deactivate the token and clean the DB", async () => {
            //Disconnect user, clear all DB
            await request(app)
                .post("/auth/logout")
                .set("Cookie", testRefreshToken2)
                .expect(204)
            const collection = connectMongoDb.getDbName().collection('old-old-token')
            const count = await collection.countDocuments();
            // Проверка, что количество документов в коллекции равно 0 (т.е. коллекция пустая)
            expect(count).toBe(0);
        })
        it("Must not update the token", async () => {
            await request(app)
                .post("/auth/refresh-token")
                .set("Cookie", testRefreshToken2)
                .expect(401)
        })
        it("Most not get information user", async () => {
            await request(app)
                .get("/auth/me")
                .set("Cookie", testRefreshToken2)
                .expect(401)
        })


        //describe 08 homework completed________________
    })


})