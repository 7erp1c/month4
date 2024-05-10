import {EmailsManager} from "../managers/email-manager";
import {UsersService} from "./users-service";
import {UsersInputType} from "../model/usersType/inputModelTypeUsers";
import {UsersRepository} from "../repositories/usersRepository";
import {v4 as uuidv4} from "uuid";
import {add} from "date-fns";
import {RefreshTokenRepository} from "../repositories/refreshTokenRepository";
import {UsersQueryRepository} from "../repositoriesQuery/user-query-repository";
import {ResultStatus} from "../_util/enum";
import {JwtService} from "../application/jwt-service";
import {Result} from "../model/result.type";
import {twoTokenType} from "../model/authType/authType";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {settings} from "../setting";
import {emailsManager, jwtService} from "../composition-root";


export class AuthService {
    constructor(
        protected usersService: UsersService,
        protected usersRepository: UsersRepository,
        protected usersQueryRepository: UsersQueryRepository,
        // protected jwtService: JwtService,
        // protected emailsManager:EmailsManager
    ) {}

    async login(loginOrEmail: string, password: string, userAgent: string, ip: string): Promise<Result<twoTokenType | null>> {
        //login
        const user = await this.usersService.loginUser(loginOrEmail, password)//находим user
        if (!user.data || user.status === ResultStatus.Unauthorized) return {
            status: ResultStatus.Unauthorized,
            extensions: [{field: 'user', message: "User registration failed(AuthService)"}],
            data: null,
        }

        const deviceTitle = userAgent.split(" ")[1] || 'unknown';
        //create token
        const twoToken = await jwtService.twoToken(user.data.id, deviceTitle, ip)
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
    }

    async createUser(login: string, password: string, email: string): Promise<UsersInputType | null> {
        //проверка для интеграционных тестов
        const searchUser = await this.usersQueryRepository.findUserByEmail(email)
        if (searchUser) {
            return null
        }
        const user = await this.usersService.createUser(login, password, email)
        console.log(user)

        if (!user) {
            return null
        }
        const findUser = await this.usersQueryRepository.findUserByIdAllModel(user.id)

        if (!findUser || !findUser.data?.emailConfirmation) {
            return null
        }

        emailsManager
            .sendMessageWitchConfirmationCode(findUser.data.accountData.email, findUser.data.accountData.login, findUser.data.emailConfirmation.confirmationCode)
        return user
    }

    async confirmCode(code: string): Promise<{ status: boolean, message: string }> {

        let user = await this.usersRepository.findUserByCode(code)
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

        await this.usersRepository.updateConfirmation(user.id)
        return {status: true, message: ``}

    }

    //повторная отправка email
    async confirmEmail(email: string): Promise<{ status: boolean, message: string }> {

        const newConfirmationCode = uuidv4()
        const newDate = add(new Date(), {hours: 48}).toISOString()

        const isUserUpdated = await this.usersRepository.UpdateRecoveryCode(email, newConfirmationCode, newDate)
        if (!isUserUpdated) return {status: false, message: `user is confirmed user: ${isUserUpdated}`};

        let user = await this.usersQueryRepository.findUserByEmail(email)

        if (!user) return {status: false, message: `user is confirmed user: ${user}`};

        emailsManager
            .sendMessageWitchConfirmationCode(user.accountData.email, user.accountData.login, user.emailConfirmation!.confirmationCode)
        return {status: true, message: ``}
    }

    async refreshToken(oldToken: string) {
        const checkToken = await jwtService.checkToken(oldToken);
        if (!checkToken) {
            return null
        }
        return checkToken
    }

    async sendRecoveryCode(email: string): Promise<{ status: boolean, message: string }> {

        let user = await this.usersRepository.findByLoginOrEmail(email)
        if (!user) return {status: false, message: `user is confirmed user: ${user}`};

        const newRecoveryCode = uuidv4()
        console.log("newRecoveryCode: ", newRecoveryCode)
        const newDate = add(new Date(), {hours: 48}).toISOString()
        //обновляем код, статус на false,дату
        const UpdateRecoveryCode = await this.usersRepository.UpdateRecoveryCode(email, newRecoveryCode, newDate)

        if (!UpdateRecoveryCode) return {status: false, message: `user is confirmed user: ${UpdateRecoveryCode}`};

        emailsManager
            .emailsManagerRecovery(email, newRecoveryCode)

        return {status: true, message: ``}
    }

    async updatePassword(password: string, code: string): Promise<{ status: boolean, message: string }> {
        //находим user по code
        const user = await this.usersRepository.findUserByCode(code)
        //проверим пароль совпадает со старым или нет
        if (!user) return {status: false, message: `no user in db user: ${user}`};

        if (user.recoveryPassword?.isUsed === true) return {
            status: false,
            message: `the code is used: status code ${user.recoveryPassword?.isUsed}`
        };
        if (!user.recoveryPassword?.recoveryCode) return {status: false, message: `user no code ${user}`};
        if (code !== user.recoveryPassword?.recoveryCode) return {
            status: false,
            message: `code from front differs from code in db codes : ${code} ,${user.recoveryPassword?.recoveryCode}`
        };
        const passwordSalt = user.accountData.passwordSalt!
        const passwordHash = await this.usersService._generateHash(password, passwordSalt)
        if (passwordHash === user.accountData.passwordHash) return {
            status: false,
            message: `the password cannot be used because it was entered earlier, enter a new password`
        }

        const updatePassword = await this.usersRepository.updatePassword(user.id, passwordHash, passwordSalt)
        if (!updatePassword) return {status: false, message: `not update document`}
        return {status: true, message: ``}

    }

    async getUserIdByToken(token: string): Promise<string | null> {
        try {
            const result: any = jwt.verify(token, settings.JWT_SECRET);
            return result.userId;
        } catch (err) {
            return null;
        }
    }
}