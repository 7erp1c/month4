import {Request, Response, Router} from "express";
import {
    RequestWithBlogsPOST,
    RequestWithDelete,
    RequestWithPostsPOST,
    RequestWithPut
} from "../typeForReqRes/helperTypeForReq";
import {
    commentCreateContent,
    postIdForComments,
    postsCreateAndPutModel
} from "../typeForReqRes/postsCreateAndPutModel";
import {_delete_all_} from "../typeForReqRes/blogsCreateAndPutModel";
import {PostsService} from "../domain/posts-service";
import {authGuardMiddleware} from "../middleware/authGuardMiddleware";
import {commentValidation, postsValidation} from "../middleware/inputValidationMiddleware";
import {errorsValidation} from "../middleware/errorsValidation";
import {QueryBlogRequestType} from "../model/blogsType/blogsView";
import {QueryPostRequestType, SortPostRepositoryType} from "../model/postsType/postsView";
import {PostsQueryRepository} from "../repositoriesQuery/posts-query-repository";
import {authTokenMiddleware} from "../middleware/authMiddleware/authTokenUser";
import {CommentsService} from "../domain/comments/comments-service";
import {CommentsQueryRepository} from "../repositoriesQuery/comments-query-repository";
import {QueryCommentsRequestType, SortCommentsRepositoryType} from "../model/commentsType/commentsView";
import {paginatorValidator} from "../middleware/sortingAndPaginationMiddleware";


export const postsRouter = Router({})
postsRouter
    .get('/:postId/comments',paginatorValidator,errorsValidation, async (req: Request, res: Response) => {
        const {postId} = req.params
        const query: QueryCommentsRequestType = req.query
        const sortData: SortCommentsRepositoryType = {
            sortBy: query.sortBy || "createdAt",
            sortDirection: query.sortDirection || "desc",
            pageNumber: query.pageNumber || 1,
            pageSize: query.pageSize || 10
        }

        const comments = await CommentsQueryRepository.getAllCommentsWithPosts(sortData, postId);
        const posts = await CommentsQueryRepository.getPostById(postId);
        if (!posts) {
            res.sendStatus(404); // Возвращаем статус 404, если blogId не найден
            return;
        }
        return res.status(200).json(comments);

    })
    .post('/:postId/comments', authTokenMiddleware,commentValidation,errorsValidation, async (req: RequestWithPut<postIdForComments, commentCreateContent>, res: Response) => {
        const {content} = req.body
        const {postId} = req.params

        if (!req.headers.authorization) {
            return res.status(401).send('Unauthorized');
        }
        const token = req.headers.authorization.split(' ')[1];
        const foundPostsFromRep = await PostsService.findPostsByID(postId)
        if (!foundPostsFromRep) {
            return res.sendStatus(404)
        }
        const foundPostId = foundPostsFromRep.id
        if (!foundPostId) {
            return res.sendStatus(404)
        }

        const newComment = await CommentsService.createComments(content, foundPostId, token)
        return res.status(201).send(newComment)

    })

    .get('/', async (req: RequestWithBlogsPOST<QueryPostRequestType>, res: Response) => {
        const query: QueryBlogRequestType = req.query
        const sortData: SortPostRepositoryType = {
            sortBy: query.sortBy || "createdAt",
            sortDirection: query.sortDirection || "desc",
            pageNumber: query.pageNumber || 1,
            pageSize: query.pageSize || 10
        }

        const posts = await PostsQueryRepository.getAllPosts(sortData);
        res.status(200).json(posts);
    })

    .post('/', authGuardMiddleware, postsValidation, errorsValidation, async (req: RequestWithPostsPOST<postsCreateAndPutModel>, res: Response) => {
        const newPostsFromRep = await PostsService
            .createPosts(req.body.title, req.body.shortDescription, req.body.content, req.body.blogId)//как сократить

        res.status(201).send(newPostsFromRep)
    })


    .get('/:id', async (req: Request, res: Response) => {
        const foundPostsFromRep = await PostsService.findPostsByID(req.params.id)
        if (!foundPostsFromRep) {
            res.sendStatus(404)
            return;
        } else {
            res.send(foundPostsFromRep)
            return
        }
    })

    .put('/:id', authGuardMiddleware, postsValidation, errorsValidation, async (req: Request, res: Response) => {
        const rB = req.body
        const isUpdatePosts = await PostsService.updatePosts(req.params.id, rB.title, rB.shortDescription, rB.content, rB.blogId)

        if (isUpdatePosts) {
            res.status(204).send()
            return
        }
        if (!isUpdatePosts) {
            res.status(404).send()
            return
        }

    })

    .delete('/:id', authGuardMiddleware, async (req: RequestWithDelete<_delete_all_>, res: Response) => {

        const isDelete = await PostsService.deletePosts(req.params.id)
        if (isDelete) {
            res.sendStatus(204)//Not Found
        } else {
            res.sendStatus(404)
        }
    })