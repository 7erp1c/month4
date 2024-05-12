import { Router} from "express";
import {
    authCodeValidation,
    authValidation, newPasswordValid, passRecValidation,
    usersValidation
} from "../middleware/inputValidationMiddleware";
import {errorsValidation} from "../middleware/errorsValidation";
import {authTokenLogoutMiddleware} from "../middleware/authMiddleware/authLogoutUser";
import {authRefreshTokenMiddleware} from "../middleware/authMiddleware/authRefreshTokenUser";
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