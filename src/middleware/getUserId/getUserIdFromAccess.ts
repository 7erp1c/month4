import {NextFunction, Request, Response} from "express";
import {AUTH_METHODS} from "../../setting";
import { container} from "../../composition-root";
import {UsersRepository} from "../../repositories/usersRepository";
import {AuthService} from "../../domain/auth-service";

const usersRepository = container.get<UsersRepository>(UsersRepository)
const authService = container.get<AuthService>(AuthService)
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