import {app} from "../../app";
import request from "supertest";
import mongoose from "mongoose";
import {CreateComment} from "./utils/comments/_util_comments";
import {CommentsModel} from "../../db/mongoose/models";


describe("Comments test", () => {
// const startApp = app()
    const mongoURI = 'mongodb://0.0.0.0:27017/DataBase'
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

    describe("Comments", () => {

        it("Not receive comments, because userId absent in connectMongoDb", async () => {
            await request(app).get("/comments/1232443413")
                .expect(404)
        })
        let postIdTest: any;
        let testAccessToken: any;
        it("Create comment for post", async () => {
            const createComment = await CreateComment(app)
            console.log("***", createComment)
            const countComment = await CommentsModel.countDocuments()
            expect(countComment).toEqual(1)
            postIdTest = createComment.postIdTest
            testAccessToken = createComment.testAccessToken
        })
        it("Must get comments for post", async () => {
            const getCommentsForPost = await request(app).get(`/posts/${postIdTest}/comments`)
                .expect(200)
            expect(getCommentsForPost.body).toMatchObject({
                id: expect.any(String),
                content: expect.any(String),
                commentatorInfo: {
                    userId: expect.any(String),
                    userLogin: expect.any(String)
                },
                createdAt: expect.any(String),
                likesInfo: {
                    likesCount: 0,
                    dislikesCount: 0,
                    myStatus: "None"
                }
            })
        })


    })

})