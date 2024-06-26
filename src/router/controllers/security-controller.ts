import {Request, Response} from "express";
import {SecurityQueryRepository} from "../../repositoriesQuery/security-query-repository";
import {SecurityService} from "../../domain/security-service";
import {RequestWithDelete} from "../../typeForReqRes/helperTypeForReq";

import {_delete_one_} from "../../typeForReqRes/security-input-model/security-input";
import {inject, injectable} from "inversify";
import {JwtService} from "../../domain/jwt-service";
@injectable()
export class SecurityController {
    constructor(
       @inject(SecurityQueryRepository) protected securityQueryRepository:SecurityQueryRepository,
       @inject(SecurityService) protected securityService:SecurityService,
       @inject(JwtService) protected jwtService:JwtService
    ) {
    }
    async getDevices(req: Request, res: Response) {
        //
        const devices = await this.securityQueryRepository.findAllSessions(req.userId || "")
        return res.status(200).send(devices)
    }

    async deleteDevices(req: Request, res: Response) {
        const result = await this.securityService.deleteDevicesSessions(req.userId ?? "", req.cookies.refreshToken)
        if (!result) {
            res.sendStatus(401)
        }
        res.sendStatus(204)
    }

    async deleteDeviceById(req: RequestWithDelete<_delete_one_>, res: Response) {
        const result = await this.securityService.deleteDevicesSessionById(req.params.deviceId)
        if (!result) {
            res.sendStatus(404);
            return
        }
        //протуханим токен
        await this.jwtService.updateDBJWT(req.cookies.refreshToken)
        res.sendStatus(204);
    }
}
