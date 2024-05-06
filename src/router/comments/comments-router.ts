import {Request, Response, Router} from "express";
import {authRefreshTokenMiddleware} from "../../middleware/authMiddleware/authRefreshTokenUser";
import {CommentsService} from "../../domain/comments/comments-service";
import {RequestWithDelete} from "../../typeForReqRes/helperTypeForReq";
import {_delete_all_} from "../../typeForReqRes/blogsCreateAndPutModel";
import {commentValidation, commentValidationLikes} from "../../middleware/inputValidationMiddleware";
import {errorsValidation} from "../../middleware/errorsValidation";
import {authTokenMiddelware} from "../../middleware/postMiddelware/aurhTokenMiddelware";
import {Result} from "../../model/result.type";
import {errorsHandler} from "../../_util/errors-handler";
import {getCommentTokenMiddelware} from "../../middleware/commentsMiddelware/getCommentAllLikes";


export const commentsRouter = Router({})

commentsRouter
    .put('/:commentId/like-status', authTokenMiddelware, commentValidationLikes, errorsValidation, async (req: Request, res: Response) => {
        try {
        const {commentId} = req.params
        const {likeStatus} = req.body
        const userId = req.userId!

            const createLikeComment = await CommentsService.createLikeComment(commentId, likeStatus, userId)
            res.sendStatus(204)
        } catch (err) {
            errorsHandler(res, err);
        }


    })
    .put('/:commentId', authTokenMiddelware, commentValidation, errorsValidation, async (req: Request, res: Response) => {
        const {commentId} = req.params
        const {content} = req.body
        const user = req.userId
        if (!user) {
            return res.status(401).send('Unauthorized');
        }
        const idComments = await CommentsService.OneCommentById(commentId)
        if (!idComments) {
            return res.sendStatus(404)
        }
        if (user !== idComments.commentatorInfo.userId) {
            return res.sendStatus(403)
        }

        const updateComment = await CommentsService.updateComment(commentId, content)
        console.log("updateComment   " + updateComment)
        if (!updateComment) {
            res.sendStatus(404)
            return
        }
        return res.sendStatus(204)
    })

    .delete('/:id', authRefreshTokenMiddleware, async (req: RequestWithDelete<_delete_all_>, res) => {
        const {id} = req.params

        const user = req.userId

        if (!user) {
            return res.status(401).send('Unauthorized');
        }
        const idComments = await CommentsService.OneCommentById(id)

        if (!idComments) {
            return res.sendStatus(404)
        }
        if (user !== idComments.commentatorInfo.userId) {
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

    .get('/:id',getCommentTokenMiddelware,async (req, res) => {
        const {id} = req.params
        const users = await CommentsService.getCommentWitchLikes(id,req.userId!)
        if (!users) {
            return res.sendStatus(404)
        }
        return res.status(200).send(users)
    })