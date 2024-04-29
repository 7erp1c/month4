import { Request } from "express";
import {UsersOutputType} from "../model/usersType/inputModelTypeUsers";

declare global {
    namespace Express {
        export interface Request {
            userId:  string | null
            user?: UsersOutputType|null
            userIp?: string
        }
    }
}
declare module "express-serve-static-core" {
    interface Request {
        auth?: { // Сделайте свойство необязательным, чтобы не нарушить существующий код
            loginOrEmail: string;
            password: string;
            ip: string;
            deviceTitle: string;
        };
    }
}
