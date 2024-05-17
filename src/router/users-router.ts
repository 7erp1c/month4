import {Router} from "express";
import {container} from "../composition-root";
import {authGuardMiddleware} from "../middleware/authGuardMiddleware";
import {usersValidation} from "../middleware/inputValidationMiddleware";
import {errorsValidation} from "../middleware/errorsValidation";
import {UsersController} from "./controllers/user-controller";

const usersController = container.resolve<UsersController>(UsersController)

export const usersRouter = Router();
usersRouter
.get('/', usersController.getUsers.bind(usersController))
.post('/',authGuardMiddleware,usersValidation,errorsValidation, usersController.createUser.bind(usersController))
.delete('/:id',authGuardMiddleware,errorsValidation,  usersController.deleteUser.bind(usersController))
