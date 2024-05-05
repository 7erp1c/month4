import {LikeStatusType} from "../commentsType/commentsType";

export type PostsType = {
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    createdAt: string,
    _id?: string;
}
export type PostLikeDto = {
    postId: string
    likedUserId: string
    likedUserName: string
    addedAt:string
    status: LikeStatusType
}
//For query repository_______________________________________________________________
export type PostOutputType = {
    id: string
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
    createdAt: string
    extendedLikesInfo:PostsLikesInfoType
}
export type PostsLikesInfoType = {
    likesCount: number
    dislikesCount: number
    myStatus: LikeStatusType
    newestLikes: Array<NewestLikeType>
}
export type NewestLikeType = {
    addedAt: string
    userId: string
    login: string
}
export type PostsViewModelType = {
    pagesCount: number
    page: number
    pageSize: number
    totalCount: number
    items: PostsType[]
}
export type QueryPostRequestType = {
    sortBy?: string
    sortDirection?: "asc" | "desc"
    pageNumber?: number
    pageSize?: number
}

export type SortPostRepositoryType = {
    sortBy: string
    sortDirection: "asc" | "desc"
    pageNumber: number
    pageSize: number
}
//Query type↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑Query type↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑Query type
export type ParamsId = {
    blogId:string
}