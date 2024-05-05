import {NextFunction, Request, Response} from "express";
import {UsersRepository} from "../../repositories/usersRepository";
import {AuthService} from "../../domain/auth-service";
import {AUTH_METHODS} from "../../setting";

export const softAuthentificationMiddleware = async (req: Request, res: Response, next: NextFunction) => {

    const authHeader = req.header("authorization")?.split(" "); // Получаем значение поля в заголовке
    if (authHeader) {
        const authMethod = authHeader[0]; // получаем метод из заголовка
        const authInput = authHeader[1]; // получаем значение для авторизации из заголовка
        if (authMethod === AUTH_METHODS.bearer) { // If authorisation method is BEARER
            const userId = await AuthService.getUserIdByToken(authInput);
            if (userId) {
                const user = await UsersRepository.findUserById(userId);
                if (user) {
                    req.userId = userId;
                }
            }
        }
    }
    next();
};