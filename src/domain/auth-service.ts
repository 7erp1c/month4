import {EmailsManager} from "../managers/email-manager";
import {UsersService} from "./users-service";
import {UsersInputType} from "../model/usersType/inputModelTypeUsers";
import {UsersRepository} from "../repositories/usersRepository";
import {v4 as uuidv4} from "uuid";
import {add} from "date-fns";
import {RefreshTokenRepository} from "../repositories/old-token/refreshTokenRepository";
import {UsersQueryRepository} from "../repositoriesQuery/user-query-repository";
import {json} from "express";
import {ResultStatus} from "../_util/enum";
import {JwtService} from "../application/jwt-service";
import {Result} from "../model/result.type";
import {twoTokenType} from "../model/authType/authType";


export const AuthService = {
    async login(loginOrEmail: string, password: string, userAgent: string, ip: string): Promise<Result<twoTokenType | null>> {
        //login
        const user = await UsersService.loginUser(loginOrEmail, password)//находим user
        if (!user.data || user.status === ResultStatus.Unauthorized) return {
            status: ResultStatus.Unauthorized,
            extensions: [{field: 'user', message: "User registration failed(AuthService)"}],
            data: null,
        }
        const deviceTitle = userAgent.split(" ")[1] || 'unknown';
        //create token
        const twoToken = await JwtService.twoToken(user.data.id, deviceTitle, ip)
        if (!twoToken.data || twoToken.status === ResultStatus.Unauthorized) return {
            status: ResultStatus.Unauthorized,
            extensions: [{field: 'twoToken', message: "The token has not been created(AuthService)"}],
            data: null,
        }
        //res
        return {
            status: ResultStatus.Success,
            data: {
                access: twoToken.data.access,
                refresh: twoToken.data.refresh
            }
        }
    },

    async createUser(login: string, password: string, email: string): Promise<UsersInputType | null> {
        //проверка для интеграционных тестов
        const searchUser = await UsersQueryRepository.findUserByEmail(email)
        if (searchUser) {
            return null
        }
        const user = await UsersService.createUser(login, password, email)
        console.log(user)

        if (!user) {
            return null
        }
        const findUser = await UsersQueryRepository.findUserByIdAllModel(user.id)

        if (!findUser || !findUser.data?.emailConfirmation) {
            return null
        }

        const sendEmail = await EmailsManager
            .sendMessageWitchConfirmationCode(findUser.data.accountData.email, findUser.data.accountData.login, findUser.data.emailConfirmation.confirmationCode)
        return user
    },

    async confirmCode(code: string): Promise<{ status: boolean, message: string }> {

        let user = await UsersRepository.findUserByCode(code)
        console.log("User in AuthService" + JSON.stringify(user))
        if (!user) return {status: false, message: `no user in db user: ${user}`};
        if (user.emailConfirmation?.isConfirmed) return {status: false, message: `user is confirmed user: ${user}`};
        if (code !== user.emailConfirmation?.confirmationCode) return {
            status: false,
            message: `code from front differs from code in db codes : ${code} ,${user.emailConfirmation?.confirmationCode}`
        };
        if (user.emailConfirmation.expirationDate < new Date().toISOString()) return {
            status: false,
            message: `date compare failed : ${new Date().toISOString()}, ${user.emailConfirmation.expirationDate}`
        };

        await UsersRepository.updateConfirmation(user.id)
        return {status: true, message: ``}

    },

    async confirmEmail(email: string): Promise<{ status: boolean, message: string }> {

        const newConfirmationCode = uuidv4()
        const newDate = add(new Date(), {hours: 48}).toISOString()

        const isUserUpdated = await UsersRepository.updateUserEmailConfirmationCode(email, newConfirmationCode, newDate)
        if (!isUserUpdated) return {status: false, message: `user is confirmed user: ${isUserUpdated}`};

        let user = await UsersQueryRepository.findUserByEmail(email)
        if (!user) return {status: false, message: `user is confirmed user: ${user}`};

        const sendEmail = await EmailsManager
            .sendMessageWitchConfirmationCode(user.accountData.email, user.accountData.login, user.emailConfirmation!.confirmationCode)
        return {status: true, message: ``}
    },

    async refreshToken(oldToken: string) {
        const checkToken = await RefreshTokenRepository.checkToken(oldToken);
        if (!checkToken) {
            return null
        }
        return checkToken
    }
}