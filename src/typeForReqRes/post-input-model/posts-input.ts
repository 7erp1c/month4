import exp from "node:constants";
import {LikeStatusType, QueryCommentsRequestType, SortCommentsRepositoryType} from "../../model/commentsType/commentsType";

export type postsInput = {
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
export type postIdParam = {
    postId: string
}
export type postLikeStatus = {
    likeStatus:LikeStatusType
}

