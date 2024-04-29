export type CreateUserRequest = {
    login: string,
    email: string,
    password: string
}

export type UserViewModelType = {
    pagesCount: number
    page: number
    pageSize: number
    totalCount: number
    items: UsersInputType[]
}

export type UsersInputType = {
    id: string,
    login: string,
    email: string,
    createdAt: string,
}

export type createUserAccAuth = {
    id: string,
    accountData: {
        login: string,
        email: string,
        passwordHash?: string,
        passwordSalt?: string,
        createdAt: string
    },
    emailConfirmation?: {
        confirmationCode: string,
        expirationDate: string,
        isConfirmed: boolean
    }
}

//__Query_________________________________
export type QueryUserRequestType = {
    searchLoginTerm?: string | null,
    searchEmailTerm?: string | null,
    sortBy?: string,
    sortDirection?: "asc" | "desc",
    pageNumber?: number,
    pageSize?: number,
}

export type SortUsersRepositoryType = {
    sortBy: string,
    sortDirection: "asc" | "desc",
    pageNumber: number,
    pageSize: number
}
export type SearchUsersLoginRepositoryType = {
    searchLoginTerm: string | null
}
export type SearchUsersEmailRepositoryType = {
    searchEmailTerm: string | null
}