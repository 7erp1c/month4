//Создаем пользователя, логиним пользователя 4 раза с разныными user-agent;
// Делаем проверки на ошибки 404, 401, 403;
// Обновляем refreshToken девайса 1;
// Запрашиваем список девайсов с обновленным токеном. Количество девайсов и deviceId  всех девайсов не должны измениться. LastActiveDate девайса 1 должна измениться;
// Удаляем девайс 2 (передаем refreshToken девайса 1). Запрашиваем список девайсов. Проверяем, что девайс 2 отсутствует в списке;
// Делаем logout девайсом 3. Запрашиваем список девайсов (девайсом 1).  В списке не должно быть девайса 3;
// Удаляем все оставшиеся девайсы (девайсом 1).  Запрашиваем список девайсов. В списке должен содержаться только один (текущий) девайс;
import request from "supertest"

import {app} from "../../app";

import {MongoMemoryServer} from "mongodb-memory-server";
import {connectMongoDb} from "../../db/connect-mongo-db";
import {CreateUsersThroughRegistration, CreateUserThroughRegistration} from "./utils/createUser";
import {findIdDeviceSession, loginUser} from "./utils/loginUser";
import jwt from "jsonwebtoken";

const routerName = '/security/'
//Комплексный тест по auth и security
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
    describe("test-Auth", () => {

        it("must create 4 users", async () => {
            // clean db
            await request(app).delete("/testing/all-data")
            //registration 4 users
            const users = await CreateUsersThroughRegistration(app, 4)

            const usersCount = await connectMongoDb.getCollections().usersCollection.countDocuments();
            expect(usersCount).toEqual(4)
        })
        it("must create user", async () => {
            // clean db
            await request(app).delete("/testing/all-data")
            //registration user
            const users = await CreateUserThroughRegistration(app)
            //
            const usersCount = await connectMongoDb.getCollections().usersCollection.countDocuments();
            expect(usersCount).toEqual(1)
        })
        //при логине, пошим token в массив refresh
        let refresh: any[] = [];//refresh token device 1
        it("must log in user", async () => {
            let successfulLogins = 0;
            // Вызываем loginUser 4 раза
            for (let i = 0; i < 4; i++) {
                const user = await loginUser(app);
                if (user.logUser || user.testRefreshToken) {
                    successfulLogins++;
                    refresh.push(user.testRefreshToken)
                }
            }
            //Все попытки входа были успешны
            expect(successfulLogins).toEqual(4);
            //Проверяем количество документов в коллекции
            const userSessions = await connectMongoDb.getCollections().securityCollection.countDocuments();
            expect(userSessions).toEqual(4)
        })
        it("must update token device 1", async () => {
            await request(app)
                .post("/auth/refresh-token")
                .set("Cookie", refresh[0])
                .expect(200)
            //Проверяем количество документов в коллекции не должно измениться
            const userSessions = await connectMongoDb.getCollections().securityCollection.countDocuments();
            expect(userSessions).toEqual(4)
        })
        it("must return 4 documents", async () => {
            const getSessions = await request(app)
                .get("/security/devices")
                .set("Cookie", refresh[0])
                .expect(200)
            //Проверяем количество документов в коллекции не должно измениться
            expect(getSessions.body.length).toEqual(4)
        })
        it("must delete device 2", async () => {
            //Возвращаем deviceId после decode token
            const payloadToken = await findIdDeviceSession(refresh[1])
            const deviceId = payloadToken.deviceId

            await request(app)
                .delete(`/security/devices/${deviceId}`)
                .set("Cookie", refresh[1])
                .expect(204)
        })
        it("must return 3 documents", async () => {
            const getSessions = await request(app)
                .get("/security/devices")
                .set("Cookie", refresh[0])
                .expect(200)
            //Проверяем количество документов в коллекции должно стать 3
            expect(getSessions.body.length).toEqual(3)
        })
        it("must logout device 3", async () => {

            await request(app).post("/auth/logout")
                .set("Cookie", refresh[2])
                .expect(204)
        })
        it("must return 2 documents", async () => {
            const getSessions = await request(app)
                .get("/security/devices")
                .set("Cookie", refresh[0])
                .expect(200)
            //Проверяем количество документов в коллекции должно стать 3
            expect(getSessions.body.length).toEqual(2)
        })
        it("must log out of all sessions except one", async () => {
            await request(app)
                .delete("/security/devices")
                .set("Cookie", refresh[0])
                .expect(204)
        })
        it("must return 1 documents", async () => {
            const getSessions = await request(app)
                .get("/security/devices")
                .set("Cookie", refresh[0])
                .expect(200)
            //Проверяем количество документов в коллекции должно стать 3
            expect(getSessions.body.length).toEqual(1)
        })
        //end test test-Auth
    })
    describe("test-Auth-error", () => {
        it("must create user", async () => {
            // clean db
            await request(app).delete("/testing/all-data")
            //registration user
            const users = await CreateUserThroughRegistration(app)
            //
            const usersCount = await connectMongoDb.getCollections().usersCollection.countDocuments();
            expect(usersCount).toEqual(1)
        })
        let refresh: any[] = [];//refresh token device 1
        it("must log in user", async () => {
            let successfulLogins = 0;
            // Вызываем loginUser 4 раза
            for (let i = 0; i < 4; i++) {
                const user = await loginUser(app);
                if (user.logUser || user.testRefreshToken) {
                    successfulLogins++;
                    refresh.push(user.testRefreshToken)
                }
            }
            //Все попытки входа были успешны
            expect(successfulLogins).toEqual(4);
            //Проверяем количество документов в коллекции
            const userSessions = await connectMongoDb.getCollections().securityCollection.countDocuments();
            expect(userSessions).toEqual(4)
        })
        it("must return error 429", async () => {
            let lastResponse
            for (let i = 0; i < 6; i++) {
                 lastResponse = await request(app)
                    .post("/auth/refresh-token")
                    .set("Cookie", refresh[0])
            }
            // Предполагаем, что 429 вернётся при шестом запросе
            if (lastResponse) {
                expect(lastResponse.status).toBe(429)
            }
        })
        it("must return error 429",async()=>{
            let lastResponse;
            for (let i = 0; i < 6; i++) {
                lastResponse = await request(app)
                    .get("/security/devices")
                    .set("Cookie", refresh[0])
            }

            // Предполагаем, что 429 вернётся при шестом запросе
            if (lastResponse) {
                expect(lastResponse.status).toBe(429)
            }
        })
    })
})