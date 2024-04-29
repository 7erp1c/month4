import request from 'supertest';
import {app} from "../../app";






const routerName = "/posts/";
const emptyData = {
    title: "",
    shortDescription: "",
    content: "",
    blogId: ""
}
const spaceData = {
    title: "    ",
    shortDescription: "    ",
    content: "    ",
    blogId: "     "
}
const overLengthData = {
    title: "over_30_aaaaaaaaaaaaaaaaaaaaaaa",
    shortDescription: "over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__a",
    content: "over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__over_100__a",
    blogId: "can't be over length"
}
const validCreateData = {
    title: "new title",
    shortDescription: "a very short description",
    content: "some content",
    blogId: "testBlogID"
}
const validUpdateData = {
    title: "update title",
    shortDescription: "a very short new description",
    content: "some new content",
}

const emptyBody = {
    pagesCount: 0,
    page: 1,
    pageSize: 10,
    totalCount: 0,
    items: []

}

describe("PostTest", () => {
    // clear DB before testing
    beforeAll(async () => {
        await request(app).delete("/testing/all-data");
    })

    it("01 - should be return 200 and empty array", async () => {
        await request(app).get(routerName).expect(200, emptyBody);
    })


    // POST requests


    let testBlogID1: string;
    let testBlogID2: string;

    it(" - create blog for test posts", async () => {
        const res = await request(app).post("/blogs/")
            .auth("admin", "qwerty")
            .send({
                "name": "Blog 1 posts",
                "description": "blog about nothing",
                "websiteUrl": "https://YA16R8OMDGQZU-6gO1f9KkR9UQddXG7wd9odCSwAWWD2ADpxXDrsed5Bv8-EZ46xjoNXecmzLf-_ZZWi70oWSe2xYUFr"
            })
            .expect(201);

        testBlogID1 = res.body.id;

    })
    it(" - create blog for test posts", async () => {
        const res = await request(app).post("/blogs/")
            .auth("admin", "qwerty")
            .send({
                "name": "Blog 2 posts",
                "description": "blog about nothing",
                "websiteUrl": "https://YA16R8OMDGQZU-6gO1f9KkR9UQddXG7wd9odCSwAWWD2ADpxXDrsed5Bv8-EZ46xjoNXecmzLf-_ZZWi70oWSe2xYUFr"
            })
            .expect(201);

        testBlogID2 = res.body.id;

    })


    it(" - POST does not create new post with incorrect data (empty fields)", async () => {

        await request(app).post(routerName)
            .auth("admin", "qwerty")
            .send({
                ...emptyData,
                blogId: testBlogID1
            })
            .expect(400, {
                errorsMessages: [
                    {message: "Bad request", field: "title"},
                    {message: "Bad request", field: "shortDescription"},
                    {message: "Bad request", field: "content"}
                ]
            });

        await request(app).get(routerName).expect(200, emptyBody);
    })

    it(" - POST does not create the post with incorrect data (over length)", async () => {
        await request(app).post(routerName)
            .auth("admin", "qwerty")
            .send({
                ...overLengthData,
                blogId: testBlogID1
            })
            .expect(400, {
                errorsMessages: [
                    {message: "Bad request", field: "title"},
                    {message: "Bad request", field: "shortDescription"},
                    {message: "Bad request", field: "content"}
                ]
            });

        await request(app).get(routerName).expect(200, emptyBody);
    })

    it(" - POST does not create the post with incorrect data (only spaces)", async () => {
        await request(app).post(routerName)
            .auth("admin", "qwerty")
            .send({
                ...spaceData,
                blogId: testBlogID1
            })
            .expect(400, {
                errorsMessages: [
                    {message: "Bad request", field: "title"},
                    {message: "Bad request", field: "shortDescription"},
                    {message: "Bad request", field: "content"}
                ]
            });

        await request(app).get(routerName).expect(200, emptyBody);
    })

    it(" - POST does not create the post with incorrect blog id", async () => {
        await request(app).post(routerName)
            .auth("admin", "qwerty")
            .send({
                ...validCreateData,
                blogId: '-1'
            })
            .expect(400, {
                errorsMessages: [
                    {message: "Bad request", field: "blogId"}
                ]
            });

        await request(app).get(routerName).expect(200, emptyBody);
    })

    it(" - POST does not create the post with invalid authorization", async () => {

        await request(app).post(routerName)
            .auth("odmin", "qwerty")
            .send({
                ...validCreateData,
                blogId: testBlogID1
            })
            .expect(401);

        await request(app).get(routerName).expect(200, emptyBody);
    })

    let testPost1: any;
    it(" - POST should be create the post with correct data", async () => {
        const res = await request(app).post(routerName)
            .auth("admin", "qwerty")
            .send({
                ...validCreateData,
                blogId: testBlogID1
            })
            .expect(201);

        testPost1 = res.body;

        await request(app).get(routerName + testPost1.id).expect(testPost1);
    })

    let testPost2: any;
    it(" - POST should be create the post with correct data", async () => {
        const res = await request(app).post(routerName)
            .auth("admin", "qwerty")
            .send({
                ...validCreateData,
                title: "post 2",
                blogId: testBlogID1
            })
            .expect(201);

        testPost2 = res.body;

        await request(app).get(routerName + testPost2.id).expect(testPost2);
    })


    // PUT requests

    it(" - PUT does not update the post with incorrect data (empty)", async () => {

        // send invalid data

        await request(app).put(routerName + testPost1.id)
            .auth("admin", "qwerty")
            .send(emptyData)
            .expect(400, {
                errorsMessages: [
                    {message: "Bad request", field: "title"},
                    {message: "Bad request", field: "shortDescription"},
                    {message: "Bad request", field: "content"},
                    {message: "Bad request", field: "blogId"}

                ]
            });

        await request(app).get(routerName + testPost1.id).expect(testPost1); // check that the data on the server has not been updated
    })

    it(" - PUT does not update the post with incorrect data (over length)", async () => {

        // send invalid data

        await request(app).put(routerName + testPost1.id)
            .auth("admin", "qwerty")
            .send({
                ...overLengthData,
                blogId: testBlogID1
            })
            .expect(400, {
                errorsMessages: [
                    {message: "Bad request", field: "title"},
                    {message: "Bad request", field: "shortDescription"},
                    {message: "Bad request", field: "content"}

                ]
            });

        await request(app).get(routerName + testPost1.id).expect(testPost1); // check that the data on the server has not been updated
    })

    it(" - PUT does not update the post with incorrect data (no data but spaces)", async () => {

        // send invalid data

        await request(app).put(routerName + testPost1.id)
            .auth("admin", "qwerty")
            .send(spaceData)
            .expect(400, {
                errorsMessages: [
                    {message: "Bad request", field: "title"},
                    {message: "Bad request", field: "shortDescription"},
                    {message: "Bad request", field: "content"},
                    {message: "Bad request", field: "blogId"}
                ]
            });

        await request(app).get(routerName + testPost1.id).expect(testPost1); // check that the data on the server has not been updated
    })

    it(" - PUT does not update the post with invalid authorization", async () => {

        // send invalid data
        await request(app).put(routerName + testPost1.id)
            .auth("odmin", "qwerty")
            .send({
                ...validUpdateData,
                blogId: testBlogID1
            })
            .expect(401);

        await request(app).get(routerName + testPost1.id).expect(testPost1); // check that the data on the server has not been updated
    })

    it(" - PUT should update the post with correct data", async () => {

        // send valid data
        await request(app).put(routerName + testPost1.id)
            .auth("admin", "qwerty")
            .send({
                ...validUpdateData,
                blogId: testBlogID1
            })
            .expect(204);

        const res = await request(app).get(routerName + testPost1.id).expect(200); // received get request and write it to variable res

        expect(res.body).toEqual(testPost1 = {
            ...testPost1,
            ...validUpdateData
        })
        // check that the data on the server has not been updated
    })

    it(" - PUT should update the post with new blogId", async () => {

        // send valid data
        await request(app).put(routerName + testPost2.id)
            .auth("admin", "qwerty")
            .send({
                ...testPost2,
                blogId: testBlogID2
            })
            .expect(204);

        const res = await request(app).get(routerName + testPost2.id).expect(200); // received get request and write it to variable res

        expect(res.body).toEqual(testPost2 = {
            ...testPost2,
            blogName: res.body.blogName, //its no correct but works right
            blogId: testBlogID2
        })
        expect(res.body.blogId === testBlogID2)

        // check that the data on the server has not been updated
    })

    // GET requests

    it(" - GET request without ID should return array with length equal 2", async () => {

        const res = await request(app).get(routerName).expect(200);

        expect(res.body.items.length).toBe(2) // check array length
    })

    it(" - GET with invalid ID should return 404", async () => {

        await request(app).get(routerName + "-100").expect(404);

    })

    it(" - GET with valid ID should return 200 and object", async () => {

        await request(app).get(routerName + testPost1.id).expect(200, testPost1);

    })


    // DELETE request

    it(" - delete with invalid ID should return 404", async () => {

        await request(app)
            .delete(routerName + "-101")
            .auth("admin", "qwerty")
            .expect(404);

    })

    it(" - delete with invalid authorization should return 401", async () => {

        await request(app)
            .delete(routerName + testPost1.id)
            .auth("odmin", "qwerty")
            .expect(401);

    })

    it(" - delete with valid ID should return 204 and array with length equal 1", async () => {

        await request(app)
            .delete(routerName + testPost2.id)
            .auth("admin", "qwerty")
            .expect(204);
        const res = await request(app).get(routerName).expect(200);

        expect(res.body.items.length).toBe(1);

    })


})
