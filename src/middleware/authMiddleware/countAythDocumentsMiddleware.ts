import {NextFunction, Request, Response} from "express";
import { securityRepository} from "../../repositories/api/securityRepository";
import {settings} from "../../setting";


export const apiReqLimitMiddleware  = async (req: Request, res: Response, next: NextFunction) => {
    // req.baseUrl передает некорректные данные,он не заходить в глубь запроса, подтягивает /auth, а должен /auth/login
    if (!req.ip ||  !req.originalUrl) return res.sendStatus(400)
    // Получение IP, URL и текущей даты
    const ip = req.ip || "unknown"
    const url = req.originalUrl;
    //сохраняем запроса в DB
    await securityRepository.saveRequestInformation(ip, url);
    // Подсчитываем количество запросов по IP и URL за интервал времени
    const requestCount = await securityRepository.countRequestByTime(ip, req.originalUrl, settings.interval);
    console.log(requestCount)
    //если за 10 сек, прилетело 5 запросов === Too Many Requests
    if (requestCount > settings.count) {
        return res.sendStatus(429);

    } else {
        return next();
    }


};