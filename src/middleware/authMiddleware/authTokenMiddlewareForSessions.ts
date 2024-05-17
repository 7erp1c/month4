import {Request, Response, NextFunction} from "express";
import {JwtService} from "../../domain/jwt-service"
import {container} from "../../composition-root";
import {SecurityQueryRepository} from "../../repositoriesQuery/security-query-repository";

const jwtService = container.get<JwtService>(JwtService)
const securityQueryRepository = container.get<SecurityQueryRepository>(SecurityQueryRepository)

export const authTokenMiddlewareForSessions = async (req: Request, res: Response, next: NextFunction) => {

    const {refreshToken} = req.cookies
    if (!refreshToken) {
        return res.sendStatus(401)
    }
    //getting the id from the token, протух
    const userId = await jwtService.getIdFromToken(refreshToken)
    if (!userId) {
        return res.sendStatus(401)
    }

    //getting the id from the sessions
    const findSessionsByDeviceId = await securityQueryRepository.findSessionByDeviceId(req.params.deviceId)
    console.log("___________findUserIdAndDeviceId  " + findSessionsByDeviceId)
    //if not session
    if (!findSessionsByDeviceId) return res.sendStatus(404)
    // If try to delete the deviceId of other user
    const findUserIdInSessions = await securityQueryRepository.userSessionSearch(req.params.deviceId, refreshToken)
    if (!findUserIdInSessions) return res.sendStatus(403)
    if (userId) {
        req.userId = userId
        return next()
    }
    // If the JWT refreshToken inside cookie is missing, expired or incorrect
    return res.sendStatus(401)
}
