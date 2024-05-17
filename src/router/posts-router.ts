import {Request, Response, Router} from "express";
import {
    RequestPostsComments,
    RequestWithBlogsPOST,
    RequestWithDelete,
    RequestWithPostsPOST,
    RequestWithPut
} from "../typeForReqRes/helperTypeForReq";
import {
    commentCreateContent,
    postIdParam,
    postLikeStatus,
    postsInput
} from "../typeForReqRes/post-input-model/posts-input";
import {allId} from "../typeForReqRes/blogs-input-model/blogs-input";
import {PostsService} from "../domain/posts-service";
import {authGuardMiddleware} from "../middleware/authGuardMiddleware";
import {commentValidation, tValidationLikes, postsValidation} from "../middleware/inputValidationMiddleware";
import {errorsValidation} from "../middleware/errorsValidation";
import {QueryBlogRequestType} from "../model/blogsType/blogsView";
import {QueryPostRequestType, SortPostRepositoryType} from "../model/postsType/postsType";
import {PostsQueryRepository} from "../repositoriesQuery/posts-query-repository";
import {CommentsService} from "../domain/comments-service";
import {CommentsQueryRepository} from "../repositoriesQuery/comments-query-repository";
import {SortCommentsRepositoryType} from "../model/commentsType/commentsType";
import {paginatorValidator} from "../middleware/sortingAndPaginationMiddleware";
import {authTokenMiddelware} from "../middleware/postMiddelware/aurhTokenMiddelware";
import {errorsHandler404} from "../_util/errors-handler";
import {ResultStatus} from "../_util/enum";
import {getUserIdFromAccess} from "../middleware/getUserId/getUserIdFromAccess";



export const postsRouter = Router({})
postsRouter
    .put('/:postId/like-status',authTokenMiddelware, tValidationLikes, errorsValidation, async(req:RequestWithPut<postIdParam,postLikeStatus>, res:Response)=>{
        try {
            await PostsService
                .createLikePost(req.params.postId, req.body.likeStatus, req.userId!,req.user.accountData.login!)
            res.sendStatus(204)
        } catch (err) {
            errorsHandler404(res, err);
        }
    })
    .get('/:postId/comments', getUserIdFromAccess, paginatorValidator, errorsValidation,
        async (req: RequestPostsComments<postIdParam, any>, res: Response) => {
            try {
                const sortData: SortCommentsRepositoryType = {
                    sortBy: req.query.sortBy || "createdAt",
                    sortDirection: req.query.sortDirection || "desc",
                    pageNumber: req.query.pageNumber || 1,
                    pageSize: req.query.pageSize || 10
                }
                const comments = await CommentsQueryRepository
                    .getAllCommentsWithPost(sortData, req.params.postId, req.userId!);
                return res.status(200).json(comments);
            } catch (err) {
                errorsHandler404(res, err);
                return
            }


        })
    .post('/:postId/comments', getUserIdFromAccess, commentValidation, errorsValidation,
        async (req: RequestWithPut<postIdParam, commentCreateContent>, res: Response) => {
            const newComment = await CommentsService.createComments(req.body.content, req.params.postId, req.userId!)
            if (newComment.status === ResultStatus.NotFound) return res.status(404).send(newComment.extensions)
            return res.status(201).send(newComment.data)
        })

    .get('/', getUserIdFromAccess, async (req: RequestWithBlogsPOST<QueryPostRequestType>, res: Response) => {
        let posts;
        const query: QueryBlogRequestType = req.query
        const sortData: SortPostRepositoryType = {
            sortBy: query.sortBy || "createdAt",
            sortDirection: query.sortDirection || "desc",
            pageNumber: query.pageNumber || 1,
            pageSize: query.pageSize || 10
        }
        if (req.user) {
            posts = await PostsQueryRepository.getAllPosts(sortData, undefined, req.user.id);
        } else {
            posts = await PostsQueryRepository.getAllPosts(sortData);
        }
        res.status(200).json(posts);
    })

    .post('/',getUserIdFromAccess, postsValidation, errorsValidation,
        async (req: RequestWithPostsPOST<postsInput>, res: Response) => {
        const newPostsFromRep = await PostsService
            .createPosts(
                req.body.title,
                req.body.shortDescription,
                req.body.content,
                req.body.blogId,
                req.userId!
            )
        res.status(201).send(newPostsFromRep)
    })


    .get('/:id',getUserIdFromAccess, async (req: Request, res: Response) => {
        const foundPostsFromRep = await PostsService.findPostsByIDQuery(req.params.id,req.userId!)
        if (!foundPostsFromRep) {
            res.sendStatus(404)
            return;
        } else {
            res.send(foundPostsFromRep)
            return
        }
    })

    .put('/:id', authGuardMiddleware, postsValidation, errorsValidation,
        async (req: Request, res: Response) => {
        const rB = req.body
        const isUpdatePosts = await PostsService
            .updatePosts(req.params.id, rB.title, rB.shortDescription, rB.content, rB.blogId)
        if (isUpdatePosts) {
            res.status(204).send()
            return
        }
        if (!isUpdatePosts) {
            res.status(404).send()
            return
        }

    })

    .delete('/:id', authGuardMiddleware, async (req: RequestWithDelete<allId>, res: Response) => {
        const isDelete = await PostsService.deletePosts(req.params.id)
        if (isDelete) {
            res.sendStatus(204)//Not Found
        } else {
            res.sendStatus(404)
        }
    })