import {RequestWithAuth, RequestWithUsers} from "../../typeForReqRes/helperTypeForReq";
import {Request, Response} from "express";
import {AuthService} from "../../domain/auth-service";
import {ResultStatus} from "../../_util/enum";
import {addTokenInCookie} from "../../domain/managers/token-add-cookie";
import {delay} from "../../__tests__/e2e/utils/timer";
import {errorsHandler400} from "../../_util/errors-handler";
import {UsersQueryRepository} from "../../repositoriesQuery/user-query-repository";
import {
    authInput, authInputCode,
    authInputEmail,
    authInputRecovery,
    authInputRegistration
} from "../../typeForReqRes/auth-input-model/auth-input";
import {injectable, inject } from "inversify";
import {JwtService} from "../../domain/jwt-service";
@injectable()
export class AuthController {

    constructor(
        @inject(AuthService) protected authService: AuthService,
        @inject(UsersQueryRepository) protected usersQueryRepository: UsersQueryRepository,
        @inject(JwtService) protected jwtService: JwtService
    ) {}

    async LoginUser(req: RequestWithUsers<authInput>, res: Response) {
        const {loginOrEmail, password} = req.body
        const ip = req.ip || "unknown"
        const userAgent = req.headers['user-agent'] || "unknown";
    //login, create token, create session, add data token  in db
        const loginUser = await this.authService.login(loginOrEmail, password, userAgent, ip)
        if (loginUser.status === ResultStatus.Unauthorized) return res.sendStatus(401)
    //закидываем токен в cookie (module в managers)
        addTokenInCookie(res, loginUser.data!.refresh)

        return res.status(200).send({
            accessToken: loginUser.data!.access
        })
    }
    async passwordRecovery(req: RequestWithAuth<authInputEmail>, res: Response) {
        await this.authService.sendRecoveryCode(req.body.email)
        return res.status(204).send("Even if current email is not registered (for prevent user's email detection)")
    }
    async newUserPassword(req: RequestWithAuth<authInputRecovery>, res: Response) {
        const updatePassword = await this.authService.updatePassword(req.body.newPassword, req.body.recoveryCode)
        if (!updatePassword.status) return res.status(401).send(updatePassword.message)
        return res.status(204).send("If code is valid and new password is accepted")
    }
    async refreshToken(req: Request, res: Response) {
        //the delay is so that the tokens are not the same
        await delay(200)
        const twoToken = await this.jwtService.tokenUpdate(req.userId!, req.cookies.refreshToken!)
        if (!twoToken.data || twoToken.status === ResultStatus.Unauthorized) return res.sendStatus(401)
        addTokenInCookie(res, twoToken.data.refresh)
        return res.status(200).send({
            accessToken: twoToken.data.refresh
        })
    }

    //регистрация и подтверждение
    async registrationConfirmation(req: RequestWithAuth<authInputCode>, res: Response) {
        const result = await this.authService.confirmCode(req.body.code)
        if (!result.status) return res.status(400).send(result.message)
        return res.status(204).send(result + " Email was verified. Account was activated")
    }

    async RegistrationUser(req: RequestWithAuth<authInputRegistration>, res: Response) {
        try {
            const user = await this.authService.createUser(req.body.login, req.body.password, req.body.email)
            res.status(204).json({
                user
            })
        } catch (err) {
            errorsHandler400(res, err);
        }
    }

    //повторная отправка email
    async registrationEmailResending(req: RequestWithAuth<authInputEmail>, res: Response) {
        const result = await this.authService.confirmEmail(req.body.email)
        if (!result) return res.sendStatus(401);
        return res.status(204).send(result + " Input data is accepted. Email with confirmation code will be send to passed email address. Confirmation code should be inside link as query param, for example: https://some-front.com/confirm-registration?code=youtcodehere")
    }
    //выход и отчистка TokenDB
    async logoutUser(req: Request, res: Response) {
        return res.sendStatus(204);
    }
    async getInfoUser(req: Request, res: Response) {
        if (!req.userId) return res.status(401).send('Unauthorized')
        const user = await this.usersQueryRepository.findUserById(req.userId);
        if (!user.data || user.status === ResultStatus.Unauthorized) return res.sendStatus(401)
        return res.status(200).send(user.data);
    }
}