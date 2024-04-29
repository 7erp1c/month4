import express, { Request, Response} from 'express'
import {blogsRouter} from "./router/blogs-router";
import {postsRouter} from "./router/posts-router";
import {usersRouter} from "./router/users-router";
import { authRouter } from './router/auth-router';
import {commentsRouter} from "./router/comments/comments-router";
import cookieParser from "cookie-parser";
import {connectMongoDb} from "./db/connect-mongo-db";
import {apiReqLimitMiddleware} from "./middleware/authMiddleware/countAythDocumentsMiddleware";
import useragent from 'express-useragent';
import {securityRouter} from "./router/security/security-router";

export const app = express()
app.set("trust proxy", true);
app.use(useragent.express());
app.use(express.json())
app.use(cookieParser())
app.use('/blogs', blogsRouter)
app.use('/posts', postsRouter)
app.use('/users', usersRouter)
app.use('/auth/', apiReqLimitMiddleware, authRouter)
app.use('/comments/',commentsRouter)
app.use('/security/', apiReqLimitMiddleware, securityRouter)



app.get('/', (req: Request, res: Response) => {
    res
        .status(200)
        .json({x: "x1"})

})
app.delete('/testing/all-data', async (req, res) => {
    try {
        await connectMongoDb.getDbName().dropDatabase();
        res.sendStatus(204); // Отправляем статус 204 после успешного удаления базы данных
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error'); // Если возникла ошибка, отправляем статус 500
    }

})
