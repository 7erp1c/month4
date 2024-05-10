import {Response, Router} from "express";
import {authRefreshTokenMiddleware} from "../middleware/authMiddleware/authRefreshTokenUser";
import {CommentsService} from "../domain/comments/comments-service";
import {RequestCommentsGet, RequestCommentsPut, RequestWithDelete} from "../typeForReqRes/helperTypeForReq";
import {_delete_all_} from "../typeForReqRes/blogsCreateAndPutModel";
import {commentValidation, commentValidationLikes} from "../middleware/inputValidationMiddleware";
import {errorsValidation} from "../middleware/errorsValidation";
import {authTokenMiddelware} from "../middleware/postMiddelware/aurhTokenMiddelware";
import {errorsHandler404} from "../_util/errors-handler";
import {getCommentTokenMiddelware} from "../middleware/commentsMiddelware/getCommentAllLikes";
import {
    commentsGetParams,
    commentsPutBodyContent,
    commentsPutBodyStatus,
    commentsIdPutParams
} from "../typeForReqRes/commentsReqModel/comments-Input-model";
import {ResultStatus} from "../_util/enum";


export const commentsRouter = Router({})

commentsRouter
    .put('/:commentId/like-status', authTokenMiddelware, commentValidationLikes, errorsValidation,
        async (req: RequestCommentsPut<commentsIdPutParams, commentsPutBodyStatus>, res: Response) => {
            try {
                await CommentsService.createLikeComment(req.params.commentId, req.body.likeStatus, req.userId!)
                res.sendStatus(204)
            } catch (err) {
                errorsHandler404(res, err);
            }
        })

    .put('/:commentId', authTokenMiddelware, commentValidation, errorsValidation,
        async (req: RequestCommentsPut<commentsIdPutParams, commentsPutBodyContent>, res: Response) => {
            const updateContent = await CommentsService.updateComment(req.params.commentId, req.body.content, req.userId!)
            if (updateContent.status === ResultStatus.NotFound) return res.status(404).send(updateContent.extensions)
            if (updateContent.status === ResultStatus.Forbidden) return res.status(403).send(updateContent.extensions)
            return res.sendStatus(204)
        })

    .delete('/:id', authRefreshTokenMiddleware, async (req: RequestWithDelete<_delete_all_>, res: Response) => {
        const result = await CommentsService.deleteComments(req.params.id,req.userId!)
        if (result.status === ResultStatus.NotFound) return res.status(404).send(result.extensions)
        if (result.status === ResultStatus.Forbidden) return res.status(403).send(result.extensions)
        return res.sendStatus(204);
    })

    .get('/:id', getCommentTokenMiddelware,
        async (req: RequestCommentsGet<commentsGetParams>, res: Response) => {
        const users = await CommentsService.getCommentWitchLikes(req.params.id, req.userId!)
        if (users.status === ResultStatus.NotFound) return res.status(404).send(users.extensions)
        return res.status(200).send(users.data)
    })