import request from "supertest";
import {BlogModel, PostModel} from "../../../../db/mongoose/models";
import {CreateUserThroughRegistration} from "../createUser";
import any = jasmine.any;
import {loginUser} from "../loginUser";

export const CreateComment = async (app: any) => {
    const createBlog = await request(app).post("/blogs")
        .auth("admin", "qwerty")
        .send({
            "name": "Ratmir",
            "description": "New string",
            "websiteUrl": "https://YA16R8OMDGQZU-6gO1f9KkR9UQddXG7wd9odCSwAWWD2ADpxXDrsed5Bv8-EZ46xjoNXecmzLf-_ZZWi70oWSe2xYUFr"
        })
        .expect(201)
    const findBlog = await BlogModel.findOne({"name":"Ratmir"})
    const createPost = await request(app).post("/posts")
        .auth("admin", "qwerty")
        .send({
            "title": "New POST",
            "shortDescription": "A brief description of the post",
            "content": "New content post",
            "blogId": findBlog!.id,
        })
    const findPost = await PostModel.findOne({"title":"New POST"})

    const createUser = await CreateUserThroughRegistration(app)
    const logUser = await loginUser(app)

    const testAccessToken = logUser.testAccessToken;

    const createComment = await request(app).post(`/posts/${findPost!.id}/comments`)
        .set("Authorization", `Bearer ${testAccessToken}`)
        .send({
            "content": "stringstringstringst",
        })
        .expect(201)
    const commentTestOne = createComment.body
    const postIdTest = findPost!.id
    return {commentTestOne,postIdTest,testAccessToken}
}
export const CreateComments = async (app: any, count: number) => {
    const comments = []
    for (let i = 1; i <= count; i++) {
        const createUser = await request(app).post("/auth/registration")
            .send({
                "login": "_I147aKCJ" + i,
                "password": "qwerty123",
                "email": `ul_tray${i}@bk.ru`
            })
            .expect(204)
        comments.push(createUser.body)
    }
    return comments
}