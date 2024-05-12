import {Router} from "express";
import {authRefreshTokenMiddleware} from "../middleware/authMiddleware/authRefreshTokenUser";
import {authTokenMiddlewareForSessions} from "../middleware/authMiddleware/authTokenMiddlewareForSessions";
import {securityController} from "../composition-root";


export const securityRouter = Router({})

    .get("/devices", authRefreshTokenMiddleware, securityController.getDevices.bind(securityController))

    .delete("/devices", authRefreshTokenMiddleware, securityController.deleteDevices.bind(securityController))

    .delete("/devices/:deviceId", authTokenMiddlewareForSessions, securityController.deleteDeviceById.bind(securityController))