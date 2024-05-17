import {Router} from "express";
import {authRefreshTokenMiddleware} from "../middleware/authMiddleware/authRefreshTokenUser";
import {authTokenMiddlewareForSessions} from "../middleware/authMiddleware/authTokenMiddlewareForSessions";
import {container} from "../composition-root";
import {SecurityController} from "./controllers/security-controller";

const securityController = container.resolve<SecurityController>(SecurityController)
export const securityRouter = Router({})

    .get("/devices", authRefreshTokenMiddleware, securityController.getDevices.bind(securityController))

    .delete("/devices", authRefreshTokenMiddleware, securityController.deleteDevices.bind(securityController))

    .delete("/devices/:deviceId", authTokenMiddlewareForSessions, securityController.deleteDeviceById.bind(securityController))