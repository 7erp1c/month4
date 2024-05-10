import {Request, Response, Router} from "express";
import {UsersService} from "../domain/users-service";
import {authInput} from "../model/authType/authType";
import {RequestWithUsers} from "../typeForReqRes/helperTypeForReq";
import {JwtService} from "../application/jwt-service";

import {
    authCodeValidation,
    authEmailValidation,
    authValidation, newPasswordValid, passRecValidation,
    usersValidation
} from "../middleware/inputValidationMiddleware";
import {errorsValidation} from "../middleware/errorsValidation";
import {AuthService} from "../domain/auth-service";
import {UsersQueryRepository} from "../repositoriesQuery/user-query-repository";
import {ResultStatus} from "../_util/enum";

import {authTokenLogoutMiddleware} from "../middleware/authMiddleware/authLogoutUser";
import {delay} from "../__tests__/e2e/utils/timer";
import {addTokenInCookie} from "../managers/token-add-cookie";
import {EmailsManager} from "../managers/email-manager";
import {authRefreshTokenMiddleware} from "../middleware/authMiddleware/authRefreshTokenUser";
import {errorsHandler400, errorsHandler404} from "../_util/errors-handler";
import {AuthController} from "./controllers/auth-controller";
import {authController} from "../composition-root";


export const authRouter = Router({})
authRouter
    //Логиним User и получаем пару токенов
    .post('/login', authValidation, errorsValidation, authController.LoginUser.bind(authController))
    //письмо на почту с кодом для обновления пароля
    .post("/password-recovery", passRecValidation, errorsValidation, authController.passwordRecovery.bind(authController))
    //обновляем пароль
    .post("/new-password", newPasswordValid, errorsValidation, authController.newUserPassword.bind(authController))
    //получаем новую пару токенов
    .post('/refresh-token', authRefreshTokenMiddleware, authController.refreshToken.bind(authController))
    //отправка письма с кодом подтверждения
    .post('/registration-confirmation', authCodeValidation, errorsValidation, authController.registrationConfirmation.bind(authController))
    //создаем и регистрируем User
    .post('/registration', usersValidation, errorsValidation, authController.RegistrationUser.bind(authController))
    //повторная отправка email
    .post('/registration-email-resending', authController.registrationEmailResending.bind(authController))
    //выход и отчистка TokenDB
    .post("/logout", authTokenLogoutMiddleware, authController.logoutUser.bind(authController))
    //получаем инфо о узере
    .get('/me', authRefreshTokenMiddleware, authController.getInfoUser.bind(authController))