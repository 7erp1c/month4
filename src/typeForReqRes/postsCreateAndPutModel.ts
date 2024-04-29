import exp from "node:constants";

export type postsCreateAndPutModel = {
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName:string

}

export type postCreateForBlog = {
    blogId: string
}

export type commentCreateContent = {
    content:string
}
export type postIdForComments = {
    postId: string
}