import {RequestWithUsers} from "../../typeForReqRes/helperTypeForReq";
import {authInput} from "../../model/authType/authType";
import {Request, Response} from "express";
import {AuthService} from "../../domain/auth-service";
import {ResultStatus} from "../../_util/enum";
import {addTokenInCookie} from "../../managers/token-add-cookie";
import {delay} from "../../__tests__/e2e/utils/timer";
import {errorsHandler400} from "../../_util/errors-handler";
import {UsersQueryRepository} from "../../repositoriesQuery/user-query-repository";
import {jwtService} from "../../composition-root";

export class AuthController {
    constructor(
        protected authService: AuthService,
        protected usersQueryRepository: UsersQueryRepository,
        // protected jwtService: JwtService
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
    async passwordRecovery(req: Request, res: Response) {
        const {email} = req.body
        await this.authService.sendRecoveryCode(email)
        return res.status(204).send("Even if current email is not registered (for prevent user's email detection)")
    }
    async newUserPassword(req: Request, res: Response) {
        const {newPassword, recoveryCode} = req.body
        const updatePassword = await this.authService.updatePassword(newPassword, recoveryCode)
        if (!updatePassword.status) return res.status(401).send(updatePassword.message)
        return res.status(204).send("If code is valid and new password is accepted")
    }
    async refreshToken(req: Request, res: Response) {
        //the delay is so that the tokens are not the same
        await delay(200)
        const twoToken = await jwtService.tokenUpdate(req.userId!, req.cookies.refreshToken!)
        if (!twoToken.data || twoToken.status === ResultStatus.Unauthorized) return res.sendStatus(401)
        addTokenInCookie(res, twoToken.data.refresh)
        return res.status(200).send({
            accessToken: twoToken.data.refresh
        })
    }

    //регистрация и подтверждение
    async registrationConfirmation(req: Request, res: Response) {
        const {code} = req.body
        const result = await this.authService.confirmCode(code)
        if (!result.status) return res.status(400).send(result.message)
        return res.status(204).send(result + " Email was verified. Account was activated")
    }

    async RegistrationUser(req: Request, res: Response) {
        try {
            const {login, email, password} = req.body
            const user = await this.authService.createUser(login, password, email)
            res.status(204).json({
                user
            })
        } catch (err) {
            errorsHandler400(res, err);
        }
    }

    //повторная отправка email
    async registrationEmailResending(req: Request, res: Response) {
        const {email} = req.body
        const result = await this.authService.confirmEmail(email)
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