import {Request, Response, NextFunction} from "express";
import {header} from "express-validator";

export const authGuardMiddleware = (req: Request,res: Response,next: NextFunction ) =>{

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const oneAuthHeader = authHeader.split(' ').splice(0,1).toString()

    const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');

    const username = credentials[0];
    const password = credentials[1];

    if ( oneAuthHeader !=='Basic'|| username !== 'admin' || password !== 'qwerty') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    return next();
}
