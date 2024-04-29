//Input model type for comments
export type CommentView = {

    id: string,
    content: string,
    commentatorInfo: {
        userId: string | undefined,
        userLogin: string | undefined
    },
    createdAt: string,
    postId: string
}
//Output model type for comments
export type CommentViewOutput ={
    id: string,
    content: string,
    commentatorInfo: {
        userId: string | undefined,
        userLogin: string | undefined
    },
    createdAt: string
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