//Input model type for comments
export type InputCommentLikesType = {
    likeStatus: LikeStatusType
}


export type LikeStatusType =  "None" | "Like" | "Dislike"


export type LikesInfoType = {
    likesCount: number
    dislikesCount: number
    myStatus: LikeStatusType
}
//для ендпоинта post comments(возвращаем)
export type CommentViewInput ={
    id: string
    content: string
    commentatorInfo: {
        userId: string | undefined
        userLogin: string | undefined
    },
    createdAt: string
    likesInfo: LikesInfoType
}
//Output model type for comments
export type CommentView = {
    id: string
    postId: string
    content: string
    commentatorInfo: {
        userId: string | undefined
        userLogin: string | undefined
    },
    createdAt: string
}
//создаем в bd такую модель:
export type CommentViewOutput ={
    id: string
    content: string
    commentatorInfo: {
        userId: string | undefined
        userLogin: string | undefined
    },
    createdAt: string
    postId?: string
    likesInfo: LikesInfoType
}
export type CommentLikeDTO = {
    commentId: string
    likedUserId: string
    status: LikeStatusType
}
//For query repository_______________________________________________________________
export type CommentsViewModelType={
    pagesCount : number
    page : number
    pageSize : number
    totalCount : number
    items :CommentViewOutput[]
}

export type QueryCommentsRequestType = {
    postId?: string | null
    sortBy?: string
    sortDirection?: "asc" | "desc"
    pageNumber?: number
    pageSize?: number
}
export type SortCommentsRepositoryType = {
    sortBy: string
    sortDirection: "asc" | "desc"
    pageNumber: number
    pageSize: number
}
//Query type↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑Query type↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑Query type