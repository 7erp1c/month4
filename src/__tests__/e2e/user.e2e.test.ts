import request = require("supertest");
import {app} from "../../app";


const routerName = "/users/";

const emptyData = {
    login: "",
    password: "",
    email: "",
}
const spaceData = {
    login: "    ",
    password: "    ",
    email: "    ",
}
const overLengthData = {
    login: "hua_you",
    password: "qwerty123",
    email: "ul_tray@bk.ru",
}
const validCreateData = {
    login: "new title",
    shortDescription: "a very short description",
    content: "some content",
    blogId: "testBlogID"
}
const validUpdateData = {
    login: "update title",
    shortDescription: "a very short new description",
    content: "some new content",
}
const Results = {
    pagesCount: 0,
    page: 1,
    pageSize: 10,
    totalCount: 0,
    items: []
}


describe(routerName, () => {

    // clear DB before testing
    beforeAll(async () => {
        await request(app).delete("/testing/all-data");
    })
    let testUsersID1: string;
    let testUsersID2: string;

    it(" - should be return 200 and empty array", async () => {
        await request(app).get(routerName).expect(200, Results);
    })
    it(" - create user for test posts", async () => {
        const CreateUser = await request(app).post(routerName)
            .auth("admin", "qwerty")
            .send({
                "login": "Ratmir",
                "password": "qwerty123",
                "email": "ul-tray@bk.ru"
            })
            .expect(201);

        testUsersID1 = CreateUser.body.id;
        const AuthUsers = request(app).get("/auth/login")
            .send({
                "login": "Ratmir",
                "email": "ul-tray@bk.ru"
            })
            .expect(200)

    })
    it("POST does not create new user with incorrect data (empty fields)", async () => {
        const res = await request(app).post('/users/')
            .auth("admin", "qwerty")
            .send({
                ...emptyData
            })
            .expect(400, {
                errorsMessages: [
                    {message: "Bad request", field: "login"},
                    {message: "Bad request", field: "email"},
                    {message: "Bad request", field: "password"}

                ]
            })

        await request(app).get(routerName).expect(200);
    })
    it("POST incorrect Authorisation ", async () => {
        const res = await request(app).post(routerName)
            .auth('sae', 'dfa')
            .send()
            .expect(401)

        await request(app).get(routerName).expect(200)
    })
    let testUser1: any;
    it("Post correct data", async () => {
        const res = await request(app).post(routerName)
            .auth('admin', "qwerty")
            .send({
                ...overLengthData
            })
            .expect(201)
        testUser1 = res.body
        await request(app).get(routerName).expect(200)
    })

    it(" - GET with invalid ID should return 404", async () => {

        await request(app).get(routerName + "-100").expect(404);

    })
    //DELETE
    it(" - delete with invalid ID should return 404", async () => {

        await request(app)
            .delete(routerName + "-101")
            .auth("admin", "qwerty")
            .expect(404);

    })
    it(" - delete with invalid authorization should return 401", async () => {

        await request(app)
            .delete(routerName + testUser1.id)
            .auth("odmin", "qwerty")
            .expect(401);

    })
    it(" - delete with valid ID should return 204 and array with length equal 0", async () => {

        await request(app)
            .delete(routerName + testUser1.id)
            .auth("admin", "qwerty")
            .expect(204);
        const res = await request(app).get(routerName).expect(200);

        // expect(res.body.items.length).toBe(0);

    })


})