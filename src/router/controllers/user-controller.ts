import {Response} from "express";
import {UsersService} from "../../domain/users-service";
import {RequestWithDelete, RequestWithUsers} from "../../typeForReqRes/helperTypeForReq";
import {
    CreateUserRequest,
    QueryUserRequestType, SearchUsersEmailRepositoryType,
    SearchUsersLoginRepositoryType,
    SortUsersRepositoryType
} from "../../model/usersType/inputModelTypeUsers";
import {UsersQueryRepository} from "../../repositoriesQuery/user-query-repository";
import {allId} from "../../typeForReqRes/blogs-input-model/blogs-input";
import {inject, injectable} from "inversify";

@injectable()
export class UsersController {

    constructor(@inject(UsersService) protected usersService: UsersService,
                @inject(UsersQueryRepository) protected usersQueryRepository: UsersQueryRepository) {}

    async getUsers (req: RequestWithUsers<QueryUserRequestType>, res: Response) {
    const query: QueryUserRequestType = req.query
    const sortData: SortUsersRepositoryType = {
        sortBy: query.sortBy || "createdAt",
        sortDirection: query.sortDirection || "desc",
        pageNumber: query.pageNumber || 1,
        pageSize: query.pageSize || 10
    }
    const searchLogin: SearchUsersLoginRepositoryType = {
        searchLoginTerm: query.searchLoginTerm || null
    }
    const searchEmail: SearchUsersEmailRepositoryType = {
        searchEmailTerm: query.searchEmailTerm || null
    }

    const users = await this.usersQueryRepository.findFullUsers(sortData,searchLogin,searchEmail);
    if (!users) {
    res.sendStatus(404);
    return
}
res.status(200).json(users);
}
    async createUser(req:RequestWithUsers<CreateUserRequest>,res: Response){
    const{login, email, password} = req.body
    if (login && email && password) {
        const newUser = await this.usersService.createUser(login,password, email)
        res.status(201).send(newUser)
    }
}

    async deleteUser(req: RequestWithDelete<allId>, res: Response)  {
    const isDelete = await this.usersService.deleteUser(req.params.id)
    if (isDelete) {
        res.sendStatus(204);
        return
    } else {
        res.sendStatus(404);
        return
    }
}

}
