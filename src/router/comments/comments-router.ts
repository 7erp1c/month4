import {Request, Response, Router} from "express";
import {authTokenMiddleware} from "../../middleware/authMiddleware/authTokenUser";
import {CommentsService} from "../../domain/comments/comments-service";
import {RequestWithDelete} from "../../typeForReqRes/helperTypeForReq";
import {_delete_all_} from "../../typeForReqRes/blogsCreateAndPutModel";
import {commentValidation} from "../../middleware/inputValidationMiddleware";
import {errorsValidation} from "../../middleware/errorsValidation";


export const commentsRouter = Router({})

commentsRouter
    .put('/:commentId', authTokenMiddleware,commentValidation,errorsValidation, async (req: Request, res: Response) => {
        const {commentId} = req.params
        const { content} = req.body
        const user = req.userId
        console.log("user   "+user)
        if (!user) {
            return res.status(401).send('Unauthorized');
        }
        const idComments = await CommentsService.allComments(commentId)
        console.log("idComments   "+idComments)
        if (!idComments) {
            return res.sendStatus(404)
        }
        if (user !== idComments.commentatorInfo.userId) {
            return res.sendStatus(403)
        }

        const updateComment = await CommentsService.updateComment(commentId, content)
        console.log("updateComment   "+updateComment)
        if (!updateComment) {
            res.sendStatus(404)
            return
        }
        return res.sendStatus(204)
    })

    .delete('/:id', authTokenMiddleware, async (req: RequestWithDelete<_delete_all_>, res) => {
        const {id} = req.params
        console.log("ID:      " +id)
        //проверяем на 403 If try deleted the comment that is not your own:
        // if (!req.headers.authorization) {
        //     return res.status(401).send('Unauthorized');
        // }
        // const old-token = req.headers.authorization?.split(' ')[1];
        // const transformationId = await JwtService.getUserIdByToken(old-token);
        // const userId = transformationId ? transformationId.toHexString() : null;
        // const searchUser = await UsersService.findUserById(userId);
        const user = req.userId
        console.log("USER:      " +user)
        if (!user) {
            return res.status(401).send('Unauthorized');
        }
        const idComments = await CommentsService.allComments(id)
        console.log("idComments:      " +idComments)
        if (!idComments) {
            return res.sendStatus(404)
        }

        if (/*!searchUser||!idComments || !idComments.commentatorInfo ||*/ user !== idComments.commentatorInfo.userId) {
            return res.sendStatus(403)
        }
        //deleted:
        const isDelete = await CommentsService.deleteComments(id)
        if (!isDelete) {
            res.sendStatus(404);
            return
        }
        return res.sendStatus(204);

//Применить ко всему
//         const result = await CommentsService.removeComment(id, user as string);
//
//         if(result.status === ResultStatuses.Success) return res.sendStatus(204);
//         if(result.status === ResultStatuses.Forbbiden) return res.status(403).send(result.errorMessage!)
    })

    .get('/:id', async (req, res) => {
        const {id} = req.params
        const users = await CommentsService.allComments(id)
        if(!users){
            return res.sendStatus(404)
        }
        return res.status(200).send(users)
    })