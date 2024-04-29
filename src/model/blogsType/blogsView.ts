export type blogsView = {
    id: string;
    name: string;
    description: string;
    websiteUrl: string;
    createdAt: string;
    isMembership: boolean;
    _id?: string;
}
//Query repository_____________________________________________
export type BlogViewModelType={
    pagesCount : number
    page : number
    pageSize : number
    totalCount : number
    items :blogsView[]
}
export type QueryBlogRequestType = {
    searchNameTerm?: string | null
    sortBy?: string
    sortDirection?: "asc" | "desc"
    pageNumber?: number
    pageSize?: number
}
export type SortBlogRepositoryType = {
    sortBy: string
    sortDirection: "asc" | "desc"
    pageNumber: number
    pageSize: number
}
export type SearchBlogRepositoryType = {
    searchNameTerm: string | null
}
