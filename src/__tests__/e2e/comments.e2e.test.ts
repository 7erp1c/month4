

import {app} from "../../app";
import request from "supertest";
import mongoose from "mongoose";


describe("Comments test", () => {
// const startApp = app()
    const mongoURI = 'mongodb://0.0.0.0:27017/e2e_test'
    beforeAll(async () => {
        await mongoose.connect(mongoURI)
        // const mongoServer = await MongoMemoryServer.create()
        // const mongoURI = mongoServer.getUri()
        // await connectMongoDb.run(mongoURI)//url приходит из MongoMemoryServer
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
    })
    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe("Comments",  () => {

        it("Not receive comments, because userId absent in connectMongoDb", async ()=>{
            await request(app).get("/comments/1232443413")
                .expect(404)
        })

        })

})