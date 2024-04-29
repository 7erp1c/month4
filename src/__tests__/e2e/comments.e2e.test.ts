import {MongoMemoryServer} from 'mongodb-memory-server'
import {connectMongoDb} from "../../db/connect-mongo-db";
import {app} from "../../app";
import request from "supertest";


describe("Comments test", () => {
// const startApp = app()

    beforeAll(async () => {
        const mongoServer = await MongoMemoryServer.create()
        const mongoURI = mongoServer.getUri()
        await connectMongoDb.run(mongoURI)//url приходит из MongoMemoryServer
    });

    afterAll(async () => {
        await connectMongoDb.drop();
    })
    afterAll(async () => {
        await connectMongoDb.stop()
    });

    describe("Comments",  () => {

        it("Not receive comments, because userId absent in connectMongoDb", async ()=>{
            await request(app).get("/comments/1232443413")
                .expect(404)
        })

        })

})