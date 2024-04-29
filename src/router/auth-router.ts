import {Request, Response, Router} from "express";
import {UsersService} from "../domain/users-service";
import {authView} from "../model/authType/authType";
import {RequestWithUsers} from "../typeForReqRes/helperTypeForReq";
import {JwtService} from "../application/jwt-service";
import {authTokenMiddleware} from "../middleware/authMiddleware/authTokenUser";
import {
    authCodeValidation,
    authEmailValidation,
    authValidation,
    usersValidation
} from "../middleware/inputValidationMiddleware";
import {errorsValidation} from "../middleware/errorsValidation";
import {AuthService} from "../domain/auth-service";
import {UsersQueryRepository} from "../repositoriesQuery/user-query-repository";
import {ResultStatus} from "../_util/enum";
import {authRefreshTokenMiddleware} from "../middleware/authMiddleware/authRefreshTokenUser";
import {authTokenLogoutMiddleware} from "../middleware/authMiddleware/authLogoutUser";
import {delay} from "../__tests__/e2e/utils/timer";
import {addTokenInCookie} from "../managers/token-add-cookie";


export const authRouter = Router({})
authRouter
    .post('/login', authValidation, errorsValidation, async (req: RequestWithUsers<authView>, res: Response) => {
        if (!req.body||!req.ip) return res.sendStatus(401)
        const {loginOrEmail, password} = req.body
        const ip = req.ip || "unknown"
        const userAgent = req.headers['user-agent']|| "unknown";
        //login, create token, create session, add data token  in db
        const loginUser = await AuthService.login(loginOrEmail, password, userAgent, ip)
        if (!loginUser.data || loginUser.status === ResultStatus.Unauthorized) return res.sendStatus(401)
        //закидываем токен в cookie (module в managers)
        addTokenInCookie(res, loginUser.data.refresh)

        return res.status(200).send({
            accessToken: loginUser.data.access
        })

    })

    .post('/refresh-token', authRefreshTokenMiddleware, async (req: Request, res: Response) => {
        const {refreshToken} = req.cookies
        if (!req.userId || !refreshToken) return res.sendStatus(401)
        //the delay is so that the tokens are not the same
        await delay(200)
        const twoToken = await JwtService.tokenUpdate(req.userId,refreshToken)
        if (!twoToken.data||twoToken.status === ResultStatus.Unauthorized) return res.sendStatus(401)

        addTokenInCookie(res, twoToken.data.refresh)
        return res.status(200).send({
            accessToken: twoToken.data.refresh
        })

    })

    //регистрация и подтверждение
    .post('/registration-confirmation', authCodeValidation, errorsValidation, async (req: Request, res: Response) => {
        const {code} = req.body
        const result = await AuthService.confirmCode(code)

        if (!result.status) {
            res.status(400).json({
                errorsMessages: [
                    {
                        message: "Invalid code or expiration date expired",
                        field: "code"
                    }]
            });
            return;
        }
        return res.status(204).send(result + " Email was verified. Account was activated")
    })

    .post('/registration', usersValidation, errorsValidation, async (req: Request, res: Response) => {

        const {login, email, password} = req.body

        const user = await AuthService.createUser(login, password, email)
        if (!user) {
            return res.sendStatus(400)
        }

        return res.status(204).json({
            user,
            message: 'Input data is accepted. Email with confirmation code will be sent to the provided email address.'
        });

    })

    //повторная отправка email
    .post('/registration-email-resending', authEmailValidation, errorsValidation, async (req: Request, res: Response) => {
        const {email} = req.body

        const result = await AuthService.confirmEmail(email)
        if (!result) {
            return res.sendStatus(500);
        }
        return res.status(204).send(result + " Input data is accepted. Email with confirmation code will be send to passed email address. Confirmation code should be inside link as query param, for example: https://some-front.com/confirm-registration?code=youtcodehere")
    })

    //выход и отчистка TokenDB
    .post("/logout", authTokenLogoutMiddleware, async (req: Request, res: Response) => {

        return res.sendStatus(204);
    })

    .get('/me', authTokenMiddleware, async (req: Request, res: Response) => {
        if (!req.userId) return res.status(401).send('Unauthorized')
        const user = await UsersQueryRepository.findUserById(req.userId);
        if (!user.data || user.status === ResultStatus.Unauthorized) return res.sendStatus(401)

        return res.status(200).send(user.data);

    })