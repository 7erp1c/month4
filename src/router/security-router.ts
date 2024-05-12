import {Request, Response, Router} from "express";
import {SecurityService} from "../domain/security-service";
import {RequestWithDelete} from "../typeForReqRes/helperTypeForReq";
import {_delete_all_, _delete_one_} from "../typeForReqRes/blogsCreateAndPutModel";
import {SecurityQueryRepository} from "../repositoriesQuery/security-query-repository";
import {authRefreshTokenMiddleware} from "../middleware/authMiddleware/authRefreshTokenUser";
import {authTokenMiddlewareForSessions} from "../middleware/authMiddleware/authTokenMiddlewareForSessions";
import {AuthService} from "../domain/auth-service";
import {JwtService} from "../domain/jwt-service";
import {SecurityController} from "./controllers/security-controller";
import {securityController} from "../composition-root";


export const securityRouter = Router({})

    .get("/devices", authRefreshTokenMiddleware, securityController.getDevices.bind(securityController))

    .delete("/devices", authRefreshTokenMiddleware, securityController.deleteDevices.bind(securityController))

    .delete("/devices/:deviceId", authTokenMiddlewareForSessions, securityController.deleteDeviceById.bind(securityController))