import {Request, Response, Router} from "express";
import {SecurityService} from "../../domain/security/security-service";
import {RequestWithDelete} from "../../typeForReqRes/helperTypeForReq";
import {_delete_all_, _delete_one_} from "../../typeForReqRes/blogsCreateAndPutModel";
import {SecurityQueryRepository} from "../../repositoriesQuery/security-query-repository";
import {authTokenMiddleware} from "../../middleware/authMiddleware/authTokenUser";
import {authTokenMiddlewareForSessions} from "../../middleware/authMiddleware/authTokenMiddlewareForSessions";
import {AuthService} from "../../domain/auth-service";
import {JwtService} from "../../application/jwt-service";


export const securityRouter = Router({})

    .get("/devices", authTokenMiddleware, async (req: Request, res: Response) => {
        //
        const devices = await SecurityQueryRepository.findAllSessions(req.userId || "")
        return res.status(200).send(devices)
    })

    .delete("/devices", authTokenMiddleware, async (req: Request, res: Response) => {
        const result = await SecurityService.deleteDevicesSessions(req.userId ?? "",req.cookies.refreshToken)
        if (!result) {
            res.sendStatus(401)
        }
        res.sendStatus(204)
    })

    .delete("/devices/:deviceId", authTokenMiddlewareForSessions, async (req: RequestWithDelete<_delete_one_>, res: Response) => {
        const result = await SecurityService.deleteDevicesSessionById(req.params.deviceId)
        if (!result) {
            res.sendStatus(404);
            return
        }
        //протуханим токен
        await JwtService.updateDBJWT(req.cookies.refreshToken)
        res.sendStatus(204);
    })