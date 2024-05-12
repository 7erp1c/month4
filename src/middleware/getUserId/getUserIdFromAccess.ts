import {NextFunction, Request, Response} from "express";
import {AUTH_METHODS} from "../../setting";
import {authService, usersRepository} from "../../composition-root";

export const getUserIdFromAccess = async (req: Request, res: Response, next: NextFunction) => {

    const authHeader = req.header("authorization")?.split(" "); // Получаем значение поля в заголовке
    if (authHeader) {
        const authMethod = authHeader[0]; // получаем метод из заголовка
        const authInput = authHeader[1]; // получаем значение для авторизации из заголовка

        if (authMethod === AUTH_METHODS.bearer) { // If authorisation method is BEARER
            const userId = await authService.getUserIdByToken(authInput);
            const user = await usersRepository.findUserById(userId!);
            if (userId) {
                const user = await usersRepository.findUserById(userId);
                if (user) {
                    req.userId = userId;
                    req.user = user
                }
            }
        }
    }
    next();
};