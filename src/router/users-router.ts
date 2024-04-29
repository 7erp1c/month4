import {Request,Response,Router} from "express";
import {UsersService} from "../domain/users-service";
import {
    CreateUserRequest,
    QueryUserRequestType,
    SearchUsersEmailRepositoryType,
    SearchUsersLoginRepositoryType,
    SortUsersRepositoryType,
} from "../model/usersType/inputModelTypeUsers";
import {RequestWithDelete, RequestWithUsers} from "../typeForReqRes/helperTypeForReq";
import {UsersQueryRepository} from "../repositoriesQuery/user-query-repository";

import {_delete_all_} from "../typeForReqRes/blogsCreateAndPutModel";
import {usersValidation} from "../middleware/inputValidationMiddleware";
import {errorsValidation} from "../middleware/errorsValidation";
import {authGuardMiddleware} from "../middleware/authGuardMiddleware";




export const usersRouter= Router({})
usersRouter.get('/', async (req: RequestWithUsers<QueryUserRequestType>, res: Response) => {
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

    const users = await UsersQueryRepository.findFullUsers(sortData,searchLogin,searchEmail);
    if (!users) {
        res.sendStatus(404);
        return
    }
    res.status(200).json(users);
})
usersRouter.post('/',authGuardMiddleware,usersValidation,errorsValidation, async(req:RequestWithUsers<CreateUserRequest>,res: Response)=>{
    const{login, email, password} = req.body
    if (login && email && password) {
        const newUser = await UsersService.createUser(login,password, email)
        res.status(201).send(newUser)
    }
} )

usersRouter.delete('/:id',authGuardMiddleware,errorsValidation, async (req: RequestWithDelete<_delete_all_>, res: Response) => {
    const isDelete = await UsersService.deleteUser(req.params.id)
    if (isDelete) {
        res.sendStatus(204);
        return
    } else {
        res.sendStatus(404);
        return
    }
})
